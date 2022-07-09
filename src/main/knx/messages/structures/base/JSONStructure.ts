import { default as Field, FieldValue } from "./Field";
import { CONVERTER_LOG } from "../../../utils/logging";
import Structure, {
  isStructureConfigArray,
  isStructureConfigField,
  isStructureConfigObject,
  StructureConfig
} from "./Structure";
import StructureField, {
  isJsonArray,
  isJsonObject,
  isNumber,
  isString,
  JsonArray,
  JsonObject,
  JsonValueTypes
} from "./StructureField";

//const FIELD_NUMBER_SEPARATOR = "_";

export interface StructureJsonObject extends JsonObject {
  StructureLength: number;
}

const createStructureField = (id: string, field: Field<FieldValue>): StructureField => {
  const structureField: StructureField = new StructureField(id, field);
  return structureField;
};

const bufferize = (
  parentId: string,
  fieldConfigs: Field<FieldValue> | StructureConfig | StructureConfig[],
  data: JsonValueTypes
): Buffer => {
  if (isStructureConfigField(fieldConfigs)) {
    return bufferizeField(parentId, fieldConfigs, data);
  } else if (isStructureConfigArray(fieldConfigs)) {
    return bufferizeArray(parentId, fieldConfigs, data);
  } else if (isStructureConfigObject(fieldConfigs)) {
    return bufferizeObject(parentId, fieldConfigs, data);
  }
  throw Error(`FieldConfig for ${parentId} is not valid: ${typeof fieldConfigs}`);
};

const bufferizeField = (parentId: string, fieldConfig: Field<FieldValue>, data: JsonValueTypes): Buffer => {
  // handle undefined value
  if (data === undefined) {
    return Buffer.alloc(fieldConfig.maxLength);
  }
  // validate content
  if (!(isNumber(data) || isString(data))) {
    throw Error(`The type for ${parentId} must be a number or string but seems to be ${typeof data}`);
  }
  const structureField = createStructureField(parentId, fieldConfig);
  structureField.setFlavoredValue(data);
  return structureField.buffer;
};

const bufferizeObject = (parentId: string, fieldConfigs: StructureConfig, data: JsonValueTypes): Buffer => {
  if (!isJsonObject(data)) {
    throw Error(`The type for ${parentId} must be an json object but seems to be ${typeof data}`);
  }
  const fieldBuffers: Buffer[] = [];
  Object.keys(fieldConfigs).forEach((configKey) => {
    const id = parentId + "." + configKey;
    const fieldConfig = fieldConfigs[configKey];
    const jsonValue: JsonValueTypes = data[configKey];
    fieldBuffers.push(bufferize(id, fieldConfig, jsonValue));
  });
  return Buffer.concat(fieldBuffers);
};

const bufferizeArray = (parentId: string, arrayConfig: StructureConfig[], data: JsonValueTypes): Buffer => {
  if (data === undefined) {
    return Buffer.alloc(0);
  }
  if (!isJsonArray(data)) {
    throw Error(`The type for ${parentId} must be an array but seems to be ${typeof data}`);
  }
  const buffers: Buffer[] = [];
  const itemConfig = arrayConfig[0];
  let i = 0;
  data.forEach((item) => {
    const id = parentId + "." + i;
    buffers.push(bufferize(id, itemConfig, item));
    i++;
  });

  return Buffer.concat(buffers);
};

const calcBufferSize = (
  parentId: string,
  fieldConfigs: Field<FieldValue> | StructureConfig | StructureConfig[],
  data: JsonValueTypes
): number => {
  if (isStructureConfigArray(fieldConfigs)) {
    return calcArrayBufferSize(parentId, fieldConfigs, data);
  }
  if (isStructureConfigObject(fieldConfigs)) {
    return calcObjectBufferSize(parentId, fieldConfigs, data);
  }
  if (isStructureConfigField(fieldConfigs)) {
    return calcFieldBufferSize(parentId, fieldConfigs);
  }
  throw Error(`FieldConfig for ${parentId} is not valid: ${typeof fieldConfigs}`);
};

const calcFieldBufferSize = (parentId: string, fieldConfig: Field<FieldValue>): number => {
  return fieldConfig.maxLength;
};

const calcObjectBufferSize = (parentId: string, fieldConfigs: StructureConfig, data: JsonValueTypes): number => {
  if (!isJsonObject(data)) {
    throw Error(`The type for ${parentId} must be an json object but seems to be ${typeof data}`);
  }
  let size = 0;
  Object.keys(fieldConfigs).forEach((configKey) => {
    const fieldConfig = fieldConfigs[configKey];
    const jsonValue: JsonValueTypes = data[configKey];
    size += calcBufferSize(configKey, fieldConfig, jsonValue);
  });
  return size;
};

