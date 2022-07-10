/* *********************************** */
/* KNX SPECIFICATIONS                  */
/* *********************************** */
export const PROTOCOL_VERSION = 0x10;

export const COMMON_CONSTANTS = {
  KNXNETIP_VERSION_10: 0x10, // Identifier for KNXnet/IP protocol version 1.0
  HEADER_SIZE_10: 0x06 // Constant size of KNXnet/IP header as defined in protocol version 1.0
};

export const KNXIP_CONSTANTS = {
  KNX_NET_IP_Port: 3671,
  KNX_NET_IP_SETUP_MULTICAST_ADDRESS: "224.0.23.12"
};

export enum KNX_RESERVED {
  RESERVED = 0x00
}

export enum SERVICE_TYPE {
  UNDEFINED = 0x0000,
  SEARCH_REQUEST = 0x0201,
  SEARCH_RESPONSE = 0x0202,
  DESCRIPTION_REQUEST = 0x0203,
  DESCRIPTION_RESPONSE = 0x0204,
  CONNECT_REQUEST = 0x0205,
  CONNECT_RESPONSE = 0x0206,
  CONNECTIONSTATE_REQUEST = 0x0207,
  CONNECTIONSTATE_RESPONSE = 0x0208,
  DISCONNECT_REQUEST = 0x0209,
  DISCONNECT_RESPONSE = 0x020a,
  NOT_DOCUMENTED_IN_KNX = 0x020b,
  // ROUTING_INDICATION
  DEVICE_CONFIGURATION_REQUEST = 0x0310,
  DEVICE_CONFIGURATION_ACK = 0x0311,
  TUNNELING_REQUEST = 0x0420,
  TUNNELING_ACK = 0x0421,
  ROUTING_INDICATION = 0x0530,
  ROUTING_LOST_MESSAGE = 0x531
}

// Service type number ranges
// 0200h   ... 020F    KNXnet/IP Core
// 0310h   ... 031F    KNXnet/IP Device Management
// 0420h   ... 042F    KNXnet/IP Tunnelling
// 0530h   ... 053F    KNXnet/IP Routing
// 0600h   ... 06FF    KNXnet/IP Remote Logging
// 0740h   ... 07FF    KNXnet/IP Remote Configuration and Diagnosis
// 0800h   ... 08FF    KNXnet/IP Object Server
export enum SERVICE_FAMILY {
  CORE = 0x02,
  DEVICE_MANAGEMENT = 0x03,
  TUNNELING = 0x04,
  ROUTING = 0x05,
  REMOTE_LOGGIN = 0x06,
  REMOTE_CONFIG_AND_DIAG = 0x07,
  OBJECT_SERVER = 0x08
}

export const TOTAL_LENGTHS: number[] = [];
TOTAL_LENGTHS[SERVICE_TYPE.SEARCH_REQUEST] = 0x000e;
TOTAL_LENGTHS[SERVICE_TYPE.SEARCH_RESPONSE] = 0x004e;

// {
//     SEARCH_REQUEST: 0x000E
// }

export enum HOST_PROTOCOL_CODES {
  IPV4_UDP = 0x01,
  IPV4_TCP = 0x02
}

export enum DESCRIPTION_TYPE_CODE {
  DEVICE_INFO = 0x01, //Device information e.g. KNX medium.
  SUPP_SVC_FAMILIES = 0x02, //Service families supported by the device.
  IP_CONFIG = 0x03, //IP configuration
  IP_CUR_CONFIG = 0x04, //current configuration
  KNX_ADDRESSES = 0x05, //KNX addresses
  // Reserved 06h to FDhReserved for future use.
  MFR_DATA = 0xfe //DIB structure for further data defined by device manufacturer.
  //not usedFFhNot used.
}

export enum KNX_MEDIUM_CODE {
  RESERVED1 = 0x01,
  TP1 = 0x02,
  PL110 = 0x04,
  RESERVED8 = 0x08,
  RF = 0x10,
  KNX_IP = 0x20
}

export enum KNX_DEVICE_STATUS {
  PROG_MODE_ON = 0x01,
  PROG_MODE_OFF = 0x00
}

export enum CONNECTION_TYPE_CODE {
  DEVICE_MGMT_CONNECTION = 0x03,
  TUNNEL_CONNECTION = 0x04,
  REMOTE_LOGGING_CONNECTION = 0x06,
  REMOTE_CONFIGURATION_CONNECTION = 0x07,
  OBJECT_SERVER_CONNECTION = 0x08
}

export enum TUNNELING_LAYER {
  TUNNEL_LINKLAYER = 0x02,
  TUNNEL_RAW = 0x04,
  TUNNEL_BUSMONITOR = 0x80
}

const enum RESPONSE_CODE {
  NO_ERROR = 0x00, // E_NO_ERROR - The connection was established succesfully
  E_HOST_PROTOCOL_TYPE = 0x01,
  E_VERSION_NOT_SUPPORTED = 0x02,
  E_SEQUENCE_NUMBER = 0x04,
  E_CONNSTATE_LOST = 0x15, // typo in eibd/libserver/eibnetserver.cpp:394, forgot 0x prefix ??? "uchar res = 21;"
  E_CONNECTION_ID = 0x21, // - The KNXnet/IP server device could not find an active data connection with the given ID
  E_CONNECTION_TYPE = 0x22, // - The requested connection type is not supported by the KNXnet/IP server device
  E_CONNECTION_OPTION = 0x23, // - The requested connection options is not supported by the KNXnet/IP server device
  E_NO_MORE_CONNECTIONS = 0x24, //  - The KNXnet/IP server could not accept the new data connection (Maximum reached)
  E_DATA_CONNECTION = 0x26, // - The KNXnet/IP server device detected an erro concerning the Dat connection with the given ID
  E_KNX_CONNECTION = 0x27, // - The KNXnet/IP server device detected an error concerning the KNX Bus with the given ID
  E_TUNNELING_LAYER = 0x29
}

const MESSAGE_CODE = {
  "L_Raw.req": 0x10,
  "L_Data.req": 0x11,
  "L_Poll_Data.req": 0x13,
  "L_Poll_Data.con": 0x25,
  "L_Data.ind": 0x29,
  "L_Busmon.ind": 0x2b,
  "L_Raw.ind": 0x2d,
  "L_Data.con": 0x2e,
  "L_Raw.con": 0x2f,
  "ETS.Dummy1": 0xc1 // UNKNOWN: see https://bitbucket.org/ekarak/knx.js/issues/23
};

const APCI_CODE = [
  "GroupValue_Read",
  "GroupValue_Response",
  "GroupValue_Write",
  "PhysicalAddress_Write",
  "PhysicalAddress_Read",
  "PhysicalAddress_Response",
  "ADC_Read",
  "ADC_Response",
  "Memory_Read",
  "Memory_Response",
  "Memory_Write",
  "UserMemory",
  "DeviceDescriptor_Read",
  "DeviceDescriptor_Response",
  "Restart",
  "OTHER"
];
