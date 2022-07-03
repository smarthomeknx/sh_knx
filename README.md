# sh_knx

Default Library for KNX Communication
You can use this library to create a connection to your KNX Router via UDP (Broadcast) or directly via TCP. Within TCP you can also connect to secured Routers.

## Bus Logger

The first use case is to create the connection and trace all bus messages

## Glossary

| Term                   | Short    | Explanation                                                       |
|------------------------|----------| ------------------------------------------------------------------|
| KNXnet/IP client       | client   | IP network device that connects to KNXnet/IP server               |
| KNXnet/IP server       | server   | KNX-to-IP network connection device                               |
| KNXnet/IP device       | device   | KNX device connected to an IP network                             |

## Example Message Flow

```log
2022-07-03T10:30:21.509Z info - SMARTHOMEKNX.DE(192.168.1.138 49320) -  SEARCH_REQUEST OUTGOING TO  224.0.23.12:3671: SENT success 14 bytes:
 06 10 02 01 00 0e 08 01 c0 a8 01 8a c0 a8
2022-07-03T10:30:21.604Z debug - SMARTHOMEKNX.DE(192.168.1.138 49320) -  undefined INCOMING FROM  192.168.1.160:3671: RECEIVED MESSAGE:
 06 10 02 02 00 4e 08 01 c0 a8 01 a0 0e 57 36 01
 02 00 10 00 00 00 00 a6 13 00 03 d6 e0 00 17 0c
 70 b3 d5 dc 8b 3f 45 6e 65 72 74 65 78 20 4b 4e
 58 20 49 50 20 53 65 63 75 72 65 20 52 6f 75 74
 65 72 00 00 0a 02 02 02 03 02 04 02 05 02
```
