import BusMonitor from "../devices/BusMonitor";
import { UDPDeviceSettings } from "../devices/UDPDevice";
import * as constants from "../utils/constants";

// TODO Config configurable
const BUS_MONITOR_CONFIG: UDPDeviceSettings = {
  type: typeof BusMonitor,
  ipAddress: constants.CLIENT_IP_ADDRESS,
  ipPort: constants.CLIENT_PORT,
  multicast: { ipAddress: constants.MULTICAST_IP_ADDRESS, ipPort: constants.SERVER_PORT },
  knxIndividualAddress: "255.255",
  projectInstallationID: "00.01",
  knxSerialNumber: constants.SERVER_SERIAL_NUMBER,
  macAddress: constants.SERVER_MAC_ADDRESS,
  friendlyName: constants.SERVER_FRIENDLY_NAME
};

const busMonitor = new BusMonitor("BUS_MONITOR", BUS_MONITOR_CONFIG);
(async () => {
  try {
    await busMonitor.powerOn();
    await busMonitor.triggerSearchRequest();
  } catch (e) {
    console.log("Message sent error");
  }
})();
