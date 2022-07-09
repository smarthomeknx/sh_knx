import dgram from "dgram";
import yaml from "js-yaml";
import { promisify } from "util";
import { logBuffer } from "../utils/logging";
import UDPRequest from "../messages/UDPRequest";
import { Message } from "../messages/utils/Message";
import { SERVICE_TYPE } from "./structures/KNX_SPECIFICATION";

export default class UDPResponse {
  targetPort: number;
  targetAddress: string;

  constructor(readonly request: UDPRequest, readonly udpSocket: dgram.Socket) {
    this.targetPort = request.info.port;
    this.targetAddress = request.info.address;
  }

  async send(message: Message): Promise<void> {
    const buffer = message.toBuffer();
    const promisedSend = promisify<Buffer, number, number, number, string>(this.udpSocket.send).bind(this.udpSocket);
    await promisedSend(buffer, 0, buffer.length, this.request.info.port, this.request.info.address);
    this.request.log.info(
      "SENT MESSAGE TO %s:%s TYPE %s: %s\n%s",
      this.targetAddress,
      this.targetPort,
      SERVICE_TYPE[message.serviceType],
      logBuffer(buffer),
      message.toYAML(false)
    );
  }
}
