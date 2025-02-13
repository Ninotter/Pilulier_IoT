import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";
import BLE from "./BLE";
import BLEPermission from "./BLEPermissions";

export default function App() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const ble = new BLE();
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothPermissionGranted, setIsBluetoothPermissionGranted] = useState(false);
  const deviceName = "Buds";
  var pilulierDevice: Device | undefined = undefined;

  BLEPermission.requestPermissions().then((result) => {
    setIsBluetoothPermissionGranted(result);
  });
  
  const onUpdatedScanningState = (scanning: boolean) => {
    setIsScanning(scanning);
  }
  ble.notifyScanningChangeState = onUpdatedScanningState;

  const onDeviceFound = (device: Device): boolean => {
    setAllDevices((prevState: Device[]) => {
      if (!BLE.isDuplicateDevice(prevState, device)) {
        return [...prevState, device];
      }
      return prevState;
    });
    if (device.name?.includes(deviceName)) {
      pilulierDevice = device;
      return true;
    }
    return false;
  };

  const scanForPeripherals = () => {
    ble.startScan(onDeviceFound);
  };

  return (
    <View style={styles.container}>
      <Text>Pilulier BLE</Text>
      {
        isBluetoothPermissionGranted ? null : (
          <Pressable
            style={styles.pressable}
            onPress={async () => {
              const result = await BLEPermission.requestPermissions();
              console.log("result", result);
              setIsBluetoothPermissionGranted(result);
            }}
          >
            <Text>Request Permissions</Text>
          </Pressable>
        )
      }
      {isScanning ? (
        <>
          <Pressable
            style={styles.pressable}
            onPress={() => {
              ble.stopScan();
              setAllDevices([]);
            }}
          >
            <Text>Stop Scanning</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={styles.pressable}
            onPress={async () => {
              setIsScanning(true);
              await scanForPeripherals();
            }}
          >
            <Text>Scan Devices</Text>
          </Pressable>
        </>
      )}
      {allDevices.map(
        (device) => device.name && <Text key={device.id}>{device.name}</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pressable: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
});
