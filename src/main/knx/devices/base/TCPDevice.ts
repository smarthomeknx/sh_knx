//import dgram from "dgram";
import * as net from "net";
import { promisify } from "util";
import { Logger } from "winston";
import { logBuffer, STATUS_LOG, TRACE } from "../../utils/logging";
import { createTCPClientLogger, TCPMessage } from "../../utils/TCPDeviceLogger";
import { HOST_PROTOCOL_CODES, SERVICE_TYPE } from "../../messages/structures/KNX_SPECIFICATION";
import TCPMessageHandler from "../../messages/utils/TCPMessageHandler";
import Device, { DeviceSettings } from "./Device";
import DescriptionRequest from "../../messages/DescriptionRequest";
import { RemoteInfo } from "../../utils/types";
import TCPResponse from "../../messages/TCPResponse";
import TCPRequest from "../../messages/TCPRequest";
import ConnectionResponse from "../../messages/ConnectionResponse";
import ConnectionRequest from "../../messages/ConnectionRequest";

export interface TCPDeviceSettings extends DeviceSettings {
  ipAddress: string;
  port: number;
}

export type SentCallbackType = (error: Error | null, bytes: number) => void;
export type SentType = (msg: Buffer, offset: number, length: number, port: number, address: string) => void;
export type ConnectionResponseCallback = (
  request: TCPRequest,
  response: TCPResponse,
  content: ConnectionResponse
) => void;

export default class TCPDevice<Type extends TCPDeviceSettings> extends Device<TCPDeviceSettings> {
  readonly tcpLogger: Logger;
  client?: net.Socket;
  messageHandler?: TCPMessageHandler;
  connectionResponseCallback?: ConnectionResponseCallback;

  constructor(readonly id: string, readonly settings: Type) {
    super(id, settings);
    this.tcpLogger = createTCPClientLogger(settings);

    //this.messageHandler = new TCPMessageHandler(this.tcpSocket, this); // TODO listen methods adds listeners, too, not so beauty
  }

  async connectAndWrite(remote: RemoteInfo, serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
    //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
    //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
    // if (!this.settings.remote) {
    //   throw new Error(`No remote server defined. Please ensure to provide remote ip address and port!`);
    // }
    // this.tcpSocket.setKeepAlive(true);
    this.client = net.createConnection({ port: remote.port, host: remote.ipAddress }, async () => {
      STATUS_LOG.info("Established TCP Connection to %s:%s, adding listeners...", remote.ipAddress, remote.port);
      await this.listen();
      STATUS_LOG.info("Established TCP Connection to %s:%s, start writing...", remote.ipAddress, remote.port);
      await this.write(remote, serviceType, msg);
    });

    // await this.tcpSocket.connect(remote.port, remote.ipAddress, async () => {
    //   STATUS_LOG.info("Established TCP Connection to %s:%s, start writing...", remote.ipAddress, remote.port);
    //   await this.write(remote, serviceType, msg);
    // });
  }

  async listen(): Promise<void> {
    if (!this.client) {
      throw Error("Socket is connected.");
    }
    this.client.setKeepAlive(true);
    this.client.on("close", () => {
      STATUS_LOG.info("closed");
    });
    this.client.on("connect", () => {
      STATUS_LOG.info("connect");
    });
    this.client.on("ready", () => {
      STATUS_LOG.info("ready");
    });
    this.client.on("end", () => {
      STATUS_LOG.info("disconnected from server");
    });
    this.client.on("message", () => {
      STATUS_LOG.info("message from server");
    });
    this.client.on("timeout", () => {
      STATUS_LOG.info("timeout");
    });
    this.client.on("error", (error) => {
      STATUS_LOG.info("error: %s", error);
    });
    this.messageHandler = new TCPMessageHandler(this.client, this);
    STATUS_LOG.info("socket state: %s", this.client.readyState);
    // this.tcpSocket.on("data", () => {
    //   STATUS_LOG.info(
    //     `TCPClient ${this.settings.friendlyName} data on ${this.tcpSocket.localAddress} for messages from: ${this.tcpSocket.remoteAddress}`
    //   );
    // });

    // this.tcpSocket.on("close", () => {
    //   STATUS_LOG.info(`TCPClient ${this.settings.friendlyName} disconnected.`);
    // });

    // this.tcpSocket.on("timeout", () => {
    //   STATUS_LOG.info(
    //     `TCPClient ${this.settings.friendlyName} timed out ${this.tcpSocket.localAddress} from: ${this.tcpSocket.remoteAddress}`
    //   );
    // });

    // this.tcpServer.listen(this.settings.port + 1, () => {
    //   STATUS_LOG.info(
    //     `TCPDevice ${this.settings.friendlyName} listening on ${JSON.stringify(this.tcpServer.address())} (config:${
    //       this.settings.port + 1
    //     })`
    //   );
    // });
    // this.tcpServer.on("error", (err) => {
    //   STATUS_LOG.info(`TCPDevice ${this.settings.friendlyName} error occured: \n${err}`);
    // });
    // this.tcpServer.on("end", () => {
    //   STATUS_LOG.info(`TCPDevice ${this.settings.friendlyName} client disconneted`);
    // });
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
    if (!this.client) {
      throw Error("Socket is connected.");
    }
    if (!this.client.writable) {
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
      const result = await this.client.write(msg);
      this.tcpLogger.info("WRITE completed successfully -> %s, bytes: %s", result, logBuffer(msg), {
        tcpMessage: tcpMessage
      });
    } catch (error) {
      this.tcpLogger.warn("WRITE error: %s", error, { tcpMessage: tcpMessage });
      throw error;
    }
  }

