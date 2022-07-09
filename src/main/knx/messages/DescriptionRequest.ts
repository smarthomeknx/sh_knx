import * as constants from "../utils/constants";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.DESCRIPTION_REQUEST;

/**
 * toBuffer Example: 06100201000e0801c0a8018ac0a8
 */
export default class DescriptionRequest extends Message {
  readonly hpaiStructure: HPAIStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiStructure = new HPAIStructure();
    this.structures.push(this.hpaiStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
  }
}
