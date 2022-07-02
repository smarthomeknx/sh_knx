import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { FieldValue, NUMBER_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";
import { JsonObject } from "./base/StructureField";

const STRUCTURE_NAME = "SupportedServiceFamily (DIB)";
const STRUCTURE_KEY = "SupportedServiceFamilyDIB";

export interface ServiceFamily extends JsonObject {
  Id: number;
  Version: number;
}

export interface SupportedServiceFamilyDIBData extends StructureJsonObject {
  StructureLength: number;
  DescriptionTypeCode: knxSpec.DESCRIPTION_TYPE_CODE;
  ServiceFamilies: ServiceFamily[];
}

type SupportedServiceFamilyDIBFieldConfigs = {
  [id in keyof SupportedServiceFamilyDIBData]: Field<FieldValue> | ServiceFamilyConfig[];
};

type ServiceFamilyConfig = {
  [id in keyof ServiceFamily]: Field<FieldValue>;
};
const CONFIG: SupportedServiceFamilyDIBFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  DescriptionTypeCode: NUMBER_FIELDS.DescriptionTypeCode,
  ServiceFamilies: [{ Id: NUMBER_FIELDS.ServiceFamilyID, Version: NUMBER_FIELDS.ServiceFamilyVersion }]
};

// SupportServiceFamily (DIB)
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Structure Length            |   Description Type Code       |
// |   (1 octet)                   |   (1 octet)                   |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Service Family ID           |   Service Family version      |
// |   (1 Octet)                   |   (1 Octet)                   |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Service Family ID           |   Service Family version      |
// |   (1 Octet)                   |   (1 Octet)                   |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   ....                        |   ....                        |
// |                               |                               |
// +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
// |   Service Family ID           |   Service Family version      |
// |   (1 Octet)                   |   (1 Octet)                   |
// +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
// EXAMPLE FROM VirtualKNX
// 0a 02 02 01 03 01 04 01 05 01

export default class DIBSupportedServiceFamilyStructure extends JSONStructure<SupportedServiceFamilyDIBData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    this.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.SUPP_SVC_FAMILIES;
  }

  // prepareFieldsFromBuffer(buffer: Buffer): void {
  //   while (buffer.length > this.bufferSize) {
  //     this.addField(FieldName.ServiceFamilyID);
  //     this.addField(FieldName.ServiceFamilyVersion);
  //   }
  // }

  // get DescriptionTypeCode(): number | undefined {
  //   return this.getStructureFieldByFieldName(FieldName.DescriptionTypeCode).getNumber();
  // }

  // set DescriptionTypeCode(value: number | undefined) {
  //   this.setFlavoredValueByFieldName(FieldName.DescriptionTypeCode, knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO);
  // }

  addServiceFamily(service: knxSpec.SERVICE_FAMILY, version: number = knxSpec.PROTOCOL_VERSION): void {
    if (this.getServiceFamilyVersion(service)) throw Error("ServiceFamily was already added");
    if (this.data.ServiceFamilies === undefined) {
      this.data.ServiceFamilies = [];
    }
    this.data.ServiceFamilies.push({
      Id: service,
      Version: version
    });
  }

  getServiceFamilyVersion(service: knxSpec.SERVICE_FAMILY): number | undefined {
    if (this.data.ServiceFamilies === undefined) {
      return undefined;
    }
    const match = this.data.ServiceFamilies.find((serviceFamily) => {
      return service === serviceFamily.Id;
    });
    return match ? match.Id : undefined;
  }

  // public get KNXMedium(): number | undefined {
  //   return this.getStructureField(FieldName.KNXMedium).getNumber();
  // }

  // public set KNXMedium(value: number | undefined) {
  //   this.setFlavoredValue(FieldName.KNXMedium, knxSpec.KNX_MEDIUM_CODE.TP1);
  // }

  // public get DeviceStatus(): number | undefined {
  //   return this.getStructureField(FieldName.DeviceStatus).getNumber();
  // }

  // public set DeviceStatus(value: number | undefined) {
  //   this.setFlavoredValue(FieldName.DeviceStatus, knxSpec.KNX_DEVICE_STATUS.PROG_MODE_OFF);
  // }

  // public get KNXIndividualAddress(): string | undefined {
  //   return this.getStructureField(FieldName.KNXIndividualAddress).getString();
  // }

  // public set KNXIndividualAddress(value: string | undefined) {
  //   this.setFlavoredValue(FieldName.KNXIndividualAddress, value);
  // }

  // public get ProjectInstallationIdentifier(): string | undefined {
  //   return this.getStructureField(FieldName.ProjectInstallationIdentifier).getString();
  // }

  // public set ProjectInstallationIdentifier(value: string | undefined) {
  //   this.setFlavoredValue(FieldName.ProjectInstallationIdentifier, value);
  // }

  // public get DeviceKNXSerialNumber(): string | undefined {
  //   return this.getStructureField(FieldName.DeviceKNXSerialNumber).getString();
  // }

  // public set DeviceKNXSerialNumber(value: string | undefined) {
  //   this.setFlavoredValue(FieldName.DeviceKNXSerialNumber, value);
  // }

  // public get DeviceRoutingMulticastAddress(): number | undefined {
  //   return this.getStructureField(FieldName.DeviceRoutingMulticastAddress).getNumber();
  // }

  // public set DeviceRoutingMulticastAddress(value: number | undefined) {
  //   this.setFlavoredValue(FieldName.DeviceRoutingMulticastAddress, value);
  // }

  // public get DeviceMACAddress(): string | undefined {
  //   return this.getStructureField(FieldName.DeviceMACAddress).getString();
  // }

  // public set DeviceMACAddress(value: string | undefined) {
  //   this.setFlavoredValue(FieldName.DeviceMACAddress, value);
  // }

  // public get DeviceFriendlyName(): string | undefined {
  //   return this.getStructureField(FieldName.DeviceFriendlyName).getString();
  // }

  // public set DeviceFriendlyName(value: string | undefined) {
  //   this.setFlavoredValue(FieldName.DeviceFriendlyName, value);
  // }
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
