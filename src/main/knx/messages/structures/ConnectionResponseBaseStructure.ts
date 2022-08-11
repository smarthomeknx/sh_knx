import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { FieldValue, NUMBER_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";
//import FixedStructure from "./FixedStructure";

const STRUCTURE_NAME = "ConnectionResponse Base";
const STRUCTURE_LENGTH = 0x02; //,"02";
const STRUCTURE_KEY = "ConnectionResponse Base";

interface ConnectionResponseBaseData extends StructureJsonObject {
  CommunicationChannelID: number;
  Status: number;
}

type ConnectionResponseBaseDataFieldConfigs = { [id in keyof ConnectionResponseBaseData]: Field<FieldValue> };
const CONFIG: ConnectionResponseBaseDataFieldConfigs = {
  CommunicationChannelID: NUMBER_FIELDS.CommunicationChannelID,
  Status: NUMBER_FIELDS.Status
};

export default class ConnectionResponseBaseStructure extends JSONStructure<ConnectionResponseBaseData> {
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
