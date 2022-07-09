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
  };

  onDescriptionResponse = (request: UDPRequest, response: UDPResponse, content: DescriptionResponse): void => {
    request.log.debug("Handle DescriptionResponse");
    // if (this.pendingSearchResponseSince < 0) {
    //   request.log.debug("Ignoring SearchResponse because no pending search request from this device");
    //   return;
    // }

    // const responseDelay = Date.now() - this.pendingSearchResponseSince;
    // TRACE.debug(`SearchResponse arrived ${responseDelay} ms after request`);
    // if (responseDelay > SEARCH_TIMEOUT) {
    //   request.log.info(
    //     `Ignoring SearchResponse because pending search request from this device was timed out after ${SEARCH_TIMEOUT}`
    //   );
    //   return;
    // }

    // const incomingDescriptionResponse = new DescriptionResponse();
    // UDPMessageHandler.setValuesFromBuffer(request, incomingDescriptionResponse);
    // TRACE.debug(`DescriptionResponse: \n${incomingDescriptionResponse.toYAML(false)}`);
    // //this.searchResponses.push(incomingSearchResponse);
    // this.udpLogger.info(
    //   "Received description response from %s:%s",
    //   incomingDescriptionResponse.hpaiStructure.data.IPAddress,
    //   incomingDescriptionResponse.hpaiStructure.data.Port
    // );
    // Connect?
    //this.requestServerDescription(incomingSearchResponse);
  };

  // async triggerDescriptionRequest(searchResponse: SearchResponse): Promise<void> {
  //   const message: DescriptionRequest = new DescriptionRequest();
  //   message.setDefaultValues();
  //   message.hpaiStructure.data.IPAddress = this.settings.ipAddress;
  //   message.hpaiStructure.data.Port = this.settings.ipPort;
  //   // don't change the port, seems 3671 is default from KNX: message.hpaiStructure.data.Port = this.settings.ipPort;

  //   const buffer: Buffer = message.toBuffer();
  //   //if (!this.settings.multicast) throw Error("Can't sent search request without multicast settings ");
  //   //await this.send(message.serviceType, buffer, this.settings.multicast.ipPort, this.settings.multicast.ipAddress);
  //   const settings: TCPDeviceSettings = {
  //     friendlyName: searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "",
  //     knxIndividualAddress: searchResponse.dibHardwareStructure.data.KNXIndividualAddress || "",
  //     knxSerialNumber: searchResponse.dibHardwareStructure.data.DeviceKNXSerialNumber || "",
  //     macAddress: searchResponse.dibHardwareStructure.data.DeviceMACAddress || "",
  //     projectInstallationID: searchResponse.dibHardwareStructure.data.ProjectInstallationIdentifier || "",
  //     type: searchResponse.dibHardwareStructure.data.DescriptionTypeCode + "" || "",
  //     remote: {
  //       host: searchResponse.hpaiStructure.data.IPAddress || "",
  //       port: searchResponse.hpaiStructure.data.Port || -1
  //     }
  //     port:
  //     //port
  //   };
  //   const client = new TCPDevice(searchResponse.dibHardwareStructure.data.DeviceFriendlyName || "Anonymous", settings);
  //   //await client.connect();
  //   await client.connectWrite(message.serviceType, buffer);
  // }

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
    // const udpSettings = {
    //   ipAddress: this.settings.local.ipAddress,
    //   port: this.settings.local.port,
    //   friendlyName: this.settings.friendlyName + "_UDP",
    //   knxIndividualAddress: this.settings.knxIndividualAddress,
    //   knxSerialNumber: this.settings.knxSerialNumber,
    //   macAddress: this.settings.macAddress,
    //   projectInstallationID: this.settings.projectInstallationID,
    //   multicast: this.settings.multicast,
    //   type: DEVICE_TYPE + "_UDP"
    // };

    // // create UDPDevice
    // const udpDevice = new UDPDevice(this.id + "_UDP", udpSettings);
    // udpDevice.searchResponseCallback = this.onSearchResponse;
    // await udpDevice.startListener();
    // triggerSearchRequest
    await this.udpDevice.triggerSearchRequest();

    //this.pendingSearchResponseSince = Date.now();
    // set timeout to ignore search responses after the SEARCH_TIMEOUT
    //this.udpLogger.info("Trigger search request with timeout %s", SEARCH_TIMEOUT);
    // await setTimeout(() => {
    //   this.pendingSearchResponseSince = -1;
    // }, timeout || SEARCH_TIMEOUT);
    // return this.searchResponses;
    // check if answer or timeout
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
  async requestServerDescription(searchResponse: SearchResponse): Promise<IPServer> {
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

    //const tcpDevice = new TCPDevice(this.id + "_TCP", tcpSettings);
    //await this.tcpServer.triggerDescriptionRequest(remote);

    // send description request
    //await this.triggerDescriptionRequest(searchResponse);
    return new IPServer("fake", {
      type: "IPRouter",
      ipAddress: "192.168.1.138",
      port: 3671,
      multicast: {
        ipAddress: "224.0.23.12",
        port: 3671
      },
      knxIndividualAddress: "255.255",
      projectInstallationID: "00.01",
      knxSerialNumber: "0.250.0.0.0.1",
      macAddress: "06.06.06.03.14.71",
      friendlyName: "SMARTHOMEKNX.DE"
    });
  }

  async connect(server: IPServer) {
    // connect
  }
}
