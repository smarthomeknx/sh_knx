import { STATUS_LOG, TRACE } from "../utils/logging";
import UDPRequest from "../messages/UDPRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler, { SPECIAL_TYPE } from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./base/UDPDevice";
import TCPDevice, { TCPDeviceSettings } from "./base/TCPDevice";
import DescriptionResponse from "../messages/DescriptionResponse";
import { DeviceSettings } from "./base/Device";
import { DIBHardwareData } from "../messages/structures/DIBHardwareStructure";
import { SupportedServiceFamilyDIBData } from "../messages/structures/DIBSupportServiceFamilyStructure";
import { DIBManufactorerData } from "../messages/structures/DIBManufactorerDataStructure";
import { Protocol } from "../utils/types";
import ConnectionResponse from "../messages/ConnectionResponse";
import { IPScanResult } from "./IPScanner";

const DEVICE_TYPE = "IPConnector";
const CONNECTION_TIMEOUT = 10000;

export interface IPConnectorSettings extends DeviceSettings {
  readonly local: {
    ipAddress: string;
    port: number;
  };
  readonly remote: {
    readonly ipAddress: string;
    readonly port: number;
  };
  protocol: Protocol;
}

// export interface IPScanResult {
//   hardware: Partial<DIBHardwareData>;
//   serviceFamilies: Partial<SupportedServiceFamilyDIBData>;
//   manufactorerData: Partial<DIBManufactorerData>;
// }

export default class IPConnector {
  //extends TCPDevice<TCPDeviceSettings> {
  //log: winston.Logger;
  readonly id: string;
  // udpSettings: UDPDeviceSettings;
  settings: IPConnectorSettings;
  pendingSearchResponseSince = -1;
  //searchResponses: SearchResponse[] = [];
  //scanResults: Map<string, IPScanResult> = new Map(); //IPScanResult[] = [];
  //tcpServer: TCPDevice<TCPDeviceSettings>;
  udpDevice: UDPDevice<UDPDeviceSettings>;
  //tcpDevice: TCPDevice<TCPDeviceSettings>;

  constructor(id: string, settings: IPConnectorSettings) {
    this.id = id;
    this.settings = settings;

    const udpSettings = {
      ipAddress: this.settings.local.ipAddress,
      port: this.settings.local.port,
      friendlyName: this.settings.friendlyName + "_UDP",
      knxIndividualAddress: this.settings.knxIndividualAddress,
      knxSerialNumber: this.settings.knxSerialNumber,
      macAddress: this.settings.macAddress,
      projectInstallationID: this.settings.projectInstallationID,
      type: DEVICE_TYPE + "_UDP"
    };

    // create UDPDevice
    this.udpDevice = new UDPDevice(this.id + "_UDP", udpSettings);

    // add callbacks:
    this.udpDevice.connectionResponseCallback = this.onConnectionResponse;
  }

  // setRemote(scanResult: IPScanResult) {

  // }

  // static build(id: string, scanResult: IPScanResult) {
  //   // validate if scan result is complete:
  //   if (!scanResult.hardware.DeviceFriendlyName) {
  //     throw new Error("Can't build IPConnector from Scan result. Missing required value of 'DeviceFriendlyName'");
  //   }

  //   if (!scanResult.hardware.KNXIndividualAddress) {
  //     throw new Error("Can't build IPConnector from Scan result. Missing required value of 'KNXIndividualAddress'");
  //   }

  //   const settings: IPConnectorSettings = {
  //     friendlyName: scanResult.hardware.DeviceFriendlyName,
  //     knxIndividualAddress: scanResult.hardware.KNXIndividualAddress,
  //     knxSerialNumber: scanResult.hardware.DeviceKNXSerialNumber,
  //     projectInstallationID: scanResult.hardware.ProjectInstallationIdentifier,
  //     macAddress: scanResult.hardware.DeviceMACAddress,
  //     type: scanResult.

  //   };

  //   return new IPConnector(id, settings);
  // }

  async powerOn(): Promise<void> {
    await this.udpDevice.startListener();
  }

  async powerOff(): Promise<void> {
    await this.udpDevice.stopListener();
  }

  onConnectionResponse = (request: UDPRequest, response: UDPResponse, content: ConnectionResponse): void => {
    request.log.debug("Handle ConnectionResponse");
    // TODO: Check if IPScanner is done and now some other IPDevice should take over with the concrete connect
  };

  /**
   * The discory flow is implemented like:
   * client             server
   *   SEARCH_REQUEST ->
   *      <- SEARCH_RESPONSE
   *
   * The client waits until the response is received or for SEARCH_TIMEOUT
   * After that any response should be ignored unless a new SEARCH_REQUEST
   * is triggered.
   *
   * SEARCH_REQUESTS from other clients should be ignored
   *
   * The search is done via UDPDevice and a mutlicast message is sent to the
   * KNX default address and port for this reasons. Once a response arrives
   * an new KNX device (e.g. IPRouter) is found.
   *
   */
  async connect(timeout?: number): Promise<void> {
    await this.udpDevice.triggerConnectionRequest(this.settings.remote);

    return new Promise((resolve) => {
      // TODO: resolve immediatly once connection is established
      setTimeout(resolve, timeout ? timeout : CONNECTION_TIMEOUT);
    });
  }
}
