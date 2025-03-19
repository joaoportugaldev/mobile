import React from "react";
import { View, Text, Button, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import useGerenciadores from "@/hooks/useGerenciadores";

export default function EscanearBLE() {
  const router = useRouter();
  const {
    isConectando,
    isEscaneando,
    conectarGerenciador,
    gerenciadores,
    obterStatusConexao,
    escanearGerenciadores,
    desconectarGerenciador
  } = useGerenciadores();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
        Gerenciadores Encontrados
      </Text>

      {isEscaneando && <ActivityIndicator size="large" color="blue" />}

      <FlatList
        data={gerenciadores}
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
              onPress={() => conectarGerenciador(item.mac)}
              disabled={isConectando}
            />
          </View>
        )}
      />

      <View style={{ display: "flex", gap: "10" }}>
        <Button
          title="Escanear Novamente"
          onPress={escanearGerenciadores}
          disabled={isEscaneando}
        />
        <Button
          title="Verificar conexão"
          onPress={() => obterStatusConexao()}
        />
        <Button
          title="Desconectar"
          onPress={() => desconectarGerenciador()}
        />
      </View>
    </View>
  );
}
