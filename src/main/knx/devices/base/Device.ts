import DIBHardwareStructure from "../../messages/structures/DIBHardwareStructure";

export interface DeviceSettings {
  readonly type: string;
  readonly knxIndividualAddress: string;
  readonly projectInstallationID: string;
  readonly knxSerialNumber: string;
  readonly macAddress: string;
  readonly friendlyName: string;
}

export default abstract class Device<Type extends DeviceSettings> {
  constructor(readonly id: string, readonly settings: Type) {}

  fillDeviceInformationBlockStructure(dibStructure: DIBHardwareStructure): DIBHardwareStructure {
    dibStructure.setDefaultValues();
    dibStructure.data.KNXIndividualAddress = this.settings.knxIndividualAddress;
    dibStructure.data.ProjectInstallationIdentifier = this.settings.projectInstallationID;
    dibStructure.data.DeviceKNXSerialNumber = this.settings.knxSerialNumber;
    dibStructure.data.DeviceMACAddress = this.settings.macAddress;
    dibStructure.data.DeviceFriendlyName = this.settings.friendlyName;

    return dibStructure;
  }
}
