import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { DOT_SEPERATED_BYTES_FIEDS, FieldValue, NUMBER_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";

const STRUCTURE_NAME = "Host Protocol Address Information (HPAI)";
const STRUCTURE_LENGTH = 0x08;
const STRUCTURE_KEY = "HPAI";

interface HPAIData extends StructureJsonObject {
  StructureLength: number;
  HostProtocolCode: knxSpec.HOST_PROTOCOL_CODES;
  IPAddress: string;
  Port: number;
}

type HPAIFieldConfigs = { [id in keyof HPAIData]: Field<FieldValue> };
const CONFIG: HPAIFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  HostProtocolCode: NUMBER_FIELDS.HostProtocolCode,
  IPAddress: DOT_SEPERATED_BYTES_FIEDS.IPAddress,
  Port: NUMBER_FIELDS.IPPort
};

export default class HPAIStructure extends JSONStructure<HPAIData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    this.data.StructureLength = STRUCTURE_LENGTH;
  }

  get bufferSize(): number {
    return STRUCTURE_LENGTH;
  }
}
