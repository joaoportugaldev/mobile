import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NativeModules } from "react-native";

const { MokoScanModule } = NativeModules;

export default function DeviceInfo() {
  const { mac } = useLocalSearchParams();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const info = await MokoScanModule.getDeviceInfo(mac);
        setDeviceInfo(JSON.parse(info));
      } catch (error) {
        console.error("Erro ao obter informações do dispositivo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [mac]);

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    // <View>
    //   <Text>Device Info</Text>
    // </View>
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Dispositivo Conectado</Text>
      {deviceInfo ? (
        <>
          <Text style={{ fontSize: 18, marginTop: 10 }}>DeviceInfo: {deviceInfo}</Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>MAC: {deviceInfo.mac}</Text>
          {/* <Text style={{ fontSize: 18, marginTop: 10 }}>Modelo: {deviceInfo.model}</Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>Fabricante: {deviceInfo.manufacturer}</Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>Versão SW: {deviceInfo.softwareVersion}</Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>Versão HW: {deviceInfo.hardwareVersion}</Text> */}
        </>
      ) : (
        <Text style={{ fontSize: 18, marginTop: 10, color: "red" }}>Erro ao carregar informações</Text>
      )}
    </View>
  );
}
