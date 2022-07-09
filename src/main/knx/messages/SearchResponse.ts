import * as constants from "../utils/constants";
import * as knxSpec from "./structures/KNX_SPECIFICATION";
import { Message } from "./utils/Message";
import DIBHardwareStructure from "./structures/DIBHardwareStructure";
import DIBSupportedServiceFamilyStructure from "./structures/DIBSupportServiceFamilyStructure";
import HPAIStructure from "./structures/HPAIStructure";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.SEARCH_RESPONSE;

export default class SearchResponse extends Message {
  readonly hpaiStructure: HPAIStructure;
  readonly dibHardwareStructure: DIBHardwareStructure;
  readonly dibSupportedServiceFamilyStructure: DIBSupportedServiceFamilyStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiStructure = new HPAIStructure();
    this.dibHardwareStructure = new DIBHardwareStructure();
    this.dibSupportedServiceFamilyStructure = new DIBSupportedServiceFamilyStructure();
    this.structures.push(this.hpaiStructure, this.dibHardwareStructure, this.dibSupportedServiceFamilyStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiStructure.data.ProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
    this.hpaiStructure.data.IPAddress = constants.SERVER_IP_ADDRESS;
    this.hpaiStructure.data.Port = constants.SERVER_PORT;
    this.dibHardwareStructure.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.dibHardwareStructure.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.CORE);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.DEVICE_MANAGEMENT);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.TUNNELING);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.ROUTING);
  }
}
