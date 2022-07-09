import * as knxSpec from "./KNX_SPECIFICATION";
import * as constants from "../../utils/constants";
import Field, { DOT_SEPERATED_BYTES_FIEDS, FieldValue, NUMBER_FIELDS, STRING_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";

const STRUCTURE_NAME = "ConnectionRequestInformation (CRI)";
//const STRUCTURE_LENGTH = // VARIABLE 0x36; //structure length (CRI)
const STRUCTURE_KEY = "ConnectionRequestInformationCRI";

interface ConnectionRequestInformationData extends StructureJsonObject {
  StructureLength: number;
  // TDODO DescriptionTypeCode: knxSpec.DESCRIPTION_TYPE_CODE;
  KNXMedium: knxSpec.KNX_MEDIUM_CODE;
  DeviceStatus: knxSpec.KNX_DEVICE_STATUS;
  KNXIndividualAddress: string;
  ProjectInstallationIdentifier: string;
  DeviceKNXSerialNumber: string;
  DeviceRoutingMulticastAddress: string;
  DeviceMACAddress: string;
  DeviceFriendlyName: string;
}

type ConnectionRequestInformationDataFieldConfigs = {
  [id in keyof ConnectionRequestInformationData]: Field<FieldValue>;
};
const CONFIG: ConnectionRequestInformationDataFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  DescriptionTypeCode: NUMBER_FIELDS.DescriptionTypeCode,
  KNXMedium: NUMBER_FIELDS.KNXMedium,
  DeviceStatus: NUMBER_FIELDS.DeviceStatus,
  KNXIndividualAddress: DOT_SEPERATED_BYTES_FIEDS.KNXIndividualAddress,
  ProjectInstallationIdentifier: DOT_SEPERATED_BYTES_FIEDS.ProjectInstallationIdentifier,
  DeviceKNXSerialNumber: DOT_SEPERATED_BYTES_FIEDS.DeviceKNXSerialNumber,
  DeviceRoutingMulticastAddress: DOT_SEPERATED_BYTES_FIEDS.DeviceRoutingMulticastAddress,
  DeviceMACAddress: DOT_SEPERATED_BYTES_FIEDS.DeviceMACAddress,
  DeviceFriendlyName: STRING_FIELDS.DeviceFriendlyName
};
export default class ConnectionRequestInformationStructure extends JSONStructure<ConnectionRequestInformationData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    // TODO this.data.StructureLength = STRUCTURE_LENGTH;
    this.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.data.DeviceStatus = knxSpec.KNX_DEVICE_STATUS.PROG_MODE_OFF;
    this.data.DeviceRoutingMulticastAddress = constants.MULTICAST_IP_ADDRESS;
  }
}
