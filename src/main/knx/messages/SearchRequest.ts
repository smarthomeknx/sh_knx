// EXAMPLE
//       +-------------------------------+
// 1     |              06h              |    header size
//       +-------------------------------+
// 2     |              10h              |    protocol version
//       +-------------------------------+
// 3     |              02h              | \
//       +- - - - - - - - - - - - - - - -+  > service type identifier 0201h
// 4     |              01h              | /
//       +-------------------------------+
// 5     |              00h              | \
//       +- - - - - - - - - - - - - - - -+  > total length, 14 octets
// 6     |              0Eh              | /
//       +-------------------------------+
// 7     |              08h              |    structure length
//       +-------------------------------+
// 8     |              01h              |    host protocol code, e.g. 01h, for UDP over IPv4
//       +-------------------------------+
// 9     |              192              | \
//       +- - - - - - - - - - - - - - - -+ |
// 10    |              168              | |
//       +- - - - - - - - - - - - - - - -+  > IP address of control endpoint,
// 11    |              200              | |   e.g. 192.168.200.12
//       +- - - - - - - - - - - - - - - -+ |
// 12    |               12              | /
//       +-------------------------------+
// 13    |              0Eh              | \
//       +- - - - - - - - - - - - - - - -+  > port number of control endpoint, 3671
// 14    |              57h              | /
//       +-------------------------------+

import * as constants from "../utils/constants";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.SEARCH_REQUEST;

/**
 * toBuffer Example: 06100201000e0801c0a8018ac0a8
 */
export default class SearchRequest extends Message {
  constructor() {
    super(MESSAGE_TYPE);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
  }
}
