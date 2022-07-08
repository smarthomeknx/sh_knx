import * as net from "net";
import yaml from "js-yaml";
import EventEmitter from "events";
import { Logger } from "winston";

import { logBuffer, STATUS_LOG } from "../../utils/logging";
import { SERVICE_TYPE } from "../structures/KNX_SPECIFICATION";
import TCPRequest from "../TCPRequest";
import TCPResponse from "../TCPResponse";
import { Message } from "./Message";

import TCPDevice, { TCPDeviceSettings } from "../../devices/base/TCPDevice";
import { TCPMessage } from "../../utils/TCPDeviceLogger";
import { RemoteInfo } from "../../utils/types";

type MessageHandlerCallback = (request: TCPRequest, response: TCPResponse) => void;

export enum SPECIAL_TYPE {
  ALL = "*"
}

export type CALLBACK_TYPE = SERVICE_TYPE | SPECIAL_TYPE;

export default class MessageHandler {
  readonly eventEmitter: EventEmitter;

  constructor(readonly tcpSocket: net.Socket, readonly receivingDevice: TCPDevice<TCPDeviceSettings>) {
    tcpSocket.on("message", this.tcpHandleIncomingMessage);
    //udpSocket.on("message", this.udpHandleIncomingMessage);
    this.eventEmitter = new EventEmitter().setMaxListeners(1); // one listener per Event is supported in here by know
  }

  get deviceLogger(): Logger {
    return this.receivingDevice.tcpLogger;
  }

  tcpHandleIncomingMessage = (message: Buffer, remoteInfo: RemoteInfo): void => {
    const tcpMessage: TCPMessage = {
      direction: "INCOMING",
      remote: remoteInfo,
      buffer: message
    };

    try {
      const request: TCPRequest = new TCPRequest(message, remoteInfo);
      const response: TCPResponse = new TCPResponse(request, this.tcpSocket);
      const serviceType = request.identifyMessage();

      this.deviceLogger.debug("RECEIVED MESSAGE \n(%s Bytes): %s", message.byteLength, logBuffer(message), {
        tcpMessage: tcpMessage
      });

      const event = this.hasHighlanderCallback()
        ? SPECIAL_TYPE.ALL
        : this.hasServiceCallback(serviceType)
        ? SERVICE_TYPE[serviceType]
        : undefined;
      if (event) {
        request.log.info("Emitting event '%s' for callback", event);
        this.eventEmitter.emit(event, request, response, this.receivingDevice);
      } else {
        request.log.warn("No emitter for message with service type '%s'", serviceType);
      }
    } catch (error) {
      this.deviceLogger.error("RECEIVED MESSAGE: %s\nERROR: %s", logBuffer(message), error, {
        tcpMessage: tcpMessage
      });
    }
  };

  addTypedCallback(eventType: SERVICE_TYPE, callback: MessageHandlerCallback): void {
    if (this.hasHighlanderCallback()) {
      throw Error("Can't add typed callback, because the highlander callback is set");
    } else {
      this.eventEmitter.on(SERVICE_TYPE[eventType], callback);
    }
  }

  addAllCallback(callback: MessageHandlerCallback): void {
    if (this.hasHighlanderCallback()) {
      throw Error("Can't add typed callback, because the highlander callback is set");
    } else {
      this.eventEmitter.on(SPECIAL_TYPE.ALL, callback);
    }
  }

  addHighlanderCallback(callback: MessageHandlerCallback): void {
    const registeredEvents = this.eventEmitter.eventNames();
    if (registeredEvents.length > 0) {
      STATUS_LOG.warn("There are event callback already registered. Setting highlander callback is killing those.");
      if (STATUS_LOG.isDebugEnabled()) {
        registeredEvents.forEach((item) => {
          this.eventEmitter.removeAllListeners(item);
          STATUS_LOG.debug("Highlander callback killed %s", item);
        });
      } else {
        this.eventEmitter.removeAllListeners();
      }
    }

    this.eventEmitter.on(SPECIAL_TYPE.ALL, callback);
  }

  hasHighlanderCallback(): boolean {
    return this.eventEmitter.listenerCount(SPECIAL_TYPE.ALL) > 0;
  }

  hasServiceCallback(serviceType: SERVICE_TYPE): boolean {
    return this.eventEmitter.listenerCount(SERVICE_TYPE[serviceType]) > 0;
  }

  static setValuesFromBuffer<Type extends Message>(request: TCPRequest, message: Type): void {
    message.fromBuffer(request.message);
    request.log.silly("Read message: %s", yaml.dump(message.toJSON(false)));
  }
}
