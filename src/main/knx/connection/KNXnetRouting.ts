// https://support.knx.org/hc/en-us/articles/4402353231762-Connection-Manager-Detailed-

// export interface Config {
//   name: string;
//   individualAddress: string;
//   multicastAddress: string;
//   macAddress: string;
// }

export interface Config {
  name: string;
  individualAddress: string;
  multicastAddress: string;
  multicastPort: string;
  macAddress: string;
}

const DEFAULT_CFG: Config = {
  name: "Default",
  individualAddress: "1",
  multicastAddress: "224.0.23.12",
  multicastPort: "3671",
  macAddress: "123"
};
