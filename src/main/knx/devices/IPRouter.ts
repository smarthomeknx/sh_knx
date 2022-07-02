import dgram from "dgram";
import { STATUS_LOG } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./UDPDevice";

// export interface IPRouterSettings extends UDPDeviceSettings {
//   readonly ipAddress: string;
//   readonly ipPort: number;
//   readonly multicastIPAddress: string;
//   readonly multicastIPPort: number;
// }

export default class IPRouter extends UDPDevice<UDPDeviceSettings> {
  //readonly udpSocket: dgram.Socket;
  // readonly udpMulticastSocket: dgram.Socket;

  constructor(id: string, settings: UDPDeviceSettings) {
    super(id, settings);
    //this.udpSocket = dgram.createSocket("udp4");
    // this.udpMulticastSocket = dgram.createSocket("udp4");
  }

  async powerOn(): Promise<void> {
    this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_REQUEST, this.onSearchRequest);
    return this.startListener();
  }

  // private startListener() {
  //   this.udpSocket.on("listening", () => {
  //     STATUS_LOG.info(`UDP Server listening on ${this.udpSocket.address().address}:${this.udpSocket.address().port}`);
  //   });

  //   const messageHandler: UDPMessageHandler = new UDPMessageHandler(this.udpSocket, this);
  //   messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_REQUEST, this.onSearchRequest);

  //   this.udpSocket.bind(this.settings.ipPort, this.settings.ipAddress, () => {
  //     if (this.settings.multicast) {
  //       this.udpSocket.setBroadcast(true);
  //       this.udpSocket.setMulticastTTL(128);
  //       this.udpSocket.addMembership(this.settings.multicast.ipAddress, this.settings.ipAddress);
  //       STATUS_LOG.info(`UDP Server membership for multicasts at ${this.settings.multicast.ipAddress}`);
  //     }
  //   });
  // }

  // using arrow function to keep the class as this, as EventEmitter would have exchanged the this...
  onSearchRequest = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Handle SearchRequest");

    const searchRequest = new SearchRequest();
    UDPMessageHandler.setValuesFromBuffer(request, searchRequest);

    const answer = new SearchResponse();
    answer.setDefaultValues();
    this.fillDeviceInformationBlockStructure(answer.dibHardwareStructure);
    response.send(answer);
  };
}
