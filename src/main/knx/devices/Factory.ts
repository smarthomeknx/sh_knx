import IPObserver, { IPObserverSettings } from "./IPObserver";
import Device, { DeviceSettings } from "./Device";
import ETSSoftware from "./ETSSoftware";
import IPRouter from "./IPRouter";
import { UDPDeviceSettings } from "./UDPDevice";

const typeClasses = [IPRouter, ETSSoftware, IPObserver];

export const build = (id: string, settings: DeviceSettings): Device<DeviceSettings> => {
  const type = settings.type.toLowerCase();
  //let instance: Device<DeviceSettings>;
  const typeClass = typeClasses.find((value) => type === value.name.toLowerCase());

  if (typeClass === undefined) {
    throw Error("No known hardware of type " + type);
  }
  let instance; // = new typeClass(settings);
  switch (typeClass.name) {
    case IPRouter.name:
      instance = new IPRouter(id, settings as UDPDeviceSettings);
      break;
    case IPObserver.name:
      instance = new IPObserver(id, settings as IPObserverSettings);
      break;
  }

  if (!instance) {
    throw Error(
      "No instance of hardware of type " + type + " was created. Check the settings are related to the type."
    );
  }
  return instance;
};

// function createInstance<A extends Animal>(c: new () => A): A {
//   return new c();
// }

// function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
//   return obj[key];
// }

// let x = { a: 1, b: 2, c: 3, d: 4 };

// getProperty(x, "a");
// getProperty(x, "m");
