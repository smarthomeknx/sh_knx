import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { FieldValue, NUMBER_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";
import { JsonObject } from "./base/StructureField";
import { runInThisContext } from "vm";

const STRUCTURE_NAME = "SupportedServiceFamily (DIB)";
const STRUCTURE_LENGTH = 0x0a; //,"10";
const STRUCTURE_KEY = "SupportedServiceFamilyDIB";

export interface ServiceFamily extends JsonObject {
  ServiceFamily: number;
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
  ServiceFamilies: [{ ServiceFamily: NUMBER_FIELDS.ServiceFamilyID, Version: NUMBER_FIELDS.ServiceFamilyVersion }]
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
    this.data.StructureLength = STRUCTURE_LENGTH;
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

  get bufferSize(): number {
    if (this.data.StructureLength) {
      return this.data.StructureLength;
    } else {
      return STRUCTURE_LENGTH;
    }
  }

  addServiceFamily(serviceFamily: knxSpec.SERVICE_FAMILY, version: number = knxSpec.PROTOCOL_VERSION): void {
    if (this.getServiceFamilyVersion(serviceFamily)) throw Error("ServiceFamily was already added");
    if (this.data.ServiceFamilies === undefined) {
      this.data.ServiceFamilies = [];
    }
    this.data.ServiceFamilies.push({
      ServiceFamily: serviceFamily,
      Version: version
    });
  }

  getServiceFamilyVersion(serviceFamily: knxSpec.SERVICE_FAMILY): number | undefined {
    if (this.data.ServiceFamilies === undefined) {
      return undefined;
    }
    const match = this.data.ServiceFamilies.find((i) => {
      return serviceFamily === i.serviceFamily;
    });
    return match ? match.ServiceFamily : undefined;
  }
}
