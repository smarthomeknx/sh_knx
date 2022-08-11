export type FieldValue = string | number; //| Array<FieldValue>;
export interface FieldSettings {
  name: string;
  maxLength: number;
}

export default abstract class Field<Type extends FieldValue> {
  constructor(readonly settings: FieldSettings) {}

  get name(): string {
    return this.settings.name;
  }

  get maxLength(): number {
    return this.settings.maxLength;
  }
  abstract parse(rawValue: Uint8Array): Type;
  abstract toUint8Array(value: Type): Uint8Array;
}

export class NumberField extends Field<number> {
  constructor(settings: FieldSettings) {
    super(settings);
  }

  parse(rawValue: Uint8Array): number {
    const length = rawValue.length;
    const buffer = Buffer.from(rawValue);
    const result = buffer.readUIntBE(0, length);
    return result;
  }

  toUint8Array(value: number): Uint8Array {
    const array: number[] = [];
    while (value > 255) {
      const byteValue = value % 0x100;
      array.unshift(byteValue);
      value = Math.floor(value / 0x100);
    }
    array.unshift(value);
    while (array.length < this.settings.maxLength) {
      array.unshift(0);
    }
    return Uint8Array.from(array);
  }
}

export class StringField extends Field<string> {
  constructor(settings: FieldSettings) {
    super(settings);
  }

  parse(rawValue: Uint8Array): string {
    const zeroRemovedArray = Uint8Array.from(rawValue.filter((value) => value > 0)); // removed /0 from output
    return new TextDecoder().decode(zeroRemovedArray); // to fill with spaced .padEnd(rawValue.length, " ");
  }

  toUint8Array(value: string): Uint8Array {
    const array: number[] = value.split("").map((char) => char.charCodeAt(0));
    while (array.length < this.settings.maxLength) {
      array.push(0);
    }
    return Uint8Array.from(array);
  }
}

export class DotSeparatedBytesField extends Field<string> {
  constructor(settings: FieldSettings) {
    super(settings);
  }

  parse(rawValue: Uint8Array): string {
    let value: string = rawValue[0] + "";
    if (this.settings.maxLength && rawValue.length > this.settings.maxLength)
      throw Error(
        `Can't parse rawValue to dot seperated bytes string because length ${rawValue.length} > ${this.settings.maxLength}`
      );
    for (let i = 1; i < rawValue.length; i++) {
      value += "." + rawValue[i];
    }
    return value;
  }

  toUint8Array(value: string): Uint8Array {
    const array: number[] = value.split(".").map((part) => parseInt(part, 10));
    return Uint8Array.from(array);
  }
}

export const NUMBER_FIELDS = {
  StructureLength: new NumberField({ name: "StructureLength", maxLength: 1 }),
  ProtocolVersion: new NumberField({ name: "ProtocolVersion", maxLength: 1 }),
  ServiceTypeIdentifier: new NumberField({ name: "ServiceTypeIdentifier", maxLength: 2 }),
  TotalLength: new NumberField({ name: "TotalLength", maxLength: 2 }),
  HostProtocolCode: new NumberField({ name: "HostProtocolCode", maxLength: 1 }),

  IPPort: new NumberField({ name: "IPPort", maxLength: 2 }),
  DescriptionTypeCode: new NumberField({ name: "DescriptionTypeCode", maxLength: 1 }),
  KNXMedium: new NumberField({ name: "KNXMedium", maxLength: 1 }),
  KNXManufactorerID: new NumberField({ name: "KNXMedium", maxLength: 2 }),
  DeviceStatus: new NumberField({ name: "DeviceStatus", maxLength: 1 }),
  ServiceFamilyID: new NumberField({ name: "ServiceFamilyID", maxLength: 1 }),
  ServiceFamilyVersion: new NumberField({ name: "ServiceFamilyVersion", maxLength: 1 }),

  ConnectionTypeCode: new NumberField({ name: "ConnectionTypeCode", maxLength: 1 }),
  CommunicationChannelID: new NumberField({ name: "ConnectionChannelID", maxLength: 1 }),
  Status: new NumberField({ name: "Status", maxLength: 1 }),

  KNXLayer: new NumberField({ name: "KNXLayer", maxLength: 1 }),

  Reserved: new NumberField({ name: "Reserved", maxLength: 1 })
};

export const STRING_FIELDS = {
  DeviceFriendlyName: new StringField({ name: "DeviceFriendlyName", maxLength: 30 }),
  DeviceTypeName: new StringField({ name: "DeviceFriendlyName", maxLength: 4 })
};

export const DOT_SEPERATED_BYTES_FIEDS = {
  IPAddress: new DotSeparatedBytesField({ name: "IPAddress", maxLength: 4 }),
  KNXIndividualAddress: new DotSeparatedBytesField({ name: "KNXIndividualAddress", maxLength: 2 }),
  ProjectInstallationIdentifier: new DotSeparatedBytesField({ name: "ProjectInstallationIdentifier", maxLength: 2 }),
  DeviceKNXSerialNumber: new DotSeparatedBytesField({ name: "DeviceKNXSerialNumber", maxLength: 6 }),
  DeviceRoutingMulticastAddress: new DotSeparatedBytesField({ name: "DeviceRoutingMulticastAddress", maxLength: 4 }),
  DeviceMACAddress: new DotSeparatedBytesField({ name: "DeviceMACAddress", maxLength: 6 })
};

// export enum FieldName {
//   StructureLength,
//   ProtocolVersion,
//   ServiceTypeIdentifier,
//   TotalLength,
//   HostProtocolCode,
//   IPAddress,
//   IPPort,
//   DescriptionTypeCode,
//   KNXMedium,
//   DeviceStatus,
//   KNXIndividualAddress,
//   ProjectInstallationIdentifier,
//   DeviceKNXSerialNumber,
//   DeviceRoutingMulticastAddress,
//   DeviceMACAddress,
//   DeviceFriendlyName,
//   ServiceFamilyID,
//   ServiceFamilyVersion
// }

// export const FIELDS: Field<FieldValue>[] = [];
// const addField = (name: FieldName, maxLength: number): void => {
//   FIELDS[name] = new Field(name, maxLength);
// };
