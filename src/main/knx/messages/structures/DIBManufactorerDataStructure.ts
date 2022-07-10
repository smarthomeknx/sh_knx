import * as knxSpec from "./KNX_SPECIFICATION";
import * as constants from "../../utils/constants";
import Field, { DOT_SEPERATED_BYTES_FIEDS, FieldValue, NUMBER_FIELDS, STRING_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";

const STRUCTURE_NAME = "Other Device Information (DIB)";
const STRUCTURE_LENGTH = 0x8; //structure length (DIB hardware)
const STRUCTURE_KEY = "OtherDeviceInformationDIB";

export interface DIBManufactorerData extends StructureJsonObject {
  StructureLength: number;
  DescriptionTypeCode: knxSpec.DESCRIPTION_TYPE_CODE;
  KNXManufactorerID: number;
  DeviceTypeName: string;
}

type DIBManufactorerDataFieldConfigs = { [id in keyof DIBManufactorerData]: Field<FieldValue> };
const CONFIG: DIBManufactorerDataFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  DescriptionTypeCode: NUMBER_FIELDS.DescriptionTypeCode,
  KNXManufactorerID: NUMBER_FIELDS.KNXManufactorerID,
  DeviceTypeName: STRING_FIELDS.DeviceTypeName
};

export default class DIBManufactorerDataStructure extends JSONStructure<DIBManufactorerData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    this.data.StructureLength = STRUCTURE_LENGTH;
    this.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.MFR_DATA;
  }
}
