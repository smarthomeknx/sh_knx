// https://support.knx.org/hc/en-us/articles/4402353231762-Connection-Manager-Detailed-

export interface Config {
  name: string;
  individualAddress: string;
  server: string;
  port: 3671;
  ipAddress: string;
  networkAddressTranslation: boolean;
  secured: boolean;
}
