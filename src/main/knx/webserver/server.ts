import path from "path";
process.env["NODE_CONFIG_DIR"] =
  path.resolve(__dirname, "../../../config") + path.delimiter + path.resolve(__dirname, "../../config"); // settings in both files will overwrite, so the last one wins
console.log("Config source folder(s):%s", process.env["NODE_CONFIG_DIR"]);
import express from "express";
import { Logger } from "winston";
import { WEBSERVER_LOG, WEBSERVER_REQUEST_LOG } from "../utils/logging";
import yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import config from "config";
import * as Hardware from "../devices/index";
//import { DeviceSettings } from "smarthomeknx-knx/dist/hardware";

WEBSERVER_LOG.debug(
  "\n***************  Configuration  **************\n%s\n**********************************************",
  yaml.dump({ sources: config.util.getConfigSources() })
);
const app = express();
const port = 3000;

interface IDeviceConfig {
  id: number;
  settings: Hardware.DeviceSettings;
  // instance?: Hardware.Device<Hardware.DeviceSettings>;
}

const deviceConfigs: IDeviceConfig[] = config.get("knx.devices");
const deviceMap: Map<number, Hardware.Device<Hardware.DeviceSettings>> = new Map();
deviceConfigs.forEach((deviceConfig: IDeviceConfig) => {
  try {
    deviceMap.set(deviceConfig.id, Hardware.Factory.build("DEVICE_" + deviceConfig.id, deviceConfig.settings));
  } catch (e) {
    WEBSERVER_LOG.warn(
      "Can't create hardware device for id: %s with settings: %s\n because: %s",
      deviceConfig.id,
      deviceConfig.settings,
      e
    );
  }
});

interface ExtendedRequest extends Request {
  correlationId?: string;
  log: Logger;
}

app.use((req, res, done) => {
  const extendedRequest = <ExtendedRequest>(<unknown>req);
  extendedRequest.correlationId = uuidv4();
  extendedRequest.log = WEBSERVER_REQUEST_LOG.child({ correlationId: extendedRequest.correlationId });
  extendedRequest.log.info("Incoming request: %s", req.originalUrl);
  done();
});

app.get("/deviceConfigs", (req, res) => {
  const extendedRequest = <ExtendedRequest>(<unknown>req);
  extendedRequest.log.debug("Fetching devices...");
  res.json(deviceConfigs);
});

app.get("/devices/:deviceId/start", (req, res) => {
  const extendedRequest = <ExtendedRequest>(<unknown>req);
  const deviceId: number = parseInt(req.params.deviceId);
  const device: Hardware.Device<Hardware.DeviceSettings> | undefined = deviceMap.get(deviceId);
  if (!device) {
    res.sendStatus(404).send("No device with id " + deviceId);
  } else {
    extendedRequest.log.info("Starting device with %s", deviceId);
    (device as Hardware.IPRouter).powerOn();
    res.send("Starting device " + deviceId);
  }
});

app.listen(port, () => {
  WEBSERVER_LOG.info("%s (SmartHomeKNX Server) listening at http://localhost:%s", config.get("server.name"), port);
});

const autostart = async () => {
  const device: Hardware.Device<Hardware.DeviceSettings> | undefined = deviceMap.get(1);
  await (device as Hardware.IPRouter).powerOn();
};

(async () => {
  try {
    await autostart();
  } catch (e) {
    console.log("Start observers error");
  }
})();
