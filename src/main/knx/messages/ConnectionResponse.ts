import ConnectionResponseBaseStructure from "./structures/ConnectionResponseBaseStructure";
import ConnectionResponseDataStructure from "./structures/ConnectionResponseDataStructure";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.CONNECT_RESPONSE;
export default class ConnectionResponse extends Message {
  //readonly hpaiControlStructure: HPAIStructure;
  readonly connectionResponseBaseStructure: ConnectionResponseBaseStructure;
  readonly hpaiEndpointStructure: HPAIStructure;
  readonly connectionResponseDataStructure: ConnectionResponseDataStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.connectionResponseBaseStructure = new ConnectionResponseBaseStructure();
    this.hpaiEndpointStructure = new HPAIStructure();
    this.connectionResponseDataStructure = new ConnectionResponseDataStructure();
    this.structures.push(
      this.connectionResponseBaseStructure,
      this.hpaiEndpointStructure,
      this.connectionResponseDataStructure
    );
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    // this.hpaiControlStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
  }
}
