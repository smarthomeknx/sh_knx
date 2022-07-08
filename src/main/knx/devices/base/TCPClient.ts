//import dgram from "dgram";
import * as net from "net";
import { promisify } from "util";
import { Logger } from "winston";
import { logBuffer, STATUS_LOG } from "../../utils/logging";
import { createTCPClientLogger, TCPMessage } from "../../utils/TCPClientLogger";
import { SERVICE_TYPE } from "../../messages/structures/KNX_SPECIFICATION";
import TCPMessageHandler from "../../messages/utils/TCPMessageHandler";
import Device, { DeviceSettings } from "./Device";

// export interface TCPClientSettings extends DeviceSettings {
//   readonly remote: {
//     host: string;
//     port: number;
//   };
// }

// export type SentCallbackType = (error: Error | null, bytes: number) => void;
// export type SentType = (msg: Buffer, offset: number, length: number, port: number, address: string) => void;

// export default class TCPDevice<Type extends TCPClientSettings> extends Device<TCPClientSettings> {
//   readonly tcpLogger: Logger;
//   readonly tcpSocket: net.Socket;
//   readonly messageHandler: TCPMessageHandler;
//   //innerSend?: SentType;

//   constructor(readonly id: string, readonly settings: Type) {
//     super(id, settings);
//     this.tcpLogger = createTCPClientLogger(settings);
//     this.tcpSocket = new net.Socket();
//     this.messageHandler = new TCPMessageHandler(this.tcpSocket, this);
//     //const promisedSend = promisify<Buffer, number, number, number, string>(this.udpSocket.send).bind(this.udpSocket);
//     //await promisedSend(buffer, 0, buffer.length, this.request.info.port, this.request.info.address);
//   }

//   async connect(): Promise<void> {
//     //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
//     //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
//     this.tcpSocket.setKeepAlive(true);
//     await this.tcpSocket.connect(this.settings.remote.port, this.settings.remote.host, () => {
//       STATUS_LOG.info("Established TCP Connection to %s:%s", this.settings.remote.host, this.settings.remote.port);
//     });

//     this.tcpSocket.on("data", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} data on ${this.tcpSocket.localAddress} for messages from: ${this.tcpSocket.remoteAddress}`
//       );
//     });

//     this.tcpSocket.on("close", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} disconnected ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
//       );
//     });

//     this.tcpSocket.on("timeout", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} timed out ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
//       );
//     });
//   }

//   async write(serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
//     if (!this.tcpSocket.writable) {
//       throw Error("Socket is not writeable. The socket must be connected.");
//     }
//     const tcpMessage: TCPMessage = {
//       direction: "OUTGOING",
//       //remote: { address: this.tcpSocket.remoteAddress, port: this.tcpSocket.remotePort },
//       remote: this.settings.remote,
//       //   host: this.settings.remote.host,
//       //   port: this.settings.remote.port
//       // },
//       buffer: msg,
//       serviceType: SERVICE_TYPE[serviceType]
//     };
//     try {
//       const result = await this.tcpSocket.write(msg);
//       this.tcpLogger.info("WRITE compleded successfully -> %s, bytes: %s", result, logBuffer(msg), {
//         tcpMessage: tcpMessage
//       });
//     } catch (error) {
//       this.tcpLogger.warn("WRITE error: %s", error, { tcpMessage: tcpMessage });
//       throw error;
//     }
//   }

//   async connectWrite(serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
//     //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
//     //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
//     this.tcpSocket.setKeepAlive(true);
//     await this.tcpSocket.connect(this.settings.remote.port, this.settings.remote.host, async () => {
//       STATUS_LOG.info(
//         "Established TCP Connection to %s:%s, start writing...",
//         this.settings.remote.host,
//         this.settings.remote.port
//       );
//       await this.write(serviceType, msg);
//     });

//     this.tcpSocket.on("data", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} data on ${this.tcpSocket.localAddress} for messages from: ${this.tcpSocket.remoteAddress}`
//       );
//     });

//     this.tcpSocket.on("close", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} disconnected ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
//       );
//     });

//     this.tcpSocket.on("timeout", () => {
//       STATUS_LOG.info(
//         `TCPClient ${this.settings.friendlyName} timed out ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
//       );
//     });
//   }
// }
