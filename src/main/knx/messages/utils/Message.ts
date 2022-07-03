import * as knxSpec from "../structures/KNX_SPECIFICATION";
import { CONVERTER_LOG } from "../../utils/logging";
import Structure from "../structures/base/Structure";
import HeaderStructure from "../structures/HeaderStructure";
import HPAIStructure from "../structures/HPAIStructure";
import { JsonObject } from "../structures/base/StructureField";

interface JSONMessage {
  serviceType: string;
  structures: Record<string, JsonObject>;
}

export class Message {
  readonly structures: Structure[] = [];
  readonly headerStructure: HeaderStructure;
  readonly hpaiStructure: HPAIStructure;

  constructor(readonly serviceType: knxSpec.SERVICE_TYPE = knxSpec.SERVICE_TYPE.UNDEFINED) {
    this.headerStructure = new HeaderStructure();
    this.hpaiStructure = new HPAIStructure();
    this.structures.push(this.headerStructure, this.hpaiStructure);
  }

  setDefaultValues(): void {
    this.structures.forEach((structure: Structure) => structure.setDefaultValues());
  }

  toBuffer(): Buffer {
    const buffers = [];
    // do avoid creating buffers twices, the size gets calculated in parallel and the header
    // is transformed to buffer as last (when the TotalSize was set).

    let size = this.headerStructure.data.StructureLength || 0;

    const hpaiBuffer = this.hpaiStructure.toBuffer();
    size += hpaiBuffer.length;
    this.headerStructure.data.TotalSize = size;
    buffers.push(this.headerStructure.toBuffer(), hpaiBuffer);

    if (this.structures.length > 2)
      throw Error("Not implemented: toBuffer for additioanl structures - only Header and HPAI are buffered!");

    // for (const structure of this.structures) {
    //   const buffer: Buffer = structure.toBuffer();
    //   size += buffer.length;
    //   buffers.push(buffer);
    // }

    const result = Buffer.concat(buffers);
    return result; //.toString("hex");
  }

  fromBuffer(buffer: Buffer): number {
    if (CONVERTER_LOG.isDebugEnabled()) {
      CONVERTER_LOG.debug("[Message.fromBuffer] Converting incoming buffer \n\t%s", buffer.toString("hex"));
    }
    let cursor = 0;
    for (const structure of this.structures) {
      CONVERTER_LOG.debug(
        "[Message.fromBuffer] Message: %s - Converting Structure: %s",
        knxSpec.SERVICE_TYPE[this.serviceType],
        structure.name
      );
      structure.fromBuffer(buffer.slice(cursor, cursor + structure.bufferSize));
      cursor += structure.bufferSize;
    }

    if (CONVERTER_LOG.isInfoEnabled()) {
      CONVERTER_LOG.info(
        "[Message.fromBuffer] Converted incoming buffer into message\n%s",
        JSON.stringify(this.toJSON(true), null, 2)
      );
    }

    return cursor;
  }

  toJSON(withConfig: boolean): JSONMessage {
    const jsonStructures: Record<string, JsonObject> = {};
    for (const structure of this.structures) {
      jsonStructures[structure.id] = structure.toJSON(withConfig); //setDefaultValues; .setDefaultValues; //toJSON(printDetails);
    }

    const json: JSONMessage = {
      serviceType: knxSpec.SERVICE_TYPE[this.serviceType],
      structures: jsonStructures
    };

    return json;
  }
}
