import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function DispositivoDetalhes() {
  const { deviceId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18 }}>Dispositivo Conectado</Text>
      <Text style={{ fontSize: 14, color: "gray" }}>ID: {deviceId}</Text>
    </View>
  );
}
