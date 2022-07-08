import dgram from "dgram";
import { STATUS_LOG, TRACE } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./base/UDPDevice";

export default class IPServer extends UDPDevice<UDPDeviceSettings> {
  constructor(id: string, settings: UDPDeviceSettings) {
    super(id, settings);
  }

  // use power one when the device is controlled activly
  // async powerOn(): Promise<void> {
  //   this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_REQUEST, this.onSearchRequest);
  //   return this.startListener();
  // }

  // using arrow function to keep the class as this, as EventEmitter would have exchanged the this...
  // onSearchRequest = (request: UDPRequest, response: UDPResponse): void => {
  //   request.log.debug("Handle SearchRequest");

  //   const searchRequest = new SearchRequest();
  //   UDPMessageHandler.setValuesFromBuffer(request, searchRequest);
  //   // TRACE.debug("Drop: %s", searchRequest.toYAML(false));

  //   const answer = new SearchResponse();
  //   answer.setDefaultValues();
  //   this.fillDeviceInformationBlockStructure(answer.dibHardwareStructure);
  //   response.send(answer);
  // };
}
