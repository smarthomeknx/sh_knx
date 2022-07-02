import dgram from "dgram";
import { STATUS_LOG } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler, { SPECIAL_TYPE } from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./UDPDevice";

export default class BusMonitor extends UDPDevice<UDPDeviceSettings> {
  constructor(id: string, settings: UDPDeviceSettings) {
    super(id, settings);
  }

  async powerOn(): Promise<void> {
    this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);
    this.messageHandler.addAllCallback(this.onAnyResponse);
    await this.startListener();
  }

  // private async startDirectListener() {
  //   this.udpSocket.on("listening", () => {
  //     STATUS_LOG.info(
  //       `UDP ETS Software listening on ${this.udpSocket.address().address}:${this.udpSocket.address().port}`
  //     );
  //   });

  //   //const messageHandler: UDPMessageHandler = new UDPMessageHandler(this.udpSocket, this);

  //   this.udpSocket.bind(this.settings.ipPort, this.settings.ipAddress, () => {
  //     this.enableSender(this.udpSocket);
  //     // this.udpSocket.setBroadcast(true);
  //     // this.udpSocket.setMulticastTTL(128);
  //     // this.udpSocket.addMembership(this.settings.multicastIPAddress, this.settings.ipAddress);
  //     //STATUS_LOG.info(`UDP Server membership for multicasts at ${this.settings.multicastIPAddress}`);
  //   });
  // }
  onAnyResponse = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle any response");

    //const incomingSearchResponse = new SearchResponse();
    //UDPMessageHandler.setValuesFromBuffer(request, incomingSearchResponse);
  };

  onSearchResponse = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle SearchResponse");

    const incomingSearchResponse = new SearchResponse();
    UDPMessageHandler.setValuesFromBuffer(request, incomingSearchResponse);
  };

  async triggerSearchRequest(): Promise<void> {
    const message: SearchRequest = new SearchRequest();
    message.setDefaultValues();
    message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
    message.hpaiStructure.data.Port = this.settings.ipPort;

    const buffer: Buffer = message.toBuffer();
    if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
    await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
    // this.udpSocket.send(
    //   buffer,
    //   0,
    //   buffer.length,
    //   this.settings.multicast.ipPort,
    //   this.settings.multicast.ipAddress,
    //   this.buildSentCallback(buffer, message.serviceType)
    // );
  }
}
