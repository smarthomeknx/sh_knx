/**
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 7.7.1 DESCRIPTION_REQUEST
 *
 *                              NXnet/IP header
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   HEADER_SIZE_10              |   KNXNETIP_VERSION            |
 *      |   (06h)                       |   (10h)                       |
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   DESCRIPTION_REQUEST                                         |
 *      |   (0203h)                                                     |
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   HEADER_SIZE_10 + sizeof(HPAI)                               |
 *      |                                                               |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *
 *                                KNXnet/IP body
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   HPAI                                                        |
 *      |   Control endpoint                                            |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *
 *
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 8.8.3 DESCRIPTION_REQUEST
 *
 *  EXAMPLE
 *         +-------------------------------+
 * 1       |            06h                | header size
 *         +-------------------------------+
 * 2       |            10h                | protocol version
 *         +-------------------------------+
 * 3       |            02h                | \
 *         +- - - - - - - - - - - - - - - -+ > service type identifier 0203h
 * 4       |            03h                | /
 *         +-------------------------------+
 * 5       |            00h                | \
 *         +- - - - - - - - - - - - - - - -+ > total length, 14 octets
 * 6       |            0Eh                | /
 *         +-------------------------------+
 * 7       |            08h                | structure length
 *         +-------------------------------+
 * 8       |            01h                | host protocol code, e.g. 01h, for UDP over IPv4
 *         +-------------------------------+
 * 9       |            192                | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 10      |            168                | |
 *         +- - - - - - - - - - - - - - - -+ > IP address of control endpoint,
 * 11      |            200                | | e.g. 192.168.200.12
 *         +- - - - - - - - - - - - - - - -+ |
 * 12      |            12                 | /
 *         +-------------------------------+
 * 13      |            C3h                | \
 *         +- - - - - - - - - - - - - - - -+ > port number of control endpoint,
 * 14      |            B4h                | / e.g. 50100
 *         +-------------------------------+
 */
import * as constants from "../utils/constants";
import HPAIStructure from "./structures/HPAIStructure";
import * as knxSpec from "./structures/KNX_SPECIFICATION";

import { Message } from "./utils/Message";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.DESCRIPTION_REQUEST;

/**
 * toBuffer Example: 06100201000e0801c0a8018ac0a8
 */
export default class DescriptionRequest extends Message {
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
