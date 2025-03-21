import React, { useCallback } from "react";
import useGerenciadores from "@/hooks/useGerenciadores";
import { View, Text, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";

export default function DeviceInfo() {
  const { gerenciadorAutenticado, desconectarGerenciador } = useGerenciadores();
  const navigation = useNavigation();

  // Detecta quando o usuário clica na seta de voltar
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", async (e) => {
        await desconectarGerenciador(); // desconecta ao voltar
      });

      return unsubscribe;
    }, [navigation])
  );

  if (!gerenciadorAutenticado) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Dispositivo Conectado
      </Text>
      {gerenciadorAutenticado ? (
        <>
          <Text style={{ fontSize: 18, marginTop: 10 }}>
            Name: {gerenciadorAutenticado.name}
          </Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>
            MAC: {gerenciadorAutenticado.mac}
          </Text>
        </>
      ) : (
        <Text style={{ fontSize: 18, marginTop: 10, color: "red" }}>
          Erro ao carregar informações
        </Text>
      )}
    </View>
  );
}
