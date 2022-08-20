import * as net from "net";
import { STATUS_LOG, TRACE } from "../utils/logging";
import * as constants from "../utils/constants";

const SERVER_CONFIG = {
  local: {
    ipAddress: constants.SERVER_IP_ADDRESS,
    port: constants.SERVER_PORT
  },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

(async () => {
  try {
    STATUS_LOG.info("Listening at %s:%s", SERVER_CONFIG.local.ipAddress, SERVER_CONFIG.local.port);
    const server = net.createServer();

    server.on("connection", (socket) => {
      console.log("new connection");
      socket.on("data", (buffer) => {
        console.log("data");
        console.log(buffer);
        //socket.write(buffer);
        console.log("done with connection");
        //socket.end();
      });
    });

    await server.listen(SERVER_CONFIG.local.port, SERVER_CONFIG.local.ipAddress, () => {
      console.log("here");
    });

    console.log("Running?");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("5 sec later...");
    console.log("Good Bye!");
  } catch (e) {
    console.log("Message sent error");
  }
})();
