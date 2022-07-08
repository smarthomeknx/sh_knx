/**
 * Source: KNX Standard - https://my.knx.org/en/shop/knx-specifications - Version: 2.1 - 2021 - 04 - 08
 * KNX Software/The KNX Standard v2.1/The KNX Standard v2.1/03 Volume 3 System Specifications/03_08_02 Core v01.05.01 AS.pdf
 * 8.8.2 SEARCH_RESPONSE
 *
 * EXAMPLE
 *        +-------------------------------+
 *  1     |              06h              |    header size
 *        +-------------------------------+
 *  2     |              10h              |    protocol version
 *        +-------------------------------+
 *  3     |              02h              | \
 *        +- - - - - - - - - - - - - - - -+  > service type identifier 0202h
 *  4     |              02h              | /
 *        +-------------------------------+
 *  5     |              00h              | \
 *        +- - - - - - - - - - - - - - - -+  > total length, 78 octets
 *  6     |              4Eh              | /
 *        +-------------------------------+
 *  7     |              08h              |    structure length (HPAI)
 *        +-------------------------------+
 *  8     |              01h              |    host protocol code, e.g. 01h, for UDP over IPv4
 *        +-------------------------------+
 *  9     |              192              | \
 *        +- - - - - - - - - - - - - - - -+ |
 * 10     |              168              | |
 *        +- - - - - - - - - - - - - - - -+  > IP address of control endpoint,
 * 11     |              200              | |   e.g. 192.168.200.12
 *        +- - - - - - - - - - - - - - - -+ |
 * 12     |               12              | /
 *        +-------------------------------+
 * 13     |              C3h              | \
 *        +- - - - - - - - - - - - - - - -+  > port number of control endpoint,
 * 14     |              B4h              | /   e.g. 50100
 *        +-------------------------------+
 * 15     |              36h              |    structure length (DIB hardware)
 *        +-------------------------------+
 * 16     |              01h              |    description type code, 01h = DEVICE_INFO
 *        +-------------------------------+
 * 17     |              02h              |    KNX medium, 02h = TP1 (KNX TP)
 *        +-------------------------------+
 * 18     |              01h              |    Device Status, 01h = programming mode
 *        +-------------------------------+
 * 19     |              11h              | \
 *        +- - - - - - - - - - - - - - - -+  > KNX Individual Address, e.g. 1.1.0
 * 20     |              00h              | /
 *        +-------------------------------+
 * 21     |              00h              | \
 *        +- - - - - - - - - - - - - - - -+  > Project-Installation ID, e.g. 0011h
 * 22     |              11h              | /
 *        +-------------------------------+
 * 23     |              00h              | \
 *        +- - - - - - - - - - - - - - - -+ |
 * 24     |              01h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 25     |              11h              | |
 *        +- - - - - - - - - - - - - - - -+  > KNX device KNX Serial Number,
 * 26     |              11h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 27     |              11h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 28     |              11h              | /
 *        +-------------------------------+
 * 29     |              224              | \
 *        +- - - - - - - - - - - - - - - -+ |
 * 30     |                0              | |
 *        +- - - - - - - - - - - - - - - -+  > device routing multicast address
 * 31     |               23              | |   e.g. 224.0.23.12
 *        +- - - - - - - - - - - - - - - -+ |
 * 32     |               12              | /
 *        +-------------------------------+
 * 33     |              45h              | \
 *        +- - - - - - - - - - - - - - - -+ |
 * 34     |              49h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 35     |              42h              | |
 *        +- - - - - - - - - - - - - - - -+  > KNXnet/IP MAC address
 * 36     |              6Eh              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 37     |              65h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 38     |              74h              | /
 *        +-------------------------------+
 * 39     |              ‘M’              | \
 *        +- - - - - - - - - - - - - - - -+ |
 * 40     |              ‘Y’              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 41     |              ‘H’              | |
 *        +- - - - - - - - - - - - - - - -+  > Device Friendly Name, e.g. “MYHOME”
 * 42     |              ‘O’              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 43     |              ‘M’              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 44     |              ‘E’              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 45     |              00h              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * ..     |              ...              | |
 *        +- - - - - - - - - - - - - - - -+ |
 * 68     |              00h              | /
 *        +-------------------------------+
 * 69     |              0Ah              |    structure length (DIB supported service family)
 *        +-------------------------------+
 * 70     |              02h              |    description type code, 02h = SUPP_SVC_FAMILIES
 *        +-------------------------------+
 * 71     |              02h              |    service family, e.g. 02h = KNXnet/IP Core
 *        +-------------------------------+
 * 72     |              01h              |    service family version, e.g. 01h
 *        +-------------------------------+
 * 73     |              03h              |    service family, e.g. 03h = KNXnet/Device Mgmt
 *        +-------------------------------+
 * 74     |              01h              |    service family version, e.g. 01h
 *        +-------------------------------+
 * 75     |              04h              |    service family, e.g. 04h = KNXnet/IP Tunnelling
 *        +-------------------------------+
 * 76     |              01h              |    service family version, e.g. 01h
 *        +-------------------------------+
 * 77     |              05h              |    service family, e.g. 05h = KNXnet/IP Routing
 *        +-------------------------------+
 * 78     |              01h              |    service family version, e.g. 01h
 *        +-------------------------------+
 *
 */
import * as constants from "../utils/constants";
import * as knxSpec from "./structures/KNX_SPECIFICATION";
import { Message } from "./utils/Message";
import DIBHardwareStructure from "./structures/DIBHardwareStructure";
import DIBSupportedServiceFamilyStructure from "./structures/DIBSupportServiceFamilyStructure";
import HPAIStructure from "./structures/HPAIStructure";

const MESSAGE_TYPE = knxSpec.SERVICE_TYPE.SEARCH_RESPONSE;

export default class SearchResponse extends Message {
  readonly hpaiStructure: HPAIStructure;
  readonly dibHardwareStructure: DIBHardwareStructure;
  readonly dibSupportedServiceFamilyStructure: DIBSupportedServiceFamilyStructure;

  constructor() {
    super(MESSAGE_TYPE);
    this.hpaiStructure = new HPAIStructure();
    this.dibHardwareStructure = new DIBHardwareStructure();
    this.dibSupportedServiceFamilyStructure = new DIBSupportedServiceFamilyStructure();
    this.structures.push(this.hpaiStructure, this.dibHardwareStructure, this.dibSupportedServiceFamilyStructure);
  }

  setDefaultValues(): void {
    super.setDefaultValues();
    this.headerStructure.data.ServiceType = MESSAGE_TYPE;
    this.hpaiStructure.data.ProtocolCode = knxSpec.HOST_PROTOCOL_CODES.IPV4_UDP;
    this.hpaiStructure.data.IPAddress = constants.SERVER_IP_ADDRESS;
    this.hpaiStructure.data.Port = constants.SERVER_PORT;
    this.dibHardwareStructure.data.KNXMedium = knxSpec.KNX_MEDIUM_CODE.TP1;
    this.dibHardwareStructure.data.DescriptionTypeCode = knxSpec.DESCRIPTION_TYPE_CODE.DEVICE_INFO;
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.CORE);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.DEVICE_MANAGEMENT);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.TUNNELING);
    this.dibSupportedServiceFamilyStructure.addServiceFamily(knxSpec.SERVICE_FAMILY.ROUTING);
  }
}
