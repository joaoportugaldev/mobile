import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer"; // 🔹 Importação do Buffer para manipular os dados

const bleManager = new BleManager();

// 🔹 UUIDs corretos obtidos dos serviços descobertos
const AUTH_SERVICE_UUID = "0000aa00-0000-1000-8000-00805f9b34fb"; // Serviço de autenticação
const AUTH_CHARACTERISTIC_UUID = "0000aa01-0000-1000-8000-00805f9b34fb"; // Característica que recebe a senha

export default function AutenticarDispositivo() {
  const { deviceId } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const router = useRouter();

  const authenticateDevice = async () => {
    try {
      console.log(`🔐 Conectando ao dispositivo: ${deviceId}`);
      const device = await bleManager.connectToDevice(deviceId as string);
      await device.discoverAllServicesAndCharacteristics();

      console.log(`✅ Dispositivo conectado. Enviando senha...`);

      const encodedPassword = Buffer.from(password, "utf-8").toString("base64"); // Converte senha para base64

      await device.writeCharacteristicWithResponseForService(
        AUTH_SERVICE_UUID,
        AUTH_CHARACTERISTIC_UUID,
        encodedPassword
      );

      console.log("✅ Senha enviada com sucesso! Aguardando resposta...");

      Alert.alert("Autenticação", "Autenticado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.push({ pathname: "/dispositivo_detalhes", params: { deviceId } }),
        },
      ]);

    } catch (error: any) {
      console.error("❌ Erro na autenticação:", error);
      Alert.alert("Erro", `Falha na autenticação do dispositivo: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
        Insira a senha para autenticação:
      </Text>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Digite a senha..."
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20, fontSize: 16 }}
      />

      <Button title="Autenticar" onPress={authenticateDevice} />
    </View>
  );
}
