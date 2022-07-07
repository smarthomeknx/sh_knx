import * as net from "net";
import { promisify } from "util";
import { logBuffer } from "../utils/logging";
import { Message } from "./utils/Message";
import { SERVICE_TYPE } from "./structures/KNX_SPECIFICATION";
import TCPRequest from "./TCPRequest";

export default class TCPResponse {
  targetPort: number;
  targetAddress: string;

  constructor(readonly request: TCPRequest, readonly tcpSocket: net.Socket) {
    this.targetPort = request.info.port;
    this.targetAddress = request.info.host;
  }

  async write(message: Message): Promise<void> {
    const buffer = message.toBuffer();
    const promisedWrite = promisify<Buffer>(this.tcpSocket.write).bind(this.tcpSocket);
    await promisedWrite(buffer);
    this.request.log.info(
      "WRITTEN MESSAGE TO %s:%s TYPE %s: %s\n%s",
      this.targetAddress,
      this.targetPort,
      SERVICE_TYPE[message.serviceType],
      logBuffer(buffer),
      message.toYAML(false)
    );
  }
}
