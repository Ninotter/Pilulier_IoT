import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { PermissionsAndroid, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

export default function App() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const bleManager = new BleManager();
  
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;
  
  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
  
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            console.log("device", device);
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  

const requestAndroid31Permissions = async () => {
  console.log("requestAndroid31Permissions");
  const bluetoothScanPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );
  const bluetoothConnectPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );
  const fineLocationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );

  return (
    bluetoothScanPermission === "granted" &&
    bluetoothConnectPermission === "granted" &&
    fineLocationPermission === "granted"
  );
};
  return (
    <View style={styles.container}>
        <Text>Pilulier BLE</Text>
        <Pressable style={styles.pressable}onPress={async () => {
          const result = await requestAndroid31Permissions();
          console.log("result", result);
        }}>
          <Text>Request Android 31 Permissions</Text>
        </Pressable>
        {
          isScanning ? (
            <>
              <Pressable style={styles.pressable} onPress={() => {
                  bleManager.stopDeviceScan();
                  setIsScanning(false);
                  setAllDevices([]);
                }}>
            <Text>Stop Scanning</Text>
        </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.pressable}onPress={async () => {
            setIsScanning(true);
            await scanForPeripherals();
          }
          }>
            <Text>Scan Devices</Text>
          </Pressable>
            </>
          )
        }
        {
          allDevices.map((device) => (
            device.name && (
              <Text key={device.id}>
                {device.name}
              </Text>
            )
          ))
        }
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    margin: 10
  }
});
