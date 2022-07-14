import { STATUS_LOG, TRACE } from "../utils/logging";
import UDPRequest from "../messages/UDPRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./base/UDPDevice";
import TCPDevice, { TCPDeviceSettings } from "./base/TCPDevice";
import DescriptionResponse from "../messages/DescriptionResponse";
import { DeviceSettings } from "./base/Device";
import { DIBHardwareData } from "../messages/structures/DIBHardwareStructure";
import { SupportedServiceFamilyDIBData } from "../messages/structures/DIBSupportServiceFamilyStructure";
import { DIBManufactorerData } from "../messages/structures/DIBManufactorerDataStructure";
import { HPAIData } from "../messages/structures/HPAIStructure";

const DEVICE_TYPE = "IPScanner";
const SEARCH_TIMEOUT = 10000;

export interface IPScannerSettings extends DeviceSettings {
  readonly local: {
    ipAddress: string;
    port: number;
  };
  readonly multicast?: {
    readonly ipAddress: string;
    readonly port: number;
  };
}

export interface IPScanResult {
  hpai: Partial<HPAIData>;
  hardware: Partial<DIBHardwareData>;
  serviceFamilies: Partial<SupportedServiceFamilyDIBData>;
  manufactorerData: Partial<DIBManufactorerData>;
}

export default class IPScanner {
  readonly id: string;
  settings: IPScannerSettings;
  pendingSearchResponseSince = -1;
  scanResults: Map<string, IPScanResult> = new Map(); //IPScanResult[] = [];
  //tcpServer: TCPDevice<TCPDeviceSettings>;
  udpDevice: UDPDevice<UDPDeviceSettings>;

  constructor(id: string, settings: IPScannerSettings) {
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
      multicast: this.settings.multicast,
      type: DEVICE_TYPE + "_UDP"
    };

    // create UDPDevice
    this.udpDevice = new UDPDevice(this.id + "_UDP", udpSettings);

    // add callbacks:
    this.udpDevice.searchResponseCallback = this.onSearchResponse;
    this.udpDevice.descriptionResponseCallback = this.onDescriptionResponse;
  }

  async powerOn(): Promise<void> {
    await this.udpDevice.startListener();
  }

  async powerOff(): Promise<void> {
    await this.udpDevice.stopListener();
  }

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
  async search(timeout?: number): Promise<IPScanResult[]> {
    await this.udpDevice.triggerSearchRequest(timeout);

    // await setTimeout(
    //   () => {
    //     STATUS_LOG.info("Stop waiting for search responses. Continue with next steps...?");
    //   },
    //   timeout ? timeout : SEARCH_TIMEOUT
    // );
    return new Promise((resolve) => {
      const resolveWithResult = () => {
        resolve(this.results);
      };
      setTimeout(resolveWithResult, timeout ? timeout : SEARCH_TIMEOUT);
    });
  }

  // TODO: Add function to search for a device by config, e.g. MAC Address?

  get results(): IPScanResult[] {
    const results: IPScanResult[] = [...this.scanResults.values()];
    return results;
  }

  /**
   * After a server is discovered, the client should sent a
   * client               server
   *   DESCRIPTION_RQUEST -> (thorugh unicast or point to point)
   *   <- DESCRIPTION_RESPONSE
   *
   * Within this request the client should check if the server supports the
   * service requests.
   *
   * The description response from server should contain:
   * - supported protocol version
   * - own capabilities
   * - state information
   * - friendly connection name (optional)
   *
   * The server response should be related to each discovery request. The reason
   * is that the server may support connections to multiple KNX Subnetworks.
   *
   */
  private async requestServerDescription(searchResponse: SearchResponse): Promise<void> {
    if (!searchResponse.hpaiStructure.data.IPAddress || !searchResponse.hpaiStructure.data.Port) {
      throw new Error(
        `Can't request description via TCPDevice, because the hpaiStructure of the searchResponse doesn#t provide IPAddress and Port`
      );
    }

    const remote = {
      ipAddress: searchResponse.hpaiStructure.data.IPAddress,
      port: searchResponse.hpaiStructure.data.Port
    };

    await this.udpDevice.triggerDescriptionRequest(remote);

    // return new IPServer("fake", {
    //   type: "IPRouter",
    //   ipAddress: "192.168.1.138",
    //   port: 3671,
    //   multicast: {
    //     ipAddress: "224.0.23.12",
    //     port: 3671
    //   },
    //   knxIndividualAddress: "255.255",
    //   projectInstallationID: "00.01",
    //   knxSerialNumber: "0.250.0.0.0.1",
    //   macAddress: "06.06.06.03.14.71",
    //   friendlyName: "SMARTHOMEKNX.DE"
    // });
  }

  private onSearchResponse = (request: UDPRequest, response: UDPResponse, content: SearchResponse): void => {
    const result = {
      hpai: content.hpaiStructure.data,
      hardware: content.dibHardwareStructure.data,
      serviceFamilies: content.dibSupportedServiceFamilyStructure.data,
      manufactorerData: {}
    };
    if (result.hardware.DeviceMACAddress) {
      this.scanResults.set(result.hardware.DeviceMACAddress, result);
      this.requestServerDescription(content);
      TRACE.info("Found device and added to result!");
    } else {
      TRACE.warn("Search Response contains hardware without Mac Address: This result will be ignored!");
    }
  };

  private onDescriptionResponse = (request: UDPRequest, response: UDPResponse, content: DescriptionResponse): void => {
    request.log.debug("Handling DescriptionResponse");

    const macAddress = content.dibHardwareStructure.data.DeviceMACAddress;
    if (macAddress) {
      const scanResult = this.scanResults.get(macAddress);
      if (scanResult) {
        TRACE.info("Updating scan result with description response information.");
        scanResult.manufactorerData = content.dibManufactorerData.data;
      } else {
        throw new Error(`MacAddress '${macAddress}' not found in existing scan result`);
      }
    } else {
      TRACE.warn("Description Response contains hardware without Mac Address: This result will be ignored!");
    }
  };
}
