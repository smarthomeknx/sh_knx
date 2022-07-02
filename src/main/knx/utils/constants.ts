/** KNXnet/IP Internet Protocol constants */
export const PORT = 3671;
export const MULTICAST_IP_ADDRESS = "224.0.23.12";
export const LOCAL_IP_ADDRESS = "127.0.0.1";
//export const IP_ADDRESS = "192.168.1.138";

/**  192 = C0, 168 = A8, 01 = 01, 138 = 8A */
export const CLIENT_IP_ADDRESS = "192.168.1.138"; // C0A8018A;
export const SERVER_IP_ADDRESS = "192.168.1.138"; //Uint8Array.from([192, 168, 1, 138]); // C0A8018A;

export const CLIENT_PORT = 49320;
export const SERVER_PORT = 3671;

export const SERVER_SERIAL_NUMBER = "0.250.0.0.0.1"; // Uint8Array.from([0, 250, 0, 0, 0, 1]);
export const SERVER_MAC_ADDRESS = "6.6.6.3.14.71"; //Uint8Array.from([6, 6, 6, 3, 14, 71]); // 06 06 06 03 0e 47
//export const SERVER_SERIAL_NUMBER = Uint8Array.from([0, 250, 0, 0, 0, 1]); // 00 FA 00 00 00 01
//export const SERVER_MULTICAST_IP_ADDRESS = Uint8Array.from([224, 23, 0, 12]); // e0 00 17 0c
//export const SERVER_MAC_ADDRESS = Uint8Array.from([6, 6, 6, 3, 14, 71]); // 06 06 06 03 0e 47
// REAL ONE: 04-D9-F5-82-95-2A for 192.168.1.138 and

export const SERVER_FRIENDLY_NAME = "SMARTHOMEKNX.DE"; // MAX LENGTH:

export enum MessageType {
  SEARCH_REQUEST,
  SEARCH_RESPONSE,
  DESCRIPTION_REQUEST,
  DESCRIPTION_RESPONSE,
  CONNECT_REQUEST,
  CONNECT_RESPONSE,
  CONNECTIONSTATE_REQUEST,
  CONNECTIONSTATE_RESPONSE,
  DISCONNECT_REQUEST,
  DISCONNECT_RESPONSE
}

export const HEXer = 0x47;
//export const X_CLIENT_PORT = "C0A8";
