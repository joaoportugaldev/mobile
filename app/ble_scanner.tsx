import React, { useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, NativeModules, Alert, PermissionsAndroid, Platform } from "react-native";

const { MokoScanModule } = NativeModules;

export default function EscanearBLE() {
  interface Device {
    name: string;
    mac: string;
  }

  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // 🔹 Função para solicitar permissões BLE antes de escanear
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      try {
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
          Alert.alert("Permissão negada", "O aplicativo precisa de permissões de Bluetooth para funcionar corretamente.");
          return false;
        }

        return true;
      } catch (error) {
        console.error("Erro ao solicitar permissões:", error);
        Alert.alert("Erro", "Não foi possível solicitar permissões.");
        return false;
      }
    }

    return true; // No iOS ou Android < 12, não precisa pedir permissões
  };

  // 🔹 Iniciar escaneamento BLE
  const scanDevices = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsScanning(true);
    setDevices([]); // Limpa a lista antes de escanear novamente

    try {
      const result = await MokoScanModule.startScanDevices();
      setDevices(JSON.parse(result));
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", error.message || "Não foi possível iniciar o escaneamento.");
    }

    setIsScanning(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
        Dispositivos Encontrados:
      </Text>

      {isScanning && <ActivityIndicator size="large" color="blue" />}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.mac}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
            <Text style={{ fontSize: 16 }}>{item.name || "Desconhecido"}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{item.mac}</Text>
          </View>
        )}
      />

      <Button title="Escanear Novamente" onPress={scanDevices} disabled={isScanning} />
    </View>
  );
}
