import dgram from "dgram";
import { promisify } from "util";
import { Logger } from "winston";
import { logBuffer, STATUS_LOG } from "../utils/logging";
import { createUDBDeviceLogger, UDPMessage } from "../utils/UDPDeviceLogger";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPMessageHandler from "../messages/utils/UDPMessageHandler";
import Device, { DeviceSettings } from "./Device";

export interface UDPDeviceSettings extends DeviceSettings {
  readonly ipAddress: string;
  readonly ipPort: number;
  readonly multicast?: {
    readonly ipAddress: string;
    readonly ipPort: number;
  };
}

export type SentCallbackType = (error: Error | null, bytes: number) => void;
export type SentType = (msg: Buffer, offset: number, length: number, port: number, address: string) => void;

export default abstract class UDBDevice<Type extends UDPDeviceSettings> extends Device<UDPDeviceSettings> {
  readonly udpLogger: Logger;
  readonly udpSocket: dgram.Socket;
  readonly messageHandler: UDPMessageHandler;
  innerSend?: SentType;
  constructor(readonly id: string, readonly settings: Type) {
    super(id, settings);
    this.udpLogger = createUDBDeviceLogger(settings);
    this.udpSocket = dgram.createSocket("udp4");
    this.messageHandler = new UDPMessageHandler(this.udpSocket, this);
    //const promisedSend = promisify<Buffer, number, number, number, string>(this.udpSocket.send).bind(this.udpSocket);
    //await promisedSend(buffer, 0, buffer.length, this.request.info.port, this.request.info.address);
  }

  enableSender = (udpSocket: dgram.Socket): void => {
    this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
  };

  startListener = async (): Promise<void> => {
    this.udpSocket.on("listening", () => {
      STATUS_LOG.info(
        `UDPDevice ${this.settings.friendlyName} listening on ${this.udpSocket.address().address}:${
          this.udpSocket.address().port
        }`
      );
    });
    const bind = promisify<number, string>(this.udpSocket.bind).bind(this.udpSocket);
    await bind(this.settings.ipPort, this.settings.ipAddress);
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

  // buildSentCallback(buffer: Buffer, serviceType: SERVICE_TYPE): SentCallbackType {
  //   return (error: Error | null, bytes: number) => {
  //     const udpMessage: UDPMessage = {
  //       direction: "INCOMING",
  //       remote: { address: this.settings.multicast?.ipAddress, port: this.settings.multicast?.ipPort },
  //       buffer: buffer,
  //       serviceType: SERVICE_TYPE[serviceType]
  //     };
  //     if (error) {
  //       this.udpLogger.warn("sent error: %s", error, { udpMessage: udpMessage });
  //       throw error;
  //     } else {
  //       this.udpLogger.info("sent success: %s bytes", bytes, { udpMessage: udpMessage });
  //     }
  //     // MESSAGE_LOG.info(
  //     //   "SENT MESSAGE TO %s:%s TYPE %s: %s\n%s",
  //     //   this.settings.multicastIPAddress,
  //     //   this.settings.multicastIPPort,
  //     //   SERVICE_TYPE[message.serviceType],
  //     //   logBuffer(buffer),
  //     //   yaml.dump(message.toJSON(false))
  //     // );
  //     // console.log(
  //     //   `SENT to ${this.settings.multicastIPAddress}:${this.settings.multicastIPPort} MSG: ${buffer.toString("hex")}`
  //     // );
  //     //client.close();
  //   };
  // }
}
