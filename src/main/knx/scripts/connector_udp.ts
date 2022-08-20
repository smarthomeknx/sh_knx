import { STATUS_LOG, TRACE } from "../utils/logging";
import IPScanner, { IPScanResult } from "../devices/IPScanner";
import * as constants from "../utils/constants";
import * as knxSpec from "../messages/structures/KNX_SPECIFICATION";
import IPConnector, { IPConnectorSettings } from "../devices/IPConnector";
import { Protocol } from "../utils/types";

const CONNECTOR_CONFIG: IPConnectorSettings = {
  type: typeof IPScanner,
  protocol: Protocol.UDP,
  local: {
    ipAddress: constants.CLIENT_IP_ADDRESS,
    port: constants.CLIENT_PORT
  },
  remote: {
    ipAddress: "192.168.1.160",
    port: 3671
  },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

(async () => {
  try {
    STATUS_LOG.info("Connecting to KNX Devices at %s", CONNECTOR_CONFIG.remote.ipAddress);

    //STATUS_LOG.info("Finished scanning. Found %s KNX Devices", scanner.scanResults.size);
    //const CONNECTION_SELECTION = "112.179.213.220.139.63"; // should be done via API / Config
    //const target: IPScanResult | undefined = scanner.scanResults.get(CONNECTION_SELECTION);

    STATUS_LOG.info(
      "Start connection to device at '%s:%s'.",
      CONNECTOR_CONFIG.remote.ipAddress,
      CONNECTOR_CONFIG.remote.port
    );

    const connector = new IPConnector("IP_CONNECTOR", CONNECTOR_CONFIG);
    await connector.powerOn();
    await connector.connect(5000);
  } catch (e) {
    console.log("Message sent error");
  }
})();
