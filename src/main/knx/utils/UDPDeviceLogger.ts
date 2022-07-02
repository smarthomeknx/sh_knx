import { RemoteInfo } from "dgram";
import winston from "winston";
import { UDPDeviceSettings } from "../devices/UDPDevice";
import { logBuffer, logBufferCSV, toCSVString } from "./logging";
const { combine, splat, simple, timestamp, colorize, label, printf } = winston.format;

export interface UDPMessage {
  buffer?: Buffer;
  direction: "INCOMING" | "OUTGOING";
  remote: Partial<RemoteInfo>;
  serviceType?: string;
}

interface UDPLogCSVLine {
  timestamp: string;
  label: string;
  level: string;
  socketIPAddressPart: string;
  socketIPPortPart: string;
  externalIPAddressPart: string;
  externalIPPortPart: string;
  direction: string;
  serviceTypePart: string;
  message: string;
  bufferPart?: string;
}

const udpDeviceLogCSVFormat = printf(({ level, message, label, timestamp, udpDeviceSettings, udpMessage }) => {
  console.log("Should log something ");
  const device = udpDeviceSettings as Partial<UDPDeviceSettings>;
  const udpMsg = udpMessage as Partial<UDPMessage>;
  const logLine: UDPLogCSVLine = {
    timestamp: toCSVString(timestamp),
    label: toCSVString(label),
    level: toCSVString(level),
    socketIPAddressPart: toCSVString(device.ipAddress),
    socketIPPortPart: toCSVString(device.ipPort),
    externalIPAddressPart: toCSVString(udpMsg.remote ? udpMsg.remote.address : ""),
    externalIPPortPart: toCSVString(udpMsg.remote ? udpMsg.remote.port : ""),
    direction: toCSVString(udpMsg.direction),
    serviceTypePart: toCSVString(udpMsg.serviceType),
    message: toCSVString(message),
    bufferPart: toCSVString(udpMsg.buffer ? logBufferCSV(udpMsg.buffer) : "")
  };
  const line = toCSVLine(logLine);
  return line;
});

const udpDeviceLogConsoleFormat = printf(({ level, message, label, timestamp, udpDeviceSettings, udpMessage }) => {
  const device = udpDeviceSettings as Partial<UDPDeviceSettings>;
  const udpMsg = udpMessage as Partial<UDPMessage>;
  // const logLine: UDPLogCSVLine = {
  //   timestamp: toCSVString(timestamp),
  //   label: toCSVString(label),
  //   level: toCSVString(level),
  //   socketIPAddressPart: toCSVString(device.ipAddress),
  //   socketIPPortPart: toCSVString(device.ipPort),
  const remoteIPAddressPart = udpMsg.remote ? udpMsg.remote.address : "?";
  const remoteIPPortPart = udpMsg.remote ? udpMsg.remote.port : "?";
  //   direction: toCSVString(udpMsg.direction),
  //   serviceTypePart: toCSVString(udpMsg.serviceType),
  //   message: toCSVString(message)
  // };
  // let line = toCSVLine(logLine);
  // if (udpMsg.buffer) {
  //   const buffer = logBuffer(udpMsg.buffer, 0x10);
  //   line += buffer;
  // }

  let directionPart = udpMsg.direction;
  switch (udpMsg.direction) {
    case "INCOMING":
      directionPart += " FROM ";
      break;
    case "OUTGOING":
      directionPart += " TO ";
      break;
  }
  return `${timestamp} ${level} - ${device.friendlyName || "UNKNOWN"}(${device.ipAddress} ${device.ipPort}) -  ${
    udpMsg.serviceType
  } ${directionPart} ${remoteIPAddressPart}:${remoteIPPortPart}: ${message}`;
});

const toCSVLine = (logData: UDPLogCSVLine): string => {
  const lineData = (<unknown>logData) as Record<string, string>;
  let line = "";
  Object.keys(lineData).forEach((key) => {
    line += lineData[key];
  });
  return line;
};

const UDP_LOG = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple(), label({ label: "UDP_LOG" }), timestamp(), udpDeviceLogConsoleFormat)
});

export const createUDBDeviceLogger = (settings: Partial<UDPDeviceSettings>): winston.Logger => {
  return UDP_LOG.child({ udpDeviceSettings: settings });
};

if (process.env.NODE_ENV !== "production") {
  UDP_LOG.add(
    new winston.transports.Console({
      level: "debug",
      format: combine(timestamp(), splat(), simple(), label(), colorize({ all: true }), udpDeviceLogConsoleFormat)
    })
  );
} else {
  UDP_LOG.add(
    new winston.transports.File({
      filename: "./logs/udp.log",
      level: "debug",
      format: combine(splat(), simple(), label(), timestamp(), udpDeviceLogConsoleFormat)
    })
  );
}