  // async connectAndWrite(remote: RemoteInfo, serviceType: SERVICE_TYPE, msg: Buffer): Promise<void> {
  //   //this.innerSend = promisify<Buffer, number, number, number, string>(udpSocket.send).bind(udpSocket);
  //   //this.tcpSocket.connect(this.settings.targetIPPort, this.settings.targetIPAddress, ));
  //   // if (!this.settings.remote) {
  //   //   throw new Error(`No remote server defined. Please ensure to provide remote ip address and port!`);
  //   // }
  //   this.tcpSocket.setKeepAlive(true);
  //   await this.tcpSocket.connect(remote.port, remote.ipAddress, async () => {
  //     STATUS_LOG.info("Established TCP Connection to %s:%s, start writing...", remote.ipAddress, remote.port);
  //     await this.write(remote, serviceType, msg);
  //   });
  // }

  async triggerConnectionRequest(remote: RemoteInfo): Promise<void> {
    const message: ConnectionRequest = new ConnectionRequest();
    message.setDefaultValues();
    message.hpaiEndpointStructure.data.IPAddress = remote.ipAddress;
    message.hpaiEndpointStructure.data.Port = remote.port;
    message.hpaiEndpointStructure.data.HostProtocolCode = HOST_PROTOCOL_CODES.IPV4_TCP;
    message.hpaiControlStructure.data.IPAddress = this.settings.ipAddress;
    message.hpaiControlStructure.data.Port = this.settings.port;
    message.hpaiControlStructure.data.HostProtocolCode = HOST_PROTOCOL_CODES.IPV4_TCP;
    // don't change the port, seems 3671 is default from KNX: message.hpaiStructure.data.Port = this.settings.ipPort;

    const buffer: Buffer = message.toBuffer();

    await this.connectAndWrite(remote, message.serviceType, buffer);
  }

  onConnectionResponse = (request: TCPRequest, response: TCPResponse): void => {
    request.log.debug("Handle ConnectionResponse");

    if (this.connectionResponseCallback) {
      const incomingConnectionResponse = new ConnectionResponse();
      TCPMessageHandler.setValuesFromBuffer(request, incomingConnectionResponse);
      TRACE.debug(`ConnectionResponse: \n${incomingConnectionResponse.toYAML(false)}`);
      this.tcpLogger.info(
        "Received connection response from %s:%s",
        request.info.ipAddress, //incomingConnectionResponse.hpaiStructure.data.IPAddress,
        request.info.port //incomingConnectionResponse.hpaiStructure.data.Port
      );
      this.connectionResponseCallback(request, response, incomingConnectionResponse);
    } else {
      TRACE.debug(`Message is not casted to ConnectionResponse as no callback is provided`);
    }
  };

  // async triggerDescriptionRequest(remote: RemoteInfo): Promise<void> {
  //   // set the remote server from search response data:

  //   // this.settings.remote = {
  //   //   ipAddress: searchResponse.hpaiStructure.data.IPAddress,
  //   //   port: searchResponse.hpaiStructure.data.Port
  //   // };

  //   const message: DescriptionRequest = new DescriptionRequest();
  //   message.setDefaultValues();
  //   message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
  //   message.hpaiStructure.data.Port = this.settings.port;
  //   const buffer: Buffer = message.toBuffer();
  //   //if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
  //   //await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
  //   // const settings: TCPDeviceSettings = {
  //   //   friendlyName: searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "",
  //   //   knxIndividualAddress: searchResponse.dibHardwareStructure.data.KNXIndividualAddress || "",
  //   //   knxSerialNumber: searchResponse.dibHardwareStructure.data.DeviceKNXSerialNumber || "",
  //   //   macAddress: searchResponse.dibHardwareStructure.data.DeviceMACAddress || "",
  //   //   projectInstallationID: searchResponse.dibHardwareStructure.data.ProjectInstallationIdentifier || "",
  //   //   type: searchResponse.dibHardwareStructure.data.DescriptionTypeCode + "" || "",
  //   //   remote: {
  //   //     host: searchResponse.hpaiStructure.data.IPAddress || "",
  //   //     port: searchResponse.hpaiStructure.data.Port || -1
  //   //   }
  //   //   port:
  //   //   //port
  //   // };
  //   //const client = new TCPDevice(searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "Anonymous", settings);
  //   //await client.connect();
  //   await this.connectAndWrite(remote, message.serviceType, buffer);
  // }

  //   async send(serviceType: SERVICE_TYPE, msg: Buffer, port: number, address: string): Promise<void> {
  //     if (!this.innerSend) {
  //       throw Error("Sender not enabled. The socket must be provicded with enableSender(...) call.");
  //     }
  //     const udpMessage: UDPMessage = {
  //       direction: "OUTGOING",
  //       remote: { address: address, port: port },
  //       buffer: msg,
  //       serviceType: SERVICE_TYPE[serviceType]
  //     };
  //     try {
  //       const result = await this.innerSend(msg, 0, msg.length, port, address);
  //       this.udpLogger.info("SENT success %s bytes: %s", result, logBuffer(msg), { udpMessage: udpMessage });
  //     } catch (error) {
  //       this.udpLogger.warn("SENT error: %s", error, { udpMessage: udpMessage });
  //       throw error;
  //     }
  //   }
  // }
}
