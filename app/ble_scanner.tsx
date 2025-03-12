import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  NativeModules,
  Alert,
} from "react-native";
import { requestPermissionsAndroid } from "@/utils/functions/requestPermissions";

const { MokoScanModule } = NativeModules;

export default function EscanearBLE() {
  interface Device {
    name: string;
    mac: string;
  }

  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // 🔹 Iniciar escaneamento BLE
  const scanDevices = async () => {
    const hasPermission = await requestPermissionsAndroid();
    if (!hasPermission) return;

    setIsScanning(true);
    setDevices([]); // Limpa a lista antes de escanear novamente

    try {
      const result = await MokoScanModule.startScanDevices();
      setDevices(JSON.parse(result));
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível iniciar o escaneamento."
      );
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
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name || "Desconhecido"}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{item.mac}</Text>
          </View>
        )}
      />

      <Button
        title="Escanear Novamente"
        onPress={scanDevices}
        disabled={isScanning}
      />
    </View>
  );
}
