import c from "config";
import Field, { FieldValue } from "./Field";
import { JsonObject } from "./StructureField";

//export type StructureConfig = { [id: string]: Field<FieldValue> | Array<StructureConfig> };
export type StructureConfigTypes = Field<FieldValue> | StructureConfig | Array<StructureConfig>;
export type StructureConfig = { [id: string]: StructureConfigTypes };

export const isStructureConfigArray = (config: StructureConfigTypes): config is Array<StructureConfig> => {
  return Array.isArray(config);
};

export const isStructureConfigObject = (config: StructureConfigTypes): config is StructureConfig => {
  // a structureConfigField can be a structureConfigObject, too
  return (
    typeof config === "object" &&
    config !== null &&
    !isStructureConfigArray(config) &&
    config.constructor.name === "Object"
  );
};

export const isStructureConfigField = (config: StructureConfigTypes): config is Field<FieldValue> => {
  const candidate = <Field<FieldValue>>config;
  return candidate.settings !== undefined && candidate.maxLength !== undefined && candidate.name !== undefined;
};

export default abstract class Structure {
  abstract setDefaultValues(): void;
  abstract get bufferSize(): number;
  abstract toBuffer(): Buffer;
  abstract fromBuffer(source: Buffer): void;
  abstract toJSON(withConfig: boolean): JsonObject;

  constructor(readonly name: string, readonly id: string) {}
}
