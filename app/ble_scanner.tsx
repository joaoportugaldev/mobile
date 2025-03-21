import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import useGerenciadores from "@/hooks/useGerenciadores";
import { styles, colors } from "@/utils/styles";
import GerenciadorEmLista from "@/utils/components/GerenciadorEmLista";

export default function EscanearBLE() {
  const { isConectando, isEscaneando, gerenciadores, escanearGerenciadores } =
    useGerenciadores();

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {isEscaneando && (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18 }}>Procurando gerenciadores...</Text>
          <ActivityIndicator size={32} color={colors.sky500} />
        </View>
      )}

      <FlatList
        data={gerenciadores}
        keyExtractor={(item) => item.mac}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        style={{ marginTop: 8 }}
        renderItem={({ item }) => <GerenciadorEmLista {...item} />}
      />

      <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
        <TouchableOpacity
          style={styles.botaoPadrao}
          onPress={escanearGerenciadores}
          disabled={isEscaneando || isConectando}
        >
          <Text style={styles.botaoTexto}>Procurar Gerenciadores</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
