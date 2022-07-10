import ConnectionRequestInformationStructure from "./structures/ConnectionRequestInformationStructure";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.CONNECT_REQUEST;
export default class ConnectionRequest extends Message {
  readonly hpaiControlStructure: HPAIStructure;
  readonly hpaiEndpointStructure: HPAIStructure;
  readonly connectionRequestInfoStructure: ConnectionRequestInformationStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiControlStructure = new HPAIStructure();
    this.hpaiEndpointStructure = new HPAIStructure();
    this.connectionRequestInfoStructure = new ConnectionRequestInformationStructure();
    this.structures.push(this.hpaiControlStructure, this.hpaiEndpointStructure, this.connectionRequestInfoStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiControlStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
    this.connectionRequestInfoStructure.setDefaultValues4TunnelConnection();
  }
}
