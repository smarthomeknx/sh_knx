import { STATUS_LOG, TRACE } from "../utils/logging";
import IPScanner from "../devices/IPScanner";
import { IPScannerSettings } from "../devices/IPScanner";
import * as constants from "../utils/constants";
import * as knxSpec from "../messages/structures/KNX_SPECIFICATION";
import { stringify } from "querystring";

// TODO Config configurable
const SCANNER_CONFIG: IPScannerSettings = {
  type: typeof IPScanner,
  local: {
    ipAddress: constants.CLIENT_IP_ADDRESS,
    port: constants.CLIENT_PORT
  },
  multicast: {
    ipAddress: knxSpec.KNXIP_CONSTANTS.KNX_NET_IP_SETUP_MULTICAST_ADDRESS,
    port: knxSpec.KNXIP_CONSTANTS.KNX_NET_IP_Port
  },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

const scanner = new IPScanner("IP_SCANNER", SCANNER_CONFIG);
(async () => {
  try {
    STATUS_LOG.info("Scanning for KNX Devices");
    await scanner.powerOn();

    const results = await scanner.search();
    //console.log("STOP SCANNING, FOUND: " + JSON.stringify(scanner.results));
    //console.log("STOP SCANNING, RESULT: " + JSON.stringify(results));
    await scanner.powerOff();
    STATUS_LOG.info("Finished scanning. Found %s KNX Devices", scanner.scanResults.size);
    const CONNECTION_SELECTION = "112.179.213.220.139.63"; // should be done via API / Config
    STATUS_LOG.info(
      "Start connection to device '%s'. Details: %s",
      CONNECTION_SELECTION,
      scanner.scanResults.get(CONNECTION_SELECTION)
    );
  } catch (e) {
    console.log("Message sent error");
  }
})();
