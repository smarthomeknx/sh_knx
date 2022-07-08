import dgram from "dgram";
import { promisify } from "util";
import { Logger } from "winston";
import { logBuffer, STATUS_LOG, TRACE } from "../../utils/logging";
import { createUDBDeviceLogger, UDPMessage } from "../../utils/UDPDeviceLogger";
import { SERVICE_TYPE } from "../../messages/structures/KNX_SPECIFICATION";
import UDPMessageHandler from "../../messages/utils/UDPMessageHandler";
import Device, { DeviceSettings } from "./Device";
import SearchRequest from "../../messages/SearchRequest";
import UDPRequest from "../../messages/UDPRequest";
import SearchResponse from "../../messages/SearchResponse";
import UDPResponse from "../../messages/UDPResponse";

const DEFAULT_SEARCH_TIMEOUT = 10000; // 10 seconds

export interface UDPDeviceSettings extends DeviceSettings {
  readonly ipAddress: string;
  readonly port: number;
  readonly multicast?: {
    readonly ipAddress: string;
    readonly port: number;
  };
  readonly searchTimeout?: number;
}

export type SentCallbackType = (error: Error | null, bytes: number) => void;
export type SentType = (msg: Buffer, offset: number, length: number, port: number, address: string) => void;

//export type RawMessageHandlerCallback = (request: UDPRequest, response: UDPResponse) => void;
export type SearchResponseCallback = (request: UDPRequest, response: UDPResponse, content: SearchResponse) => void;

export default class UDBDevice<Type extends UDPDeviceSettings> extends Device<UDPDeviceSettings> {
  readonly udpLogger: Logger;
  readonly udpSocket: dgram.Socket;
  readonly messageHandler: UDPMessageHandler;
  readonly defaultSearchTimeout: number;
  pendingSearchResponseSince = -1;
  innerSend?: SentType;
  searchResponseCallback?: SearchResponseCallback;

  constructor(readonly id: string, readonly settings: Type) {
    super(id, settings);
    this.udpLogger = createUDBDeviceLogger(settings);
    this.udpSocket = dgram.createSocket("udp4");
    this.messageHandler = new UDPMessageHandler(this.udpSocket, this);
    this.defaultSearchTimeout = settings.searchTimeout || DEFAULT_SEARCH_TIMEOUT;
    //const promisedSend = promisify<Buffer, number, number, number, string>(this.udpSocket.send).bind(this.udpSocket);
    //await promisedSend(buffer, 0, buffer.length, this.request.info.port, this.request.info.address);
  }

  enableSender = (udpSocket: dgram.Socket): void => {
    this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
  };

  startListener = async (): Promise<void> => {
    this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);

    this.udpSocket.on("listening", () => {
      STATUS_LOG.info(
        `UDPDevice ${this.settings.friendlyName} listening on ${this.udpSocket.address().address}:${
          this.udpSocket.address().port
        }`
      );
    });
    const bind = promisify<number, string>(this.udpSocket.bind).bind(this.udpSocket);
    await bind(this.settings.port, this.settings.ipAddress);
    if (this.settings.multicast) {
      this.udpSocket.setBroadcast(true);
      this.udpSocket.setMulticastTTL(128);
      this.udpSocket.addMembership(this.settings.multicast.ipAddress, this.settings.ipAddress);
      STATUS_LOG.info(
        `UDPDevice ${this.settings.friendlyName} membership for multicasts at ${this.settings.multicast.ipAddress}`
      );
    }
    this.enableSender(this.udpSocket);
    STATUS_LOG.info(`UDPDevice ${this.settings.friendlyName} enabled sender`);
  };

  async triggerSearchRequest(): Promise<void> {
    const message: SearchRequest = new SearchRequest();
    message.setDefaultValues();
    message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
    message.hpaiStructure.data.Port = this.settings.port;
    // don't change the port, seems 3671 is default from KNX: message.hpaiStructure.data.Port = this.settings.ipPort;

    const buffer: Buffer = message.toBuffer();
    if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
    await this.send(message.serviceType, buffer, this.settings.multicast.port, this.settings.multicast.ipAddress);
  }

  onSearchResponse = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle SearchResponse");
    if (this.pendingSearchResponseSince < 0) {
      request.log.debug("Ignoring SearchResponse because no pending search request from this device");
      return;
    }

    const responseDelay = Date.now() - this.pendingSearchResponseSince;
    TRACE.debug(`SearchResponse arrived ${responseDelay} ms after request`);
    if (responseDelay > this.defaultSearchTimeout) {
      request.log.info(
        `Ignoring SearchResponse because pending search request from this device was timed out after ${this.defaultSearchTimeout}`
      );
      return;
    }

    if (this.searchResponseCallback) {
      const incomingSearchResponse = new SearchResponse();
      UDPMessageHandler.setValuesFromBuffer(request, incomingSearchResponse);
      TRACE.debug(`SearchResponse: \n${incomingSearchResponse.toYAML(false)}`);
      //this.searchResponses.push(incomingSearchResponse);
      this.udpLogger.info(
        "Received search response from %s:%s",
        incomingSearchResponse.hpaiStructure.data.IPAddress,
        incomingSearchResponse.hpaiStructure.data.Port
      );
      this.searchResponseCallback(request, response, incomingSearchResponse);
    } else {
      TRACE.debug(`Message is not casted to SearchResponse as no callback is provided`);
    }
  };

  async send(serviceType: SERVICE_TYPE, msg: Buffer, port: number, address: string): Promise<void> {
    if (!this.innerSend) {
      throw Error("Sender not enabled. The socket must be provicded with enableSender(...) call.");
    }
    const udpMessage: UDPMessage = {
      direction: "OUTGOING",
      remote: { address: address, port: port },
      buffer: msg,
      serviceType: SERVICE_TYPE[serviceType]
    };
    try {
      const result = await this.innerSend(msg, 0, msg.length, port, address);
      this.udpLogger.info("SENT success %s bytes: %s", result, logBuffer(msg), { udpMessage: udpMessage });
    } catch (error) {
      this.udpLogger.warn("SENT error: %s", error, { udpMessage: udpMessage });
      throw error;
    }
  }
}
