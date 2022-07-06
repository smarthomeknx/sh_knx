import { AddressInfo, Server } from "net";
import winston, { add } from "winston";
import { TCPDeviceSettings } from "../devices/TCPDevice";
import { logBuffer, logBufferCSV, toCSVString } from "./logging";
const { combine, splat, simple, timestamp, colorize, label, printf } = winston.format;

export interface TCPMessage {
  buffer?: Buffer;
  direction: "INCOMING" | "OUTGOING";
  remote: Partial<Server>;
  serviceType?: string;
}

interface TCPLogCSVLine {
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

const tcpDeviceLogCSVFormat = printf(({ level, message, label, timestamp, tcpDeviceSettings, tcpMessage }) => {
  console.log("Should log something ");
  const device = tcpDeviceSettings as Partial<TCPDeviceSettings>;
  const tcpMsg = tcpMessage as Partial<TCPMessage>;

  // const address = tcpMsg.remote ? tcpMsg.remote.address : undefined;
  // if (address) {
  //   if (typeof address === "string") {
  //     const a = 0;
  //   } else {
  //     const addressInfo = address as unknown as AddressInfo;
  //   }
  // }

  const logLine: TCPLogCSVLine = {
    timestamp: toCSVString(timestamp),
    label: toCSVString(label),
    level: toCSVString(level),
    socketIPAddressPart: toCSVString(device.ipAddress),
    socketIPPortPart: toCSVString(device.ipPort),
    //externalIPAddressPart: toCSVString(tcpMsg.remote ? tcpMsg.remote.address : ""),
    //externalIPPortPart: toCSVString(tcpMsg.remote ? tcpMsg.remote.address.port : ""),
    externalIPAddressPart: toCSVString("TODO"),
    externalIPPortPart: toCSVString("TODO"),
    direction: toCSVString(tcpMsg.direction),
    serviceTypePart: toCSVString(tcpMsg.serviceType),
    message: toCSVString(message),
    bufferPart: toCSVString(tcpMsg.buffer ? logBufferCSV(tcpMsg.buffer) : "")
  };
  const line = toCSVLine(logLine);
  return line;
});

const tcpDeviceLogConsoleFormat = printf(({ level, message, label, timestamp, tcpDeviceSettings, tcpMessage }) => {
  const device = tcpDeviceSettings as Partial<TCPDeviceSettings>;
  if (tcpMessage) {
    const tcpMsg = tcpMessage as Partial<TCPMessage>;
    // const logLine: TCPLogCSVLine = {
    //   timestamp: toCSVString(timestamp),
    //   label: toCSVString(label),
    //   level: toCSVString(level),
    //   socketIPAddressPart: toCSVString(device.ipAddress),
    //   socketIPPortPart: toCSVString(device.ipPort),
    const remoteIPAddressPart = tcpMsg.remote ? tcpMsg.remote.address : "?";
    const remoteIPPortPart = "TODO"; //tcpMsg.remote ? tcpMsg.remote.port : "?";
    //   direction: toCSVString(tcpMsg.direction),
    //   serviceTypePart: toCSVString(tcpMsg.serviceType),
    //   message: toCSVString(message)
    // };
    // let line = toCSVLine(logLine);
    // if (tcpMsg.buffer) {
    //   const buffer = logBuffer(tcpMsg.buffer, 0x10);
    //   line += buffer;
    // }

    let directionPart = tcpMsg.direction;
    switch (tcpMsg.direction) {
      case "INCOMING":
        directionPart += " FROM ";
        break;
      case "OUTGOING":
        directionPart += " TO ";
        break;
    }
    return `${timestamp} ${level} - ${device.friendlyName || "UNKNOWN"}(${device.ipAddress} ${device.ipPort}) -  ${
      tcpMsg.serviceType
    } ${directionPart} ${remoteIPAddressPart}:${remoteIPPortPart}: ${message}`;
  } else {
    return `${timestamp} ${level} - ${device.friendlyName || "UNKNOWN"}(${device.ipAddress} ${
      device.ipPort
    }): ${message}`;
  }
});

const toCSVLine = (logData: TCPLogCSVLine): string => {
  const lineData = (<unknown>logData) as Record<string, string>;
  let line = "";
  Object.keys(lineData).forEach((key) => {
    line += lineData[key];
  });
  return line;
};

const TCP_LOG = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple(), label({ label: "TCP_LOG" }), timestamp(), tcpDeviceLogConsoleFormat)
});

export const createUDBDeviceLogger = (settings: Partial<TCPDeviceSettings>): winston.Logger => {
  return TCP_LOG.child({ tcpDeviceSettings: settings });
};

if (process.env.NODE_ENV !== "production") {
  TCP_LOG.add(
    new winston.transports.Console({
      level: "debug",
      format: combine(timestamp(), splat(), simple(), label(), colorize({ all: true }), tcpDeviceLogConsoleFormat)
    })
  );
} else {
  TCP_LOG.add(
    new winston.transports.File({
      filename: "./logs/tcp.log",
      level: "debug",
      format: combine(splat(), simple(), label(), timestamp(), tcpDeviceLogConsoleFormat)
    })
  );
}
