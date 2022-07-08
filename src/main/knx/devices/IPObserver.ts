import dgram from "dgram";

import { STATUS_LOG } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import { Message } from "../messages/utils/Message";
import UDPMessageHandler from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./base/UDPDevice";
//import RawStructure from "../messages/knx/RawStructure";

export interface IPObserverSettings extends UDPDeviceSettings {
  readonly ipAddress: string;
  readonly ipPort: number;
  readonly forwardIPAddress: string;
  readonly forwardIPPort: number;
  readonly multicastIPAddress: string;
  //  readonly multicastIPPort: number;
}

// function isFish(pet: Fish | Bird): pet is Fish {
//   return (pet as Fish).swim !== undefined;
// }

// export function isIPRouterSettings(settings: IPRouterSettings | DeviceSettings): settings is IPRouterSettings {
//   return settings.type
// }
const buildRequestHandler = (
  name: string,
  forwardToIPAddress: string,
  forwardToIPPort: number,
  observerDeviceIPAddress?: string,
  observerDeviceIPPort?: number
) => {
  const onRequest = (request: UDPRequest, response: UDPResponse): void => {
    request.log.debug("Device %s is taking care of the message", name);
    response.targetAddress = forwardToIPAddress;
    response.targetPort = forwardToIPPort;

    const forwardMessage = new Message();
    const rawStructureLength = //forwardMessage.headerStructure.totalLength
      request.message.byteLength -
      (forwardMessage.headerStructure.bufferSize + forwardMessage.hpaiStructure.bufferSize);

    UDPMessageHandler.setValuesFromBuffer(request, forwardMessage);

    if (rawStructureLength > 0) {
      //const rawStructure = new RawStructure(rawStructureLength);
      //forwardMessage.structures.push(rawStructure);
    }

    // adjust HPAI Header to get in the middle of communication when answer observer is set
    if (observerDeviceIPAddress) {
      forwardMessage.hpaiStructure.data.IPAddress = observerDeviceIPAddress;
    }
    if (observerDeviceIPPort) {
      forwardMessage.hpaiStructure.data.Port = observerDeviceIPPort;
    }

    //this.fillDeviceInformationBlockStructure(answer.dibStructure);
    response.send(forwardMessage);
  };
  return onRequest;
};

export default class IPObserver extends UDPDevice<IPObserverSettings> {
  //readonly udpReceiverSocket: dgram.Socket;
  answerObserver: IPObserver | undefined;
  //readonly udpClientSocket: dgram.Socket;
  // readonly udpMulticastSocket: dgram.Socket;

  constructor(id: string, settings: IPObserverSettings) {
    super(id, settings);
    //this.udpReceiverSocket = dgram.createSocket("udp4");
    // this.udpMulticastSocket = dgram.createSocket("udp4");
  }

  async powerOn(): Promise<void> {
    const answerObserverIPAddress = this.answerObserver ? this.answerObserver.settings.ipAddress : undefined;
    const answerObserverIPPort = this.answerObserver ? this.answerObserver.settings.ipPort : undefined;

    this.messageHandler.addHighlanderCallback(
      buildRequestHandler(
        this.constructor.name,
        this.settings.forwardIPAddress,
        this.settings.forwardIPPort,
        answerObserverIPAddress,
        answerObserverIPPort
      )
    );
    //this.startListener(this.udpReceiverSocket, this.settings.ipAddress, this.settings.ipPort, this.id);
    this.startListener();
  }

  // private startListener(socket: dgram.Socket, ipAddress: string, ipPort: number, name: string) {
  //   socket.on("listening", () => {
  //     STATUS_LOG.info(`UDP Observer ${name} listening on ${socket.address().address}:${socket.address().port}`);
  //   });

  //   const answerObserverIPAddress = this.answerObserver ? this.answerObserver.settings.ipAddress : undefined;
  //   const answerObserverIPPort = this.answerObserver ? this.answerObserver.settings.ipPort : undefined;

  //   const messageHandler: UDPMessageHandler = new UDPMessageHandler(socket, this);
  //   messageHandler.addHighlanderCallback(
  //     buildRequestHandler(
  //       this.constructor.name,
  //       this.settings.forwardIPAddress,
  //       this.settings.forwardIPPort,
  //       answerObserverIPAddress,
  //       answerObserverIPPort
  //     )
  //   );
  //   //messageHandler.addCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);

  //   socket.bind(ipPort, ipAddress, () => {
  //     socket.setBroadcast(true);
  //     socket.setMulticastTTL(128);
  //     socket.addMembership(this.settings.multicastIPAddress, ipAddress);
  //     STATUS_LOG.info(
  //       `UDP Observer ${name} membership for multicasts at ${this.settings.multicastIPAddress} to ${ipAddress}`
  //     );
  //   });
  // }

  // using arrow function to keep the class as this, as EventEmitter would have exchanged the this...
}
