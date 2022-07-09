import util from "util";
import { CONVERTER_LOG } from "../../../utils/logging";
import Field, { FieldValue } from "./Field";

export type JsonValueTypes = string | number | boolean | Date | JsonObject | JsonArray | undefined;
export type JsonArray = Array<JsonValueTypes>;
//export type JsonObject = Record<string, JsonValueTypes>;

export interface JsonObject {
  [key: string]: JsonValueTypes;
}

export const isNumber = (valueType: JsonValueTypes): valueType is number => {
  return typeof valueType === "number";
};

export const isString = (valueType: JsonValueTypes): valueType is string => {
  return typeof valueType === "string";
};

export const isBoolean = (valueType: JsonValueTypes): valueType is boolean => {
  return typeof valueType === "boolean";
};

export const isDate = (valueType: JsonValueTypes): valueType is Date => {
  return util.types.isDate(valueType);
};

export const isJsonArray = (valueType: JsonValueTypes): valueType is JsonArray => {
  return Array.isArray(valueType);
};

export const isJsonObject = (valueType: JsonValueTypes): valueType is JsonObject => {
  return typeof valueType === "object" && valueType !== null && valueType !== undefined && !isJsonArray(valueType);
};

// export const isFieldConfigValue = (valueType: JsonObject, fields: FieldConfigs): boolean => {
//   const missingField = Object.keys(fields).find((fieldKey) => {
//     return !(fieldKey in valueType);
//   });
//   // no missing field => all config values are available, fine!
//   return missingField === undefined;
// };

// export const isValidFieldConfigValue = (
//   valueType: JsonValueTypes,
//   fields: FieldConfigs
// ): valueType is JsonObject | JsonArray => {
//   if (isJsonArray(valueType)) {
//   }
//   if (isJsonObject(valueType)) {
//     // look for missing key
//     const missingField = Object.keys(fields).find((fieldKey) => {
//       return !(fieldKey in valueType);
//     });
//     // no missing field => all config values are available, fine!
//     return missingField === undefined;
//   }
//   throw Error("value must be a JsonObject or JsonArray");
// };

export default class StructureField {
  buffer: Buffer;

  constructor(
    readonly id: string,
    readonly field: Field<FieldValue> // readonly length: number // readonly buffer: Buffer
  ) {
    this.buffer = Buffer.alloc(field.maxLength);
  }

  get name(): string {
    return this.field.name;
  }

  get maxLength(): number {
    return this.field.maxLength;
  }

  getFriendlyName(): string {
    return this.field.name;
  }

  getFriendlyValue(): FieldValue {
    return this.field.parse(this.value);
  }

  getString(): string | undefined {
    return <string>this.getFriendlyValue();
  }

  getNumber(): number | undefined {
    return <number>this.getFriendlyValue();
  }

  get value(): Uint8Array {
    const uInt8Values = [];
    for (let i = 0; i < this.maxLength; i++) {
      uInt8Values[i] = this.buffer.readUInt8(i);
    }
    const result = Uint8Array.from(uInt8Values);
    return result;
  }

  set value(value: Uint8Array) {
    // Write to the buffer
    let i;
    try {
      for (i = 0; i < this.maxLength; i++) {
        this.buffer.writeUInt8(value[i], i);
      }
    } catch (error) {
      throw Error(
        `[${this.getFriendlyName()}] value ${value} can't be written to buffer at position ${i}} because: ${error}`
      );
    }
  }

  getHex(): string {
    return this.buffer.toString("hex");
  }

  setFlavoredValue(value: FieldValue): void {
    const newValue = this.field.toUint8Array(value);
    // let uint8Value: Uint8Array;

    // if (typeof this._value === "string") {
    //   CONVERTER_LOG.silly("[Structure.calcUIntValue] value is string");
    //   uint8Value = fromString(this._value, fixedLength);
    // } else if (typeof this._value === "number") {
    //   CONVERTER_LOG.silly("[Structure.calcUIntValue] value is number");
    //   uint8Value = fromNumber(this._value, fixedLength);
    // } else if (this._value instanceof Uint8Array) {
    //   CONVERTER_LOG.silly("[Structure.calcUIntValue] value is Uint8Array");
    //   uint8Value = this._value;
    // } else {
    //   CONVERTER_LOG.silly("[Structure.calcUIntValue] value is undefined");
    //   uint8Value = fromNumber(0, fixedLength);
    // }

    CONVERTER_LOG.silly("[%s] finished setValue: '%s' => '%s'", this.getFriendlyName(), this.value, newValue);
    this.value = newValue;
  }
}
