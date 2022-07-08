/**
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 8.8.1 SEARCH_REQUEST
 *
 * EXAMPLE
 *       +-------------------------------+
 * 1     |              06h              |    header size
 *       +-------------------------------+
 * 2     |              10h              |    protocol version
 *       +-------------------------------+
 * 3     |              02h              | \
 *       +- - - - - - - - - - - - - - - -+  > service type identifier 0201h
 * 4     |              01h              | /
 *       +-------------------------------+
 * 5     |              00h              | \
 *       +- - - - - - - - - - - - - - - -+  > total length, 14 octets
 * 6     |              0Eh              | /
 *       +-------------------------------+
 * 7     |              08h              |    structure length
 *       +-------------------------------+
 * 8     |              01h              |    host protocol code, e.g. 01h, for UDP over IPv4
 *       +-------------------------------+
 * 9     |              192              | \
 *       +- - - - - - - - - - - - - - - -+ |
 * 10    |              168              | |
 *       +- - - - - - - - - - - - - - - -+  > IP address of control endpoint,
 * 11    |              200              | |   e.g. 192.168.200.12
 *       +- - - - - - - - - - - - - - - -+ |
 * 12    |               12              | /
 *       +-------------------------------+
 * 13    |              0Eh              | \
 *       +- - - - - - - - - - - - - - - -+  > port number of control endpoint, 3671
 * 14    |              57h              | /
 *       +-------------------------------+
 */

import * as constants from "../utils/constants";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.SEARCH_REQUEST;

/**
 * toBuffer Example: 06100201000e0801c0a8018ac0a8
 */
export default class SearchRequest extends Message {
  readonly hpaiStructure: HPAIStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiStructure = new HPAIStructure();
    this.structures.push(this.hpaiStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiStructure.data.HostProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
  }
}
