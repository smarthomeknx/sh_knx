import dgram from "dgram";
import { STATUS_LOG, TRACE } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler, { SPECIAL_TYPE } from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./UDPDevice";
import TCPClient, { TCPClientSettings } from "./TCPClient";
import DescriptionRequest from "../messages/DescriptionRequest";
import DescriptionResponse from "../messages/DescriptionResponse";
import IPServer from "./IPServer";
//import winston from "winston";

const SEARCH_TIMEOUT = 100000;

export default class IPClient extends UDPDevice<UDPDeviceSettings> {
  //log: winston.Logger;
  pendingSearchResponseSince = -1;
  searchResponses: SearchResponse[] = [];

  constructor(id: string, settings: UDPDeviceSettings) {
    super(id, settings);
  }

  async powerOn(): Promise<void> {
    this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);
    this.messageHandler.addTypedCallback(SERVICE_TYPE.DESCRIPTION_RESPONSE, this.onDescriptionResponse);
    await this.startListener();
  }

  onSearchResponse = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle SearchResponse");
    if (this.pendingSearchResponseSince < 0) {
      request.log.debug("Ignoring SearchResponse because no pending search request from this device");
      return;
    }

    const responseDelay = Date.now() - this.pendingSearchResponseSince;
    TRACE.debug(`SearchResponse arrived ${responseDelay} ms after request`);
    if (responseDelay > SEARCH_TIMEOUT) {
      request.log.info(
        `Ignoring SearchResponse because pending search request from this device was timed out after ${SEARCH_TIMEOUT}`
      );
      return;
    }

    const incomingSearchResponse = new SearchResponse();
    UDPMessageHandler.setValuesFromBuffer(request, incomingSearchResponse);
    TRACE.debug(`SearchResponse: \n${incomingSearchResponse.toYAML(false)}`);
    //this.searchResponses.push(incomingSearchResponse);
    this.udpLogger.info(
      "Received search response from %s:%s",
      incomingSearchResponse.hpaiStructure.data.IPAddress,
      incomingSearchResponse.hpaiStructure.data.Port
    );
    // Start
    this.requestServerDescription(incomingSearchResponse);
  };

  onDescriptionResponse = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle DescriptionResponse");
    // if (this.pendingSearchResponseSince < 0) {
    //   request.log.debug("Ignoring SearchResponse because no pending search request from this device");
    //   return;
    // }

    // const responseDelay = Date.now() - this.pendingSearchResponseSince;
    // TRACE.debug(`SearchResponse arrived ${responseDelay} ms after request`);
    // if (responseDelay > SEARCH_TIMEOUT) {
    //   request.log.info(
    //     `Ignoring SearchResponse because pending search request from this device was timed out after ${SEARCH_TIMEOUT}`
    //   );
    //   return;
    // }

    const incomingDescriptionResponse = new DescriptionResponse();
    UDPMessageHandler.setValuesFromBuffer(request, incomingDescriptionResponse);
    TRACE.debug(`DescriptionResponse: \n${incomingDescriptionResponse.toYAML(false)}`);
    //this.searchResponses.push(incomingSearchResponse);
    this.udpLogger.info(
      "Received description response from %s:%s",
      incomingDescriptionResponse.hpaiStructure.data.IPAddress,
      incomingDescriptionResponse.hpaiStructure.data.Port
    );
    // Connect?
    //this.requestServerDescription(incomingSearchResponse);
  };

  async triggerSearchRequest(): Promise<void> {
    const message: SearchRequest = new SearchRequest();
    message.setDefaultValues();
    message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
    message.hpaiStructure.data.Port = this.settings.ipPort;
    // don't change the port, seems 3671 is default from KNX: message.hpaiStructure.data.Port = this.settings.ipPort;

    const buffer: Buffer = message.toBuffer();
    if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
    await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
  }

  async triggerDescriptionRequest(searchResponse: SearchResponse): Promise<void> {
    const message: DescriptionRequest = new DescriptionRequest();
    message.setDefaultValues();
    message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
    message.hpaiStructure.data.Port = this.settings.ipPort;
    // don't change the port, seems 3671 is default from KNX: message.hpaiStructure.data.Port = this.settings.ipPort;

    const buffer: Buffer = message.toBuffer();
    //if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
    //await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
    const settings: TCPClientSettings = {
      friendlyName: searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "",
      knxIndividualAddress: searchResponse.dibHardwareStructure.data.KNXIndividualAddress || "",
      knxSerialNumber: searchResponse.dibHardwareStructure.data.DeviceKNXSerialNumber || "",
      macAddress: searchResponse.dibHardwareStructure.data.DeviceMACAddress || "",
      projectInstallationID: searchResponse.dibHardwareStructure.data.ProjectInstallationIdentifier || "",
      type: searchResponse.dibHardwareStructure.data.DescriptionTypeCode + "" || "",
      remote: {
        host: searchResponse.hpaiStructure.data.IPAddress || "",
        port: searchResponse.hpaiStructure.data.Port || -1
      }
    };
    const client = new TCPClient(searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "Anonymous", settings);
    //await client.connect();
    await client.connectWrite(message.serviceType, buffer);
  }

  /**
   * The discory flow is implemented like:
   * client             server
   *   SEARCH_REQUEST ->
   *      <- SEARCH_RESPONSE
   *
   * The client waits until the response is received or for SEARCH_TIMEOUT
   * After that any response should be ignored unless a new SEARCH_REQUEST
   * is triggered.
   *
   * SEARCH_REQUESTS from other clients should be ignored
   */
  async discover(): Promise<void> {
    // triggerSearchRequest
    await this.triggerSearchRequest();
    this.pendingSearchResponseSince = Date.now();
    // set timeout to ignore search responses after the SEARCH_TIMEOUT
    setTimeout(() => {
      this.pendingSearchResponseSince = -1;
    }, SEARCH_TIMEOUT);
    this.udpLogger.info("Trigger search request with timeout %s", SEARCH_TIMEOUT);
    // check if answer or timeout
  }

  /**
   * After a server is discovered, the client should sent a
   * client               server
   *   DESCRIPTION_RQUEST -> (thorugh unicast or point to point)
   *   <- DESCRIPTION_RESPONSE
   *
   * Within this request the client should check if the server supports the
   * service requests.
   *
   * The description response from server should contain:
   * - supported protocol version
   * - own capabilities
   * - state information
   * - friendly connection name (optional)
   *
   * The server response should be related to each discovery request. The reason
   * is that the server may support connections to multiple KNX Subnetworks.
   *
   */
  async requestServerDescription(searchResponse: SearchResponse): Promise<IPServer> {
    // send description request
    await this.triggerDescriptionRequest(searchResponse);
    return new IPServer("fake", {
      type: "IPRouter",
      ipAddress: "192.168.1.138",
      ipPort: 3671,
      multicast: {
        ipAddress: "224.0.23.12",
        ipPort: 3671
      },
      knxIndividualAddress: "255.255",
      projectInstallationID: "00.01",
      knxSerialNumber: "0.250.0.0.0.1",
      macAddress: "06.06.06.03.14.71",
      friendlyName: "SMARTHOMEKNX.DE"
    });
  }

  async connect(server: IPServer) {
    // connect
  }
}
