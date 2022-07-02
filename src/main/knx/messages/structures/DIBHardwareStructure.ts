import * as knxSpec from "./KNX_SPECIFICATION";
import * as constants from "../../utils/constants";
import Field, { DOT_SEPERATED_BYTES_FIEDS, FieldValue, NUMBER_FIELDS, STRING_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";

const STRUCTURE_NAME = "Hardware (DIB)";
const STRUCTURE_LENGTH = 0x36; //structure length (DIB hardware)
const STRUCTURE_KEY = "HardwareDIB";

interface DIBHardwareData extends StructureJsonObject {
  StructureLength: number;
  DescriptionTypeCode: knxSpec.DESCRIPTION_TYPE_CODE;
  KNXMedium: knxSpec.KNX_MEDIUM_CODE;
  DeviceStatus: knxSpec.KNX_DEVICE_STATUS;
  KNXIndividualAddress: string;
  ProjectInstallationIdentifier: string;
  DeviceKNXSerialNumber: string;
  DeviceRoutingMulticastAddress: string;
  DeviceMACAddress: string;
  DeviceFriendlyName: string;
}

type DIBHardwareDataFieldConfigs = { [id in keyof DIBHardwareData]: Field<FieldValue> };
const CONFIG: DIBHardwareDataFieldConfigs = {
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

// Device information (DIB)
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Structure Length            |   Description Type Code       |
// |   (1 octet)                   |   (1 octet)                   |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   KNX medium                  |   Device Status               |
// |   (1 Octet)                   |   (1 Octet)                   |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   KNX Individual Address                                      |
// |   (2 Octets)                                                  |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Project-Installation identifier                             |
// |   (2 Octets)                                                  |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   KNXnet/IP device KNX Serial Number                          |
// |   (6 octets)                                                  |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   KNXnet/IP device routing multicast address                  |
// |   (4 octets)                                                  |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   KNXnet/IP device MAC address                                |
// |   (6 octets)                                                  |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Device Friendly Name                                        |
// |   (30 octets)                                                 |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// ....
// |                                                               |
// +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
// |                                                               |
// |                                                               |
// +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
// EXAMPLE
//                                                                K N X   V I R T U A L   0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 36 01 02 00 ffff 0001 00fa00 000001 e000170c 06 06 06 03 0e 47 4b4e58205669727475616c20000000000000000000000000000000000000

export default class DIBHardwareStructure extends JSONStructure<DIBHardwareData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    this.data.StructureLength = STRUCTURE_LENGTH;
    this.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.data.DeviceStatus = knxSpec.KNX_DEVICE_STATUS.PROG_MODE_OFF;
    this.data.DeviceRoutingMulticastAddress = constants.MULTICAST_IP_ADDRESS;
  }
}

// const createDeviceIB = (knxIndividualAddress = 0xffff, projectInstallationID = 0x0001): Buffer => {
//   const msgBuffer = Buffer.alloc(knxSpec.STRUCTURE_LENGTH_DEVICE_IB); // TODO
//   msgBuffer.writeUInt8();
//   msgBuffer.writeUInt8(, 1); // Decription Type Code
//   msgBuffer.writeUInt8(, 2); // KNX medium
//   msgBuffer.writeUInt8(); // Device Status (each byte counts for something, maybe needs some calculation...)
//   msgBuffer.writeUInt16BE(, 4); // KNX Individual Address
//   msgBuffer.writeUInt16BE(, 6); // Project-Installation identifier
//   // Serial Number
//   constants.SERVER_SERIAL_NUMBER.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 8);
//   });

//   // Multicast IP Address
//   constants.SERVER_MULTICAST_IP_ADDRESS.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 14);
//   });

//   // MAC Address
//   constants.SERVER_MAC_ADDRESS.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 18);
//   });

//   // Friendly Name
//   // constants.SERVER_FRIENDLY_NAME.forEach((value: number, index: number) => {
//   //     if(index > 30) throw Error("MAX LENGTH for server friendly name must not be more than 30 chars!");
//   //     msgBuffer.writeUInt8(value, index + 24);
//   // })
//   return msgBuffer;
// };
