import { BleManager, Device } from "react-native-ble-plx";

export default class BLE{
    isScanning : Boolean = false;
    bleManager = new BleManager();
    notifyScanningChangeState : Function | null | undefined;

    SetScanState = (isScanning : boolean) => {
        this.isScanning = isScanning;
        if(this.notifyScanningChangeState){
            this.notifyScanningChangeState(this.isScanning);
        }
    }

    static isDuplicateDevice = (devices: any[], nextDevice: any) =>
        devices.findIndex((device) => nextDevice.id === device.id) > -1;

    /**
     * 
     * @param callback callback called when a new device is found. Will stop scanning if callback returns true
     */
    startScan = (callback : (device : Device) => boolean) => {
        this.SetScanState(true);
        this.bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error(error);
            }
            if (device) {
                var callbackResult = callback(device);
                if(callbackResult){
                    this.stopScan();
                }
            }
        });
    }

    stopScan = () => {
        this.SetScanState(false);
        this.bleManager.stopDeviceScan();
    }

    connectToDevice = async (device : Device) : Promise<Device | null> => {
        var discoveredDevice = null;
        await device.connect()
        .then((device) => {
            console.debug("Connected to device", device.name);
            discoveredDevice = device.discoverAllServicesAndCharacteristics();
            this.SetScanState(false);
            return discoveredDevice;
        })
        .catch((error) => {
            console.error("Error connecting to device", error);
        });
        return discoveredDevice;
    }
}