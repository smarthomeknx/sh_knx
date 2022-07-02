import Structure from "./Structure";
import { JsonObject } from "./StructureField";
import { logBuffer } from "../../../utils/logging";

const STRUCTURE_NAME = "Raw";
const STRUCTURE_KEY = "Raw";

export default class RawStructure extends Structure {
  buffer: Buffer;
  constructor(buffer: Buffer) {
    super(STRUCTURE_NAME, STRUCTURE_KEY);
    this.buffer = buffer;
  }

  get bufferSize(): number {
    return this.buffer.length;
  }
  toBuffer(): Buffer {
    return this.buffer;
  }
  fromBuffer(source: Buffer): void {
    this.buffer = source;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toJSON(withConfig: boolean): JsonObject {
    return { buffer: logBuffer(this.buffer) };
  }

  setDefaultValues(): void {
    // nothing to do
  }

  // public get Raw(): string | undefined {
  //   super.buffer
  //   //return this.getStructureField(FieldName.KNXMedium).getNumber();
  // }

  // public set Raw(value: number | undefined) {
  //   // this.setFlavoredValue(FieldName.KNXMedium, knxSpec.KNX_MEDIUM_CODE.TP1);
  // }
}

// const createDeviceIB = (knxIndividualAddress = 0xffff, projectInstallationID = 0x0001): Buffer => {
//   const msgBuffer = Buffer.alloc(knxSpec.STRUCTURE_LENGTH_DEVICE_IB); // TODO
//   msgBuffer.writeUInt8();
//   msgBuffer.writeUInt8(, 1); // Decription Type Code
//   msgBuffer.writeUInt8(, 2); // KNX medium
//   msgBuffer.writeUInt8(); // Device Status (each byte counts for something, maybe needs some calculation...)
//   msgBuffer.writeUInt16BE(, 4); // KNX Individual Address
//   msgBuffer.writeUInt16BE(, 6); // Project-Installation identifier
//   // Serial Number
//   constants.SERVER_SERIAL_NUMBER.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 8);
//   });

//   // Multicast IP Address
//   constants.SERVER_MULTICAST_IP_ADDRESS.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 14);
//   });

//   // MAC Address
//   constants.SERVER_MAC_ADDRESS.forEach((value: number, index: number) => {
//     msgBuffer.writeUInt8(value, index + 18);
//   });

//   // Friendly Name
//   // constants.SERVER_FRIENDLY_NAME.forEach((value: number, index: number) => {
//   //     if(index > 30) throw Error("MAX LENGTH for server friendly name must not be more than 30 chars!");
//   //     msgBuffer.writeUInt8(value, index + 24);
//   // })
//   return msgBuffer;
// };
