import * as knxSpec from "./KNX_SPECIFICATION";
import Field, { DOT_SEPERATED_BYTES_FIEDS, FieldValue, NUMBER_FIELDS, STRING_FIELDS } from "./base/Field";
import JSONStructure, { StructureJsonObject } from "./base/JSONStructure";

const STRUCTURE_NAME = "ConnectionRequestInformation (CRI)";
//const STRUCTURE_LENGTH = // VARIABLE 0x36; //structure length (CRI)
const STRUCTURE_KEY = "ConnectionRequestInformationCRI";

interface ConnectionRequestInformationData extends StructureJsonObject {
  StructureLength: number;
  ConnectionTypeCode: knxSpec.CONNECTION_TYPE_CODE;
  KNXLayer: knxSpec.TUNNELING_LAYER; // maybe further layers would be requiered later on
  Reserved: knxSpec.KNX_RESERVED;
}

type ConnectionRequestInformationDataFieldConfigs = {
  [id in keyof ConnectionRequestInformationData]: Field<FieldValue>;
};
const CONFIG: ConnectionRequestInformationDataFieldConfigs = {
  StructureLength: NUMBER_FIELDS.StructureLength,
  ConnectionTypeCode: NUMBER_FIELDS.ConnectionTypeCode,
  KNXLayer: NUMBER_FIELDS.KNXLayer,
  Reserved: NUMBER_FIELDS.Reserved
};
export default class ConnectionRequestInformationStructure extends JSONStructure<ConnectionRequestInformationData> {
  constructor() {
    super(STRUCTURE_NAME, STRUCTURE_KEY, CONFIG);
  }

  setDefaultValues(): void {
    // this.data.StructureLength = 0x04;
    // this.data.ConnectionTypeCode = knxSpec.CONNECTION_TYPE_CODE.TUNNEL_CONNECTION;
    // this.data.KNXLayer = knxSpec.TUNNELING_LAYER.TUNNEL_LINKLAYER;
    // this.data.Reserved = knxSpec.KNX_RESERVED.RESERVED;
  }

  // get bufferSize(): number {
  //   if (this.data.StructureLength) {
  //     return this.data.StructureLength;
  //   } else {
  //     return STRUCTURE_LENGTH;
  //   }
  // }

  setDefaultValuesByConnectionType(type: knxSpec.CONNECTION_TYPE_CODE): void {
    switch (type) {
      case knxSpec.CONNECTION_TYPE_CODE.TUNNEL_CONNECTION:
        this.setDefaultValues4TunnelConnection();
        break;
    }
  }

  setDefaultValues4TunnelConnection() {
    this.data.StructureLength = 0x04;
    this.data.ConnectionTypeCode = knxSpec.CONNECTION_TYPE_CODE.TUNNEL_CONNECTION;
    this.data.KNXLayer = knxSpec.TUNNELING_LAYER.TUNNEL_LINKLAYER;
    this.data.Reserved = knxSpec.KNX_RESERVED.RESERVED;
  }
}
