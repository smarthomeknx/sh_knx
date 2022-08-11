import { STATUS_LOG, TRACE } from "../utils/logging";
import IPScanner, { IPScanResult } from "../devices/IPScanner";
import { IPScannerSettings } from "../devices/IPScanner";
import * as constants from "../utils/constants";
import * as knxSpec from "../messages/structures/KNX_SPECIFICATION";
import { stringify } from "querystring";
import IPConnector, { IPConnectorSettings } from "../devices/IPConnector";
import { Protocol } from "../utils/types";

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

// const CONNECTOR_CONFIG: IPConnectorSettings = {
//   type: typeof IPScanner,
//   protocol: Protocol.UDP,
//   local: {
//     ipAddress: constants.CLIENT_IP_ADDRESS,
//     port: constants.CLIENT_PORT
//   },
//   remote: {
//     // would be updated based on scan result
//     ipAddress: "later",
//     port: -1
//   },
//   knxIndividualAddress: "255.255",
//   projectInstallationID: "00.01",
//   knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
//   macAddress: constants.SERVER_MAC_ADDRESS,
//   friendlyName: constants.SERVER_FRIENDLY_NAME
// };

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
    const target: IPScanResult | undefined = scanner.scanResults.get(CONNECTION_SELECTION);

    if (target) {
      // validate if scan result is complete:
      if (!target.hardware.DeviceFriendlyName) {
        throw new Error("Can't build IPConnector from Scan result. Missing required value of 'DeviceFriendlyName'");
      }

      if (!target.hardware.KNXIndividualAddress) {
        throw new Error("Can't build IPConnector from Scan result. Missing required value of 'KNXIndividualAddress'");
      }

      if (!target.hpai.IPAddress) {
        throw new Error("Can't build IPConnector from Scan result. Missing required value of 'IPAddress'");
      }

      if (!target.hpai.Port) {
        throw new Error("Can't build IPConnector from Scan result. Missing required value of 'Port'");
      }

      const CONNECTOR_CONFIG: IPConnectorSettings = {
        type: typeof IPScanner,
        protocol: Protocol.UDP,
        local: {
          ipAddress: constants.CLIENT_IP_ADDRESS,
          port: constants.CLIENT_PORT
        },
        remote: {
          // would be updated based on scan result
          ipAddress: target.hpai.IPAddress,
          port: target.hpai.Port
        },
        knxIndividualAddress: "255.255",
        projectInstallationID: "00.01",
        knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
        macAddress: constants.SERVER_MAC_ADDRESS,
        friendlyName: constants.SERVER_FRIENDLY_NAME
      };

      STATUS_LOG.info(
        "Start connection to device '%s' at '%s:%s'. Details: %s",
        CONNECTION_SELECTION,
        target.hpai.IPAddress,
        target.hpai.Port,
        target.hardware
      );

      const connector = new IPConnector("IP_CONNECTOR", CONNECTOR_CONFIG);
      await connector.powerOn();
      await connector.connect(5000);
    } else {
      STATUS_LOG.info(
        "Can't to device '%s' - no scan result for this mac address was found. Please check your network connection.",
        CONNECTION_SELECTION
      );
    }
  } catch (e) {
    console.log("Message sent error");
  }
})();
