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
import { RESPONSE_CODE } from "../messages/structures/KNX_SPECIFICATION";
import TCPResponse from "../messages/TCPResponse";
import TCPRequest from "../messages/TCPRequest";

const DEVICE_TYPE = "IPConnector";
const CONNECTION_TIMEOUT = 10000;

const ERROR_DESCRIPTIONS: Map<number, string> = new Map([
  [RESPONSE_CODE.NO_ERROR, "The connection is established successfully."],
  [RESPONSE_CODE.E_CONNECTION_TYPE, "The KNXnet/IP Server device does not support the requested connection type."],
  [
    RESPONSE_CODE.E_CONNECTION_OPTION,
    "The KNXnet/IP Server device does not support one or more requested connection options."
  ],
  [
    RESPONSE_CODE.E_NO_MORE_CONNECTIONS,
    "The KNXnet/IP Server device cannot accept the new data connection because its maximum amount of concurrent connections is already used."
  ]
]);

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
  //udpDevice: UDPDevice<UDPDeviceSettings>;
  tcpDevice: TCPDevice<TCPDeviceSettings>;

  constructor(id: string, settings: IPConnectorSettings) {
    this.id = id;
    this.settings = settings;

    const tcpSettings = {
      ipAddress: this.settings.local.ipAddress,
      port: this.settings.local.port,
      friendlyName: this.settings.friendlyName + "_TCP",
      knxIndividualAddress: this.settings.knxIndividualAddress,
      knxSerialNumber: this.settings.knxSerialNumber,
      macAddress: this.settings.macAddress,
      projectInstallationID: this.settings.projectInstallationID,
      type: DEVICE_TYPE + "_TCP"
    };

    // create UDPDevice
    this.tcpDevice = new TCPDevice(this.id + "_TCP", tcpSettings);
    //this.tcpDevice.listen();

    // add callbacks:
    this.tcpDevice.connectionResponseCallback = this.onConnectionResponse;
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
    //await this.tcpDevice.startListener();
  }

  async powerOff(): Promise<void> {
    //await this.tcpDevice.stopListener();
  }

  onConnectionResponse = (request: TCPRequest, response: TCPResponse, content: ConnectionResponse): void => {
    request.log.debug("Handle ConnectionResponse");

    const connectionStatus = content.connectionResponseBaseStructure.data.Status;
    if (connectionStatus === undefined) {
      throw new Error("No connection status received!");
    } else if (connectionStatus === RESPONSE_CODE.NO_ERROR) {
      request.log.info("Connection established successfully");
    } else {
      request.log.error(this.getErrorDescription(connectionStatus));
    }
  };

  getErrorDescription(code: number): string {
    const description = ERROR_DESCRIPTIONS.get(code);
    return description || `Unknown error:  ${code}`;
  }

  /**
   * The connection flow is implemented like:
   * client             server
   *   CONNECTION_REQUEST ->
   *      <- CONNECTION_RESPONSE
   *
   *
   */
  async connect(timeout?: number): Promise<void> {
    await this.tcpDevice.triggerConnectionRequest(this.settings.remote);

    return new Promise((resolve) => {
      // TODO: resolve immediatly once connection is established
      setTimeout(resolve, timeout ? timeout : CONNECTION_TIMEOUT);
    });
  }
}
