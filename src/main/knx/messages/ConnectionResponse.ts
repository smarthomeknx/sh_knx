import ConnectionResponseInformationStructure from "./structures/ConnectionResponseInformationStructure";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.CONNECT_RESPONSE;
export default class ConnectionResponse extends Message {
  readonly hpaiControlStructure: HPAIStructure;
  readonly hpaiEndpointStructure: HPAIStructure;
  readonly connectionResponseInfoStructure: ConnectionResponseInformationStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiControlStructure = new HPAIStructure();
    this.hpaiEndpointStructure = new HPAIStructure();
    this.connectionResponseInfoStructure = new ConnectionResponseInformationStructure();
    this.structures.push(this.hpaiControlStructure, this.hpaiEndpointStructure, this.connectionResponseInfoStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiControlStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
  }
}
