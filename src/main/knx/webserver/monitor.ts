import IPClient from "../devices/IPClient";
import { UDPDeviceSettings } from "../devices/UDPDevice";
import * as constants from "../utils/constants";
import * as knxSpec from "../messages/structures/KNX_SPECIFICATION";

// TODO Config configurable
const BUS_MONITOR_CONFIG: UDPDeviceSettings = {
  type: typeof IPClient,
  ipAddress: constants.CLIENT_IP_ADDRESS,
  ipPort: constants.CLIENT_PORT,
  multicast: {
    ipAddress: knxSpec.KNXIP_CONSTANTS.KNX_NET_IP_SETUP_MULTICAST_ADDRESS,
    ipPort: knxSpec.KNXIP_CONSTANTS.KNX_NET_IP_Port
  },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

const busMonitor = new IPClient("BUS_MONITOR", BUS_MONITOR_CONFIG);
(async () => {
  try {
    await busMonitor.powerOn();
    await busMonitor.discover();
  } catch (e) {
    console.log("Message sent error");
  }
})();
