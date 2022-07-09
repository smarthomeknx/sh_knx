import * as constants from "./constants";
import * as knxSpec from "../messages/structures/KNX_SPECIFICATION";
import HeaderStructure from "../messages/structures/HeaderStructure";
import HPAIStructure from "../messages/structures/HPAIStructure";

/**
 * Connection Request Information (CRI)
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Structure Length            |   Connection Type Code        |
 * |   (1 Octet)                   |   (1 Octet)                   |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Host Protocol Independent Data                              |
 * |   (variable length, optional)                                 |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Host Protocol Dependent Data                                |
 * |   (variable length, optional)                                 |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 */
const createCRI = (): Buffer => {
  const msgBuffer = Buffer.alloc(0); // TODO
  return msgBuffer;
};

/**
 * Connection Response Datablock (CRD)
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Structure Length            |   Connection Type Code        |
 * |   (1 Octet)                   |   (1 Octet)                   |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Host Protocol Independent Data                              |
 * |   (variable length, optional)                                 |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Host Protocol Dependent Data                                |
 * |   (variable length, optional)                                 |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |                                                               |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 */
const createCRD = (): Buffer => {
  const msgBuffer = Buffer.alloc(0); // TODO

  return msgBuffer;
};

/**
 * Description Information Block (DIB)
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Structure Length            |   Description Type Code       |
 * |   (1 octet)                   |   (1 octet)                   |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * |   Description Information Block data                          |
 * |   (?? octets)                                                 |
 * +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 * @returns
 */
const createDescriptionIB = (): Buffer => {
  const msgBuffer = Buffer.alloc(0); // TODO

  return msgBuffer;
};

// SEARCH_REQUEST 0201h1 Sent by KNXnet/IP Client to search available KNXnet/IP Servers.
// SEARCH_RESPONSE 0202h1 Sent by KNXnet/IP Server when receiving a KNXnet/IP SEARCH_REQUEST.
// DESCRIPTION_REQUEST 0203h1 Sent by KNXnet/IP Client to    a KNXnet/IP Server to retrieve information about capabilities and supported services.
// DESCRIPTION_RESPONSE 0204h1 Sent by KNXnet/IP Server in response to a DESCRIPTION_REQUEST to provide information about the server implementation.
// CONNECT_REQUEST0205h1 Sent by KNXnet/IP Client for establishing a communication channel to a KNXnet/IP Server.
// CONNECT_RESPONSE0206h1 Sent by KNXnet/IP Server as answer to CONNECT_REQUEST telegram.
// CONNECTIONSTATE_REQUEST0207h1 Sent by KNXnet/IP Client for requesting the connection state of an established connection to    a KNXnet/IP Server.
// CONNECTIONSTATE_RESPONSE 0208h1 Sent by KNXnet/IP Server when receiving a CONNECTIONSTATE_REQUEST for an established connection.
// DISCONNECT_REQUEST0209h1 Sent by KNXnet/IP device, typically the KNXnet/IP Client, to terminate an established connection.
// DISCONNECT_RESPONSE020Ah1 Sent by KNXnet/IP device, typically the KNXnet/IP Server, in response to a DISCONNECT_REQUEST
