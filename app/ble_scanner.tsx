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
import { useRouter } from "expo-router";
import { requestPermissionsAndroid } from "@/utils/functions/requestPermissions";

const { MokoScanModule } = NativeModules;

export default function EscanearBLE() {
  interface Device {
    name: string;
    mac: string;
  }

  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  // 🔹 Conectar ao dispositivo
  const connectToDevice = async (mac: string, name: string) => {
    setIsConnecting(true);

    try {
      const mensagem = await MokoScanModule.connectToDevice(mac);
      Alert.alert("Sucesso", mensagem);

      // Navega para a tela de informações do dispositivo
      router.push({ pathname: "/device_info", params: { name, mac } });
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha na conexão com o dispositivo.");
    }

    setIsConnecting(false);
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
            <Button
              title="Conectar"
              onPress={() => connectToDevice(item.mac, item.name)}
              disabled={isConnecting}
            />
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
