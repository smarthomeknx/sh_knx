import * as knxSpec from "../structures/KNX_SPECIFICATION";
import { CONVERTER_LOG } from "../../utils/logging";
import Structure from "../structures/base/Structure";
import HeaderStructure from "../structures/HeaderStructure";
import HPAIStructure from "../structures/HPAIStructure";
import { JsonObject } from "../structures/base/StructureField";
import yaml from "js-yaml";

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

    for (const structure of this.structures) {
      if (structure.id !== this.headerStructure.id) {
        const buffer: Buffer = structure.toBuffer();
        size += buffer.length;
        buffers.push(buffer);
      }
    }

    //calculating siye and adding header at the beginning
    this.headerStructure.data.TotalSize = size;
    buffers.unshift(this.headerStructure.toBuffer());

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

  toJSON(withConfig: boolean): unknown {
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

  toYAML(withConfig: boolean): string {
    return yaml.dump(this.toJSON(withConfig));
  }
}
