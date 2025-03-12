import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, PermissionsAndroid, Platform, ActivityIndicator } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const bleManager = new BleManager();
const TARGET_DEVICE_NAME_START = "MINI-02" 

export default function EscanearBLE() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted["android.permission.BLUETOOTH_SCAN"] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted["android.permission.BLUETOOTH_CONNECT"] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted["android.permission.ACCESS_FINE_LOCATION"] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Permissões de Bluetooth negadas");
        return;
      }
    }

    scanDevices();
  };

  const scanDevices = () => {
    setIsScanning(true);
    setDevices([]); // Limpa a lista antes de escanear novamente

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Erro ao escanear:", error);
        setIsScanning(false);
        return;
      }
      if (device && device.name && device.name.startsWith(TARGET_DEVICE_NAME_START)) {
        setDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000); // Para o escaneamento após 10 segundos
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
        Dispositivos Bluetooth Encontrados:
      </Text>

      {isScanning && <ActivityIndicator size="large" color="blue" />}

      <FlatList
        data={devices} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
            <Text style={{ fontSize: 16 }}>{item.name || "Desconhecido"}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{item.id}</Text>
          </View>
        )}
      />

      <Button title="Escanear Novamente" onPress={scanDevices} disabled={isScanning} />
    </View>
  );
}
