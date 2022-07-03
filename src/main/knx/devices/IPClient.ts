import dgram from "dgram";
import { STATUS_LOG, TRACE } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler, { SPECIAL_TYPE } from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./UDPDevice";

const SEARCH_TIMEOUT = 100000;

export default class IPClient extends UDPDevice<UDPDeviceSettings> {
  pendingSearchResponseSince = -1;
  searchResponses: SearchResponse[] = [];

  constructor(id: string, settings: UDPDeviceSettings) {
    super(id, settings);
  }

  async powerOn(): Promise<void> {
    this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);
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
    this.searchResponses.push(incomingSearchResponse);
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
    // check if answer or timeout
    //
  }

  /**
   * After a server is discovered the client should sent a
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
  describe = () => {
    // send description request
  };

  connect = () => {
    // connect
  };
}