const calcArrayBufferSize = (parentId: string, arrayConfig: StructureConfig[], data: JsonValueTypes): number => {
  if (data === undefined) return 0;
  if (!isJsonArray(data)) {
    throw Error(`The type for ${parentId} must be an array but seems to be ${typeof data}`);
  }
  let size = 0;
  const itemConfig = arrayConfig[0];
  data.forEach((item) => {
    size += calcBufferSize(parentId, itemConfig, item);
  });

  return size;
};

const parse = (
  parentId: string,
  fieldConfigs: Field<FieldValue> | StructureConfig | StructureConfig[],
  source: Buffer,
  target: JsonObject,
  targetKey: string
): Buffer => {
  if (isStructureConfigField(fieldConfigs)) {
    return parseField(parentId, fieldConfigs, source, target, targetKey);
  } else if (isStructureConfigArray(fieldConfigs)) {
    return parseArray(parentId, fieldConfigs, source, target, targetKey);
  } else if (isStructureConfigObject(fieldConfigs)) {
    return parseObject(parentId, fieldConfigs, source, target, targetKey);
  }

  throw Error(`FieldConfig for ${parentId} is not valid: ${typeof fieldConfigs}`);
};

const parseField = (
  parentId: string,
  fieldConfig: Field<FieldValue>,
  source: Buffer,
  target: JsonObject,
  targetKey: string
): Buffer => {
  const structureField = createStructureField(parentId, fieldConfig);
  // collect all bytes belonging to the field
  const uInt8Values = [];
  for (let i = 0; i < fieldConfig.maxLength; i++) {
    uInt8Values[i] = source.readUInt8(i);
  }
  structureField.value = Uint8Array.from(uInt8Values);
  target[targetKey] = structureField.getFriendlyValue();
  return source.slice(fieldConfig.maxLength);
};

const parseObject = (
  parentId: string,
  fieldConfigs: StructureConfig,
  source: Buffer,
  target: JsonObject,
  targetKey: string
): Buffer => {
  const jsonObject: JsonObject = {};
  Object.keys(fieldConfigs).forEach((key) => {
    const field = fieldConfigs[key];
    const id = parentId + "." + key;
    source = parse(id, field, source, jsonObject, key);
  });
  target[targetKey] = jsonObject;
  return source;
};

const parseArray = (
  parentId: string,
  arrayConfig: StructureConfig[],
  source: Buffer,
  target: JsonObject,
  targetKey: string
): Buffer => {
  const jsonArray: JsonArray = [];
  const itemConfig = arrayConfig[0];

  // consuming rest of buffer
  let i = 0;
  while (source.length > 0) {
    const jsonObject = {};
    jsonArray.push(jsonObject);
    Object.keys(itemConfig).forEach((key) => {
      const field = itemConfig[key];
      const id = parentId + "." + i + "." + key;
      source = parse(id, field, source, jsonObject, key);
      i++;
    });
  }

  target[targetKey] = jsonArray;
  return source;
};

export default abstract class JSONStructure<Type extends StructureJsonObject> extends Structure {
  data: Partial<Type>;
  abstract setDefaultValues(): void;
  //abstract prepareFieldsFromBuffer(buffer: Buffer): void;

  constructor(readonly name: string, readonly id: string, readonly config: StructureConfig, data: Partial<Type> = {}) {
    super(name, id);
    this.data = data;
  }

  get bufferSize(): number {
    return calcBufferSize(this.id, this.config, this.data);
  }

  // private getMultiFieldSuffix(fieldId: string): string {
  //   const separatorPos = fieldId.indexOf(FIELD_NUMBER_SEPARATOR);
  //   let suffix = "";
  //   if (separatorPos > 0) {
  //     suffix = fieldId.substring(separatorPos);
  //   }
  //   return suffix;
  // }

  toBuffer(): Buffer {
    if (this.data === undefined) throw Error("No data to parse");
    this.data.StructureLength = calcBufferSize(this.id, this.config, this.data);
    return bufferize(this.id, this.config, this.data);
  }

  fromBuffer(source: Buffer): Partial<Type> {
    this.data = {};
    const jsonObject = { root: {} };
    parse(this.id, this.config, source, jsonObject, "root");
    this.data = jsonObject.root;
    return this.data;
  }

  toJSON(withConfig: boolean): JsonObject {
    if (withConfig) {
      return {
        data: this.data,
        config: { something: "todo" } //this.config;
      };
    } else {
      return this.data;
    }
  }
}
