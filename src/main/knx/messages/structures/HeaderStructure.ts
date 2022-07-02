import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { FieldValue, NUMBER_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";
//import FixedStructure from "./FixedStructure";

const STRUCTURE_NAME = "KNXnet/IP header";
const STRUCTURE_LENGTH = 0x06; //,"06";
const STRUCTURE_KEY = "Header";

interface HeaderData extends StructureJsonObject {
  StructureLength: number;
  KNXnetipVersion: number;
  ServiceType: knxSpec.SERVICE_TYPE;
  TotalSize: number;
}

type HeaderFieldConfigs = { [id in keyof HeaderData]: Field<FieldValue> };
const CONFIG: HeaderFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  KNXnetipVersion: NUMBER_FIELDS.ProtocolVersion,
  ServiceType: NUMBER_FIELDS.ServiceTypeIdentifier,
  TotalSize: NUMBER_FIELDS.TotalLength
};

/**
 * KNXnet/IP header
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   HEADER_SIZE_10              |   KNXNETIP_VERSION            |
 * |   (06h)                       |   (10h)                       |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   SEARCH_REQUEST                                              |
 * |   (0201h)                                                     |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   HEADER_SIZE_10 + sizeof(HPAI)                               |
 * |                                                               |
 * +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *
 */
export default class HeaderStructure extends JSONStructure<HeaderData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    this.data.StructureLength = STRUCTURE_LENGTH;
    this.data.KNXnetipVersion = knxSpec.PROTOCOL_VERSION;
  }

  get bufferSize(): number {
    return STRUCTURE_LENGTH;
  }
}
