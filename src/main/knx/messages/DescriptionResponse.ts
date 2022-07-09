import * as knxSpec from "./structures/KNX_SPECIFICATION";
import { Message } from "./utils/Message";
import DIBHardwareStructure from "./structures/DIBHardwareStructure";
import DIBSupportedServiceFamilyStructure from "./structures/DIBSupportServiceFamilyStructure";
import DIBManufactorerDataStructure from "./structures/DIBManufactorerDataStructure";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.DESCRIPTION_RESPONSE;

export default class DescriptionResponse extends Message {
  readonly dibHardwareStructure: DIBHardwareStructure;
  readonly dibSupportedServiceFamilyStructure: DIBSupportedServiceFamilyStructure;
  readonly dibManufactorerData: DIBManufactorerDataStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.dibHardwareStructure = new DIBHardwareStructure();
    this.dibSupportedServiceFamilyStructure = new DIBSupportedServiceFamilyStructure();
    this.dibManufactorerData = new DIBManufactorerDataStructure(); // OPTIONAL
    this.structures.push(this.dibHardwareStructure, this.dibSupportedServiceFamilyStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.dibHardwareStructure.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.dibHardwareStructure.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.CORE);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.DEVICE_MANAGEMENT);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.TUNNELING);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.ROUTING);
  }
}
