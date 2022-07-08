/**
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 7.7.2 DESCRIPTION_RESPONSE
 *
 *                              NXnet/IP header
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   HEADER_SIZE_10              |   KNXNETIP_VERSION            |
 *      |   (06h)                       |   (10h)                       |
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   DESCRIPTION_RESPONE                                         |
 *      |   (0204h)                                                     |
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   HEADER_SIZE_10 + sizeof(Description)                        |
 *      |                                                               |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *
 *                                KNXnet/IP body
 *      +-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+-7-+-6-+-5-+-4-+-3-+-2-+-1-+-0-+
 *      |   DIB                                                         |
 *      |   device hardware                                             |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *      |   DIB                                                         |
 *      |   supported service families                                  |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *      |   DIB                                                         |
 *      |   other device information (optional)                         |
 *      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *
 *
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 8.8.4 DESCRIPTION_RESPONSE
 *
 *         +-------------------------------+
 * 1       |            06h                | header size
 *         +-------------------------------+
 * 2       |            10h                | protocol version
 *         +-------------------------------+
 * 3       |            02h                | \
 *         +- - - - - - - - - - - - - - - -+ > service type identifier 0204h
 * 4       |            04h                | /
 *    +-------------------------------+
 * 5       |            00h                | \
 *         +- - - - - - - - - - - - - - - -+ > total length, 78 octets
 * 6       |            4Eh                | /
 *         +-------------------------------+
 * 7       |            36h                | structure length (DIB hardware)
 *         +-------------------------------+
 * 8       |            01h                | description type code, 01h = DEVICE_INFO
 *         +-------------------------------+
 * 9       |            02h                | KNX medium, 02h = TP1 (KNX TP)
 *         +-------------------------------+
 * 10      |           01h                 | Device Status, 01h = programming mode
 *         +-------------------------------+
 * 11      |           11h                 | \
 *         +- - - - - - - - - - - - - - - -+ > KNX Individual Address, e.g. 1.1.0
 * 12      |           00h                 | /
 *         +-------------------------------+
 * 14      |           00h                 | \
 *         +- - - - - - - - - - - - - - - -+ > Project-Installation ID, e.g. 0011h
 * 15      |           11h                 | /
 *         +-------------------------------+
 * 16      |           00h                 | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 17      |           01h                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 18      |           11h                 | |
 *         +- - - - - - - - - - - - - - - -+ > KNX device KNX Serial Number,
 * 19      |           11h                 | | includes manufacturer ID (2 octets)
 *         +- - - - - - - - - - - - - - - -+ |
 * 20      |           11h                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 21      |           11h                 | /
 *         +-------------------------------+
 * 22      |           224                 | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 23      |           0 |                 |
 *         +- - - - - - - - - - - - - - - -+ > device routing multicast address
 * 24      |           23 |                 | e.g. 224.0.23.12
 *         +- - - - - - - - - - - - - - - -+ |
 * 25      |           12 |                 /
 *         +-------------------------------+
 * 26      |           45h                 | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 27      |           49h                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 28      |           42h                 | |
 *         +- - - - - - - - - - - - - - - -+ > KNXnet/IP MAC address
 * 29      |           6Eh                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 30      |           65h                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 31      |           74h                 | /
 *         +-------------------------------+
 * 32      |           ‘M’                 | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 33      |           ‘Y’                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 34      |           ‘H’                 | |
 *         +- - - - - - - - - - - - - - - -+ > Device Friendly Name, e.g. “MYHOME”
 * 35      |           ‘O’                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 36      |           ‘M’                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 37      |           ‘E’                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 38      |           00h                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * ..      |           ...                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 60      |           00h                 | /
 *         +-------------------------------+
 * 61      |           0Ah                 | structure length (DIB supported service family)
 *         +-------------------------------+
 * 62      |           02h                 | description type code, 02h = SUPP_SVC_FAMILIES
 *         +-------------------------------+
 * 63      |           02h                 | service family, e.g. 02h = KNXnet/IP Core
 *         +-------------------------------+
 * 64      |           01h                 | service family version, e.g. 01h
 *         +-------------------------------+
 * 65      |           03h                 | service family, e.g. 03h = KNXnet/Device Mgmt
 *         +-------------------------------+
 * 66      |           01h                 | service family version, e.g. 01h
 *         +-------------------------------+
 * 67      |           04h                 | service family, e.g. 04h = KNXnet/IP Tunnelling
 *         +-------------------------------+
 * 68      |           01h                 | service family version, e.g. 01h
 *         +-------------------------------+
 * 69      |           05h                 | service family, e.g. 05h = KNXnet/IP Routing
 *         +-------------------------------+
 * 70      |           01h                 | service family version, e.g. 01h
 *         +-------------------------------+
 * 71      |           08h                 | structure length (DIB other device information)
 *         +-------------------------------+
 * 72      |           FEh                 | description type code, FEh = MFR_DATA
 *         +-------------------------------+
 * 73      |           00h                 | \
 *         +- - - - - - - - - - - - - - - -+ > KNX Manufacturer ID, e.g. 0001h
 * 74      |           01h                 | /
 *         +-------------------------------+
 * 75      |           ‘N’                 | \
 *         +- - - - - - - - - - - - - - - -+ |
 * 76      |           ‘1’                 | |
 *         +- - - - - - - - - - - - - - - -+ > Device Type Name, e.g. “N146”
 * 77      |           ‘4’                 | |
 *         +- - - - - - - - - - - - - - - -+ |
 * 78      |           ‘6’                 | /
 *         +-------------------------------
 *
 */
import * as knxSpec from "./structures/KNX_SPECIFICATION";
import { Message } from "./utils/Message";
import DIBHardwareStructure from "./structures/DIBHardwareStructure";
import DIBSupportedServiceFamilyStructure from "./structures/DIBSupportServiceFamilyStructure";
import DIBManufactorerDataStructure from "./structures/DIBManufactorerDataStructure";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.DESCRIPTION_RESPONSE;

export default class DescriptionResponse extends Message {
  readonly dibHardwareStructure: DIBHardwareStructure;
  readonly dibSupportedServiceFamilyStructure: DIBSupportedServiceFamilyStructure;
  readonly dibManufactorerData: DIBManufactorerDataStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.dibHardwareStructure = new DIBHardwareStructure();
    this.dibSupportedServiceFamilyStructure = new DIBSupportedServiceFamilyStructure();
    this.dibManufactorerData = new DIBManufactorerDataStructure(); // OPTIONAL
    this.structures.push(this.dibHardwareStructure, this.dibSupportedServiceFamilyStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.dibHardwareStructure.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.dibHardwareStructure.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.CORE);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.DEVICE_MANAGEMENT);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.TUNNELING);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.ROUTING);
  }
}
