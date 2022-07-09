import { time } from "node:console";
import winston from "winston";
const { combine, splat, simple, timestamp, colorize, label, printf } = winston.format;

export interface RequestLogData {
  messageID: string;
  source: {
    ipAddress: string;
    port: number;
  };
  serviceType: string;
}

export interface DeviceLogData {
  device: {
    id: string;
    name: string;
    ipAddress: string;
    port: number;
  };
  deviceType: string;
}

interface RequestLogCSVLine {
  timestamp: string;
  label: string;
  level: string;
  sourceIPAddressPart: string;
  sourceIPPortPart: string;
  messageIDPart: string;
  serviceTypePart: string;
  message: string;
}

const requestLogCSVFormat = printf(({ level, message, label, timestamp, requestLogData }) => {
  const data = requestLogData as Partial<RequestLogData>;
  const logLine: RequestLogCSVLine = {
    timestamp: toCSVString(timestamp),
    label: toCSVString(label),
    level: toCSVString(level),
    sourceIPAddressPart: toCSVString(data.source ? data.source.ipAddress : ""),
    sourceIPPortPart: toCSVString(data.source ? data.source.port : ""),
    messageIDPart: toCSVString(data.messageID),
    serviceTypePart: toCSVString(data.serviceType),
    message: toCSVString(message)
  };
  const line = toCSVLine(logLine);
  return line;
  // return `${level};${timestamp};[${label}];${sourceIPAddressPart};${sourceIPPortPart};${messageIDPart};${serviceTypePart};${toCSVString(
  //   message
  // )}`;
});

const toCSVLine = (logData: RequestLogCSVLine): string => {
  const lineData = (<unknown>logData) as Record<string, string>;
  let line = "";
  Object.keys(lineData).forEach((key) => {
    line += lineData[key];
  });
  return line;
};

export const toCSVString = (value: string | number | undefined): string => {
  if (value === undefined) return ";";
  return value + ";";
};

export const logBuffer = (buffer: Buffer, lineMaxLength = 15): string => {
  //let rawBufferLog = buffer.toString("hex");
  let lineLength = 0;
  let formatedBufferLog = "\n\t";
  buffer.forEach((value, index) => {
    formatedBufferLog += buffer.readUInt8(index).toString(16).padStart(2, "0") + " ";
    lineLength++;
    if (lineLength > lineMaxLength) {
      formatedBufferLog += "\n\t";
      lineLength = 0;
    }
  });

  return formatedBufferLog;
};

export const logBufferCSV = (buffer: Buffer): string => {
  //let rawBufferLog = buffer.toString("hex");
  let formatedBufferLog = "";
  buffer.forEach((value, index) => {
    formatedBufferLog += buffer.readUInt8(index).toString(16).padStart(2, "0") + " ";
  });

  return formatedBufferLog;
};

export const LOG = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple())
});

export const TRACE = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple())
});

const UDP_REQUEST_LOG = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple(), label({ label: "UDP_REQUEST_LOG" }), timestamp(), requestLogCSVFormat)
});

export const createRequestLogger = (logData: Partial<RequestLogData>): winston.Logger => {
  return UDP_REQUEST_LOG.child({ requestLogData: logData });
};

export const STATUS_LOG = winston.createLogger({
  level: "debug",
  format: simple()
});

export const CONVERTER_LOG = winston.createLogger({
  level: "debug",
  format: simple()
});

const serverLogFormat = printf(({ level, message, label, timestamp }) => {
  return `${level}: ${timestamp} [${label}]: ${message}`;
});

export const WEBSERVER_LOG = winston.createLogger({
  level: "debug",
  format: combine(timestamp(), label({ label: "SERVER_LOG" }), splat(), simple(), serverLogFormat)
});

// export const DEVICE_LOG = winston.createLogger({
//   level: "debug",
//   format: combine(timestamp(), label({ label: "SERVER_LOG" }), splat(), simple(), deviceLogFormat)
// });

// export const createDeviceLogger = (logData: Partial<DeviceLogData>): winston.Logger => {
//   return DEVICE_LOG.child({ deviceData: logData });
// };

const requestLogFormat = printf(({ level, message, label, timestamp, correlationId }) => {
  const correlationIdPart = correlationId ? `ID: ${correlationId} ` : "";
  return `${level}: ${timestamp} [${label}] ${correlationIdPart}: ${message}`;
});

export const WEBSERVER_REQUEST_LOG = winston.createLogger({
  level: "debug",
  format: combine(splat(), simple(), label({ label: "REQUEST_LOG" }), timestamp(), requestLogFormat)
});

if (process.env.NODE_ENV !== "production") {
  LOG.add(
    new winston.transports.Console({
      level: "error",
      format: combine(colorize(), splat(), simple())
    })
  );

  TRACE.add(
    new winston.transports.Console({
      level: "debug",
      format: combine(colorize(), splat(), simple())
    })
  );

  UDP_REQUEST_LOG.add(
    new winston.transports.Console({
      level: "info",
      format: combine(colorize(), splat(), simple(), label(), timestamp(), requestLogCSVFormat)
    })
  );

  STATUS_LOG.add(
    new winston.transports.Console({
      format: combine(colorize(), splat(), simple())
    })
  );

  CONVERTER_LOG.add(
    new winston.transports.Console({
      level: "error",
      format: combine(colorize(), splat(), simple())
    })
  );

  WEBSERVER_LOG.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), label({ label: "SERVER_LOG" }), splat(), simple(), serverLogFormat)
    })
  );

  WEBSERVER_REQUEST_LOG.add(
    new winston.transports.Console({
      format: combine(colorize(), splat(), simple(), timestamp(), requestLogFormat)
    })
  );
} else {
  LOG.add(
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error"
    })
  );

  TRACE.add(
    new winston.transports.File({
      filename: "./logs/trace.log",
      level: "debug"
    })
  );

  UDP_REQUEST_LOG.add(
    new winston.transports.File({
      filename: "./logs/udp_requests.log",
      level: "debug"
    })
  );

  STATUS_LOG.add(
    new winston.transports.File({
      filename: "./logs/status.log",
      level: "debug"
    })
  );

  CONVERTER_LOG.add(
    new winston.transports.File({
      filename: "./logs/converter.log",
      level: "debug"
    })
  );

  WEBSERVER_LOG.add(
    new winston.transports.File({
      filename: "./logs/server.log",
      level: "debug"
    })
  );

  WEBSERVER_REQUEST_LOG.add(
    new winston.transports.File({
      filename: "./logs/request.log",
      level: "debug"
    })
  );
}
