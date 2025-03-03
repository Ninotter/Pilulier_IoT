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
import * as Notifications from "expo-notifications";
import Grid from "./grid";
import {ConfigPilulier, Week, Day } from "./ConfigPilulier";
import { CHARACTERISTIC_UUID_SET_CONFIG, SERVICE_UUID } from "./BLEInfos";

export default function App() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const ble = new BLE();
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothPermissionGranted, setIsBluetoothPermissionGranted] = useState(false);
  const deviceName = "ESP32-Pilulier";
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  
  if(!isBluetoothPermissionGranted){
    BLEPermission.requestPermissions().then((result) => {
      setIsBluetoothPermissionGranted(result);
    });
  }
  
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
    if (device.name?.toLowerCase().includes(deviceName.toLowerCase())) {
      console.debug("found pilulier");
      connectToDevice(device);
      return true;
    }
    return false;
  };

  const scanForPeripherals = () => {
    ble.startScan(onDeviceFound);
  };


  const updateConfigBle = async (config : ConfigPilulier) => {
    if(connectedDevice){
      const services = await connectedDevice.services();
      const service =  services.find(service => service.uuid === SERVICE_UUID);
      const characteristics = await service?.characteristics();
      const characteristic = characteristics?.find(characteristic => characteristic.uuid === CHARACTERISTIC_UUID_SET_CONFIG);
      if(characteristic){
        let configBinary = config.toBinaryString();
        const Buffer = require("buffer").Buffer;
        let encodedAuth = new Buffer(configBinary).toString("base64");
        await characteristic.writeWithoutResponse(encodedAuth);
        console.debug("Done writing config");
      }
    }
  }


  // First, set the handler that will cause the notification
  // to show the alert
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const sendNotification = () => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Look at that notification',
          body: "I'm so proud of myself!",
        },
        trigger: null,
      });
  }


  const renderPermissionRequest = () => {
    return (
      <Pressable
        style={styles.pressable}
        onPress={async () => {
          const result = await BLEPermission.requestPermissions();
          setIsBluetoothPermissionGranted(result);
        }}
      >
        <Text>Request Permissions</Text>
      </Pressable>
    );
  };

  const renderScanningControls = () => {
    return isScanning ? (
      <Pressable
        style={styles.pressable}
        onPress={() => {
          ble.stopScan();
          connectedDevice?.cancelConnection();
          setConnectedDevice(null);
          setAllDevices([]);
        }}
      >
        <Text>Stop Scanning</Text>
      </Pressable>
    ) : (
      <Pressable
        style={styles.pressable}
        onPress={async () => {
          setIsScanning(true);
          await scanForPeripherals();
        }}
      >
        <Text>Scan Devices</Text>
      </Pressable>
    );
  };

  const renderConnectedDevice = () => {
    return connectedDevice ? (
      <Text>Connected to {connectedDevice.name}</Text>
    ) : null;
  };

  const renderDevices = () => {
    return allDevices.map((device) =>
      device.name ? (
        <Pressable
          key={device.id}
          onPress={async () => {
            await connectToDevice(device);
          }}
        >
          <Text>{device.name}</Text>
        </Pressable>
      ) : null
    );
  };

  const connectToDevice = async (device: Device) => {
    const result = await ble.connectToDevice(device);
    if (result) {
      setConnectedDevice(result);
      ble.stopScan();
      setAllDevices([]);
    }
  }

  const renderShowConfigButton = () => {
    return connectedDevice ? (
      <Pressable
        style={styles.pressable}
        onPress={() => {
          console.debug("Edit config pressed");
        }}
      >
        <Text>Edit Config</Text>
      </Pressable>
    ): null;
  }

  const onConfirmGrid = (grid : Array<boolean>) => {
    console.debug("confirmed grid!");
    console.debug(grid);
    var pilulier = ConfigPilulier.fromBoolArray(grid);
    console.debug(pilulier.getTotalPillsToTake());
    console.debug(pilulier.week.tuesday.mustTakeMorning);
    console.debug(pilulier.toJson());
    console.debug(pilulier.toBinaryString());
    updateConfigBle(pilulier);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilulier BLE</Text>
      {isBluetoothPermissionGranted ? null : renderPermissionRequest()}
      {renderScanningControls()}
      {renderConnectedDevice()}
      {renderDevices()}
      <Pressable style={styles.pressable} onPress={() => {
        sendNotification();
      }}
        >
        <Text>Notification test</Text>
      </Pressable>
      {connectedDevice && (
      <>
        {renderShowConfigButton()}
        <Grid confirmCallback={onConfirmGrid} />
      </>
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
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  }
});