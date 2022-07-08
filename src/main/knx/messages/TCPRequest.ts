import * as net from "net";
import { Logger } from "winston";
import { createRequestLogger, RequestLogData } from "../utils/logging";
import { v4 as uuidv4 } from "uuid";
import HeaderStructure from "./structures/HeaderStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";
import { RemoteInfo } from "../utils/types";

export default class TCPRequest {
  readonly id: string;
  requestLogData: Partial<RequestLogData>;
  log: Logger;
  constructor(readonly message: Buffer, readonly info: RemoteInfo) {
    this.id = uuidv4();
    this.requestLogData = {
      messageID: this.id,
      source: { ipAddress: info.ipAddress, port: info.port },
      serviceType: "NOT IDENTIFIED"
    };
    this.log = createRequestLogger(this.requestLogData);
  }

  identifyMessage(): knxSpec.SERVICE_TYPE {
    const header = new HeaderStructure();
    try {
      header.fromBuffer(this.message);
      this.requestLogData.serviceType = header.data.ServiceType
        ? knxSpec.SERVICE_TYPE[header.data.ServiceType]
        : knxSpec.SERVICE_TYPE[knxSpec.SERVICE_TYPE.UNDEFINED];
      // this.log = this.log.child({
      //   serviceType: header.serviceType ? knxSpec.SERVICE_TYPE[header.serviceType] : knxSpec.SERVICE_TYPE.UNDEFINED
      // });
      return header.data.ServiceType || knxSpec.SERVICE_TYPE.UNDEFINED;
    } catch (e) {
      this.log.warn("Can't identify message, using %s: %s", knxSpec.SERVICE_TYPE[knxSpec.SERVICE_TYPE.UNDEFINED], e);
      return knxSpec.SERVICE_TYPE.UNDEFINED;
    }
  }
}
