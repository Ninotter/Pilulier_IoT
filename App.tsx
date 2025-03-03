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

export default function App() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const ble = new BLE();
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothPermissionGranted, setIsBluetoothPermissionGranted] = useState(false);
  const deviceName = "pilulier";
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
      setConnectedDevice(device);
      ble.stopScan();
      setAllDevices([]);
      return true;
    }
    return false;
  };

  const scanForPeripherals = () => {
    ble.startScan(onDeviceFound);
  };


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
      {renderShowConfigButton()}
      <Grid confirmCallback={onConfirmGrid}/>
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