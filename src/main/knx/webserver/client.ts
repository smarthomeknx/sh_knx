import ETSSoftware from "../devices/ETSSoftware";
import { UDPDeviceSettings } from "../devices/base/UDPDevice";
import * as constants from "../utils/constants";

const ETS_SOFTWARE_CONFIG: UDPDeviceSettings = {
  type: typeof ETSSoftware,
  ipAddress: constants.CLIENT_IP_ADDRESS,
  port: constants.CLIENT_PORT,
  multicast: { ipAddress: constants.MULTICAST_IP_ADDRESS, port: constants.SERVER_PORT },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

const etsSoftware = new ETSSoftware("ETS_FAKE", ETS_SOFTWARE_CONFIG);
(async () => {
  try {
    await etsSoftware.powerOn();
    await etsSoftware.triggerSearchRequest();
  } catch (e) {
    console.log("Message sent error");
  }
})();

// import dgram from "dgram";
// import SearchRequest from "./messages/SearchRequest";
// import * as constants from "./utils/constants";
// import { STATUS_LOG, MESSAGE_LOG, logBuffer } from "./utils/logging";
// import UDPRequest from "./messages/UDPRequest";
// import MessageHandler from "./messages/utils/MessageHandler";
// //import * as MessageBuilder from "./utils/MessageBuilder";

// //const message = Buffer.from("06100201000E0801C0A8018AEE40", "hex");
// //const message = Buffer.from(MessageBuilder.SEARCH_REQUEST(), "hex");
// const searchRequest: SearchRequest = new SearchRequest();
// searchRequest.setDefaultValues();
// const message = searchRequest.toBuffer(); //Buffer.from(MessageBuilder.SEARCH_REQUEST(), "hex");

// //new SearchRequest().fromBuffer(message);
// // this is kind of ETS
// const client = dgram.createSocket("udp4");

// // C0A8 => 49320

// client.on("listening", () => {
//   console.log(`UDP Server listening on ${client.address().address}:${client.address().port}`);
// });

// new MessageHandler(client);

// // client.on("message", (message: Buffer, remoteInfo: dgram.RemoteInfo) => {
// //   MESSAGE_LOG.debug(remoteInfo.address + ":" + remoteInfo.port + " - INCOMING RAW MESSAGE: " + logBuffer(message));
// //   const request: UDPRequest = new UDPRequest(message, remoteInfo);
// //   const serviceType = request.identifyMessage();
// //   if (!serviceType) throw Error("Can't get service type from message " + message.toString("hex"));
// //   request.log.info("%s:%s - INCOMING IDENTIFIED MESSAGE: %s", remoteInfo.address, remoteInfo.port, logBuffer(message));
// // });

// client.bind(constants.CLIENT_PORT, constants.CLIENT_IP_ADDRESS);

// client.send(message, 0, message.length, constants.PORT, constants.MULTICAST_IP_ADDRESS, (error, bytes: number) => {
//   if (error) throw error;
//   console.log(`SENT to ${constants.MULTICAST_IP_ADDRESS}:${constants.PORT} MSG: ${message.toString("hex")}`);
//   //client.close();
// });

// //UDP Server listening on 127.0.0.1:49320
// //SENT to 127.0.0.1:3671: 06100201000e0801c0a8018aee40
// //127.0.0.1:3671 - 06100202004e08017f0000010e5736010200ffff000100fa00000001e000170c060606030e474b4e58205669727475616c200000000000000000000000000000000000000a020201030104010501

// //UDP Server listening on 127.0.0.1:3671
// //127.0.0.1:63034 - 06100203000e0801000000000000
// //127.0.0.1:63035 - 06100205001a08017f000001f63b08017f000001f63c04040200
// //127.0.0.1:65486 - 06100203000e0801000000000000
// //127.0.0.1:65487 - 06100205001a08017f000001ffcf08017f000001ffd004040200
// //06 10 02 01 00 0E 08 01 C0 A8 01 8A EE 40

// // import * as net from 'net';

// // const port = 8124;

// // var client = net.connect(port, "localhost", function() { //'connect' listener
// //   console.log('client connected');
// //   client.write('world!\r\n');
// // });
// // client.on('data', function(data: any) {
// //   console.log(data.toString());
// //   client.end();
// // });
// // client.on('end', function() {
// //   console.log('client disconnected');
// // });

// // var PORT = 33333;
// // var HOST = '127.0.0.1';

// // var dgram = require('dgram');
// // var message = new Buffer('My KungFu is Good!');

// // var client = dgram.createSocket('udp4');
// // client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
// //   if (err) throw err;
// //   console.log('UDP message sent to ' + HOST +':'+ PORT);
// //   client.close();
// // });
