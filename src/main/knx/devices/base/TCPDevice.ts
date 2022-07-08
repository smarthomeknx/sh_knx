//import dgram from "dgram";
import * as net from "net";
import { promisify } from "util";
import { Logger } from "winston";
import { logBuffer, STATUS_LOG } from "../../utils/logging";
import { createTCPClientLogger, TCPMessage } from "../../utils/TCPDeviceLogger";
import { SERVICE_TYPE } from "../../messages/structures/KNX_SPECIFICATION";
import TCPMessageHandler from "../../messages/utils/TCPMessageHandler";
import Device, { DeviceSettings } from "./Device";
import DescriptionRequest from "../../messages/DescriptionRequest";
import { RemoteInfo } from "../../utils/types";

export interface TCPDeviceSettings extends DeviceSettings {
  readonly local: {
    ipAddress: string;
    port: number;
  };
}

export type SentCallbackType = (error: Error | null, bytes: number) => void;
export type SentType = (msg: Buffer, offset: number, length: number, port: number, address: string) => void;

export default class TCPDevice<Type extends TCPDeviceSettings> extends Device<TCPDeviceSettings> {
  readonly tcpLogger: Logger;
  readonly tcpSocket: net.Socket;
  readonly tcpServer: net.Server;
  readonly messageHandler: TCPMessageHandler;

  constructor(readonly id: string, readonly settings: Type) {
    super(id, settings);
    this.tcpLogger = createTCPClientLogger(settings);
    this.tcpSocket = new net.Socket();
    this.tcpServer = new net.Server();
    this.messageHandler = new TCPMessageHandler(this.tcpSocket, this);
    //const promisedSend = promisify<Buffer, number, number, number, string>(this.udpSocket.send).bind(this.udpSocket);
    //await promisedSend(buffer, 0, buffer.length, this.request.info.port, this.request.info.address);
  }

  async listen(): Promise<void> {
    this.tcpServer.listen(this.settings.local.port + 1, () => {
      STATUS_LOG.info(
        `TCPDevice ${this.settings.friendlyName} listening on ${this.tcpServer.address()} (config:${
          this.settings.local.port + 1
        })`
      );
    });

    this.tcpServer.on("error", (err) => {
      STATUS_LOG.info(`TCPDevice ${this.settings.friendlyName} error occured: \n${err}`);
    });

    this.tcpServer.on("end", () => {
      STATUS_LOG.info(`TCPDevice ${this.settings.friendlyName} client disconneted`);
    });
  }

  // async connect(): Promise<void> {
  //   //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
  //   //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
  //   this.tcpSocket.setKeepAlive(true);
  //   await this.tcpSocket.connect(this.settings.remote.port, this.settings.remote.ipAddress, () => {
  //     STATUS_LOG.info("Established TCP Connection to %s:%s", this.settings.remote.ipAddress, this.settings.remote.port);
  //   });

  //   this.tcpSocket.on("data", () => {
  //     STATUS_LOG.info(
  //       `TCPClient ${this.settings.friendlyName} data on ${this.tcpSocket.localAddress} for messages from: ${this.tcpSocket.remoteAddress}`
  //     );
  //   });

  //   this.tcpSocket.on("close", () => {
  //     STATUS_LOG.info(
  //       `TCPClient ${this.settings.friendlyName} disconnected ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
  //     );
  //   });

  //   this.tcpSocket.on("timeout", () => {
  //     STATUS_LOG.info(
  //       `TCPClient ${this.settings.friendlyName} timed out ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
  //     );
  //   });
  // }

  async write(remote: RemoteInfo, serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
    if (!this.tcpSocket.writable) {
      throw Error("Socket is not writeable. The socket must be connected.");
    }
    const tcpMessage: TCPMessage = {
      direction: "OUTGOING",
      //remote: { address: this.tcpSocket.remoteAddress, port: this.tcpSocket.remotePort },
      remote: remote,
      //   host: this.settings.remote.host,
      //   port: this.settings.remote.port
      // },
      buffer: msg,
      serviceType: SERVICE_TYPE[serviceType]
    };
    try {
      const result = await this.tcpSocket.write(msg);
      this.tcpLogger.info("WRITE compleded successfully -> %s, bytes: %s", result, logBuffer(msg), {
        tcpMessage: tcpMessage
      });
    } catch (error) {
      this.tcpLogger.warn("WRITE error: %s", error, { tcpMessage: tcpMessage });
      throw error;
    }
  }

  async connectAndWrite(remote: RemoteInfo, serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
    //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
    //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
    // if (!this.settings.remote) {
    //   throw new Error(`No remote server defined. Please ensure to provide remote ip address and port!`);
    // }
    this.tcpSocket.setKeepAlive(true);
    await this.tcpSocket.connect(remote.port, remote.ipAddress, async () => {
      STATUS_LOG.info("Established TCP Connection to %s:%s, start writing...", remote.ipAddress, remote.port);
      await this.write(remote, serviceType, msg);
    });

    this.tcpSocket.on("data", () => {
      STATUS_LOG.info(
        `TCPClient ${this.settings.friendlyName} data on ${this.tcpSocket.localAddress} for messages from: ${this.tcpSocket.remoteAddress}`
      );
    });

    this.tcpSocket.on("close", () => {
      STATUS_LOG.info(
        `TCPClient ${this.settings.friendlyName} disconnected ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
      );
    });

    this.tcpSocket.on("timeout", () => {
      STATUS_LOG.info(
        `TCPClient ${this.settings.friendlyName} timed out ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
      );
    });
  }

  async triggerDescriptionRequest(remote: RemoteInfo): Promise<void> {
    // set the remote server from search response data:

    // this.settings.remote = {
    //   ipAddress: searchResponse.hpaiStructure.data.IPAddress,
    //   port: searchResponse.hpaiStructure.data.Port
    // };

    const message: DescriptionRequest = new DescriptionRequest();
    message.setDefaultValues();
    message.hpaiStructure.data.IPAddress = this.settings.local.ipAddress;
    message.hpaiStructure.data.Port = this.settings.local.port;
    const buffer: Buffer = message.toBuffer();
    //if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
    //await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
    // const settings: TCPDeviceSettings = {
    //   friendlyName: searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "",
    //   knxIndividualAddress: searchResponse.dibHardwareStructure.data.KNXIndividualAddress || "",
    //   knxSerialNumber: searchResponse.dibHardwareStructure.data.DeviceKNXSerialNumber || "",
    //   macAddress: searchResponse.dibHardwareStructure.data.DeviceMACAddress || "",
    //   projectInstallationID: searchResponse.dibHardwareStructure.data.ProjectInstallationIdentifier || "",
    //   type: searchResponse.dibHardwareStructure.data.DescriptionTypeCode + "" || "",
    //   remote: {
    //     host: searchResponse.hpaiStructure.data.IPAddress || "",
    //     port: searchResponse.hpaiStructure.data.Port || -1
    //   }
    //   port:
    //   //port
    // };
    //const client = new TCPDevice(searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "Anonymous", settings);
    //await client.connect();
    await this.connectAndWrite(remote, message.serviceType, buffer);
  }
}
