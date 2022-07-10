import dgram from "dgram";
import { STATUS_LOG, TRACE } from "../utils/logging";
import { SERVICE_TYPE } from "../messages/structures/KNX_SPECIFICATION";
import UDPRequest from "../messages/UDPRequest";
import SearchRequest from "../messages/SearchRequest";
import SearchResponse from "../messages/SearchResponse";
import UDPMessageHandler, { SPECIAL_TYPE } from "../messages/utils/UDPMessageHandler";
import UDPResponse from "../messages/UDPResponse";
import UDPDevice, { UDPDeviceSettings } from "./base/UDPDevice";
import TCPDevice, { TCPDeviceSettings } from "./base/TCPDevice";
import DescriptionRequest from "../messages/DescriptionRequest";
import DescriptionResponse from "../messages/DescriptionResponse";
import IPServer from "./IPServer";
import { DeviceSettings } from "./base/Device";
import ConnectionResponse from "../messages/ConnectionResponse";

const SEARCH_TIMEOUT = 100000;
const DEVICE_TYPE = "IPScanner";

export interface IPScannerSettings extends DeviceSettings {
  // readonly remote?: {
  //   ipAddress: string;
  //   port: number;
  // };
  readonly local: {
    ipAddress: string;
    port: number;
  };
  readonly multicast?: {
    readonly ipAddress: string;
    readonly port: number;
  };
}

export default class IPScanner {
  //extends TCPDevice<TCPDeviceSettings> {
  //log: winston.Logger;
  readonly id: string;
  // udpSettings: UDPDeviceSettings;
  settings: IPScannerSettings;
  pendingSearchResponseSince = -1;
  searchResponses: SearchResponse[] = [];
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
    this.udpDevice.connectionResponseCallback = this.onConnectionResponse;

    // const tcpSettings = {
    //   local: {
    //     ipAddress: this.settings.local.ipAddress,
    //     port: this.settings.local.port
    //   },
    //   friendlyName: this.settings.friendlyName + "_TCP",
    //   knxIndividualAddress: this.settings.knxIndividualAddress,
    //   knxSerialNumber: this.settings.knxSerialNumber,
    //   macAddress: this.settings.macAddress,
    //   projectInstallationID: this.settings.projectInstallationID,
    //   type: DEVICE_TYPE + "_TCP"
    // };
    // this.tcpServer = new TCPDevice(this.id + "_TCP", tcpSettings);
  }

  async powerOn(): Promise<void> {
    //this.messageHandler.addTypedCallback(SERVICE_TYPE.SEARCH_RESPONSE, this.onSearchResponse);
    //this.messageHandler.addTypedCallback(SERVICE_TYPE.DESCRIPTION_RESPONSE, this.onDescriptionResponse);
    //await this.startServer();
    //await this.tcpServer.listen();
    await this.udpDevice.startListener();
  }

  onSearchResponse = (request: UDPRequest, response: UDPResponse, content: SearchResponse): void => {
    this.searchResponses.push(content);
    this.requestServerDescription(content);
    this.connect(content);
  };

  onDescriptionResponse = (request: UDPRequest, response: UDPResponse, content: DescriptionResponse): void => {
    request.log.debug("Handle DescriptionResponse");
    // TODO: Check if IPScanner is done and now some other IPDevice should take over with the concrete connect
  };

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
  async search(timeout?: number): Promise<void> {
    await this.udpDevice.triggerSearchRequest();
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
  async requestServerDescription(searchResponse: SearchResponse): Promise<void> {
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

  async connect(searchResponse: SearchResponse): Promise<void> {
    // connect
    STATUS_LOG.info("Start to connect...");
    if (!searchResponse.hpaiStructure.data.IPAddress || !searchResponse.hpaiStructure.data.Port) {
      throw new Error(
        `Can't request description via TCPDevice, because the hpaiStructure of the searchResponse doesn#t provide IPAddress and Port`
      );
    }

    const remote = {
      ipAddress: searchResponse.hpaiStructure.data.IPAddress,
      port: searchResponse.hpaiStructure.data.Port
    };

    await this.udpDevice.triggerConnectionRequest(remote);
  }
}
