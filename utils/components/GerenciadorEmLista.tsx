import { GerenciadorProps } from "@/contexts/ContextoGerenciador";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { colors, styles } from "../styles";
import useGerenciadores from "@/hooks/useGerenciadores";

export default function GerenciadorEmLista(gerenciadorProps: GerenciadorProps) {
  const { iniciarConexaoGerenciador, isConectando } = useGerenciadores();

  const renderizarBotaoConectar = (gerenciador: GerenciadorProps) => {
    return (
      <>
        {isConectando ? (
          <ActivityIndicator size={32} color={colors.sky500} />
        ) : (
          <TouchableOpacity
            style={styles.botaoPadrao}
            onPress={() => iniciarConexaoGerenciador(gerenciador.mac)}
            disabled={isConectando}
          >
            <Text style={styles.botaoTexto}>Conectar</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        marginHorizontal: 8,
        backgroundColor: "white",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View>
        <Text style={{ fontSize: 20 }}>
          {gerenciadorProps.name.startsWith("MINI-02") && "Gerenciador"}
          {gerenciadorProps.name.startsWith("MINI-01") && "Gerenciador"}
        </Text>
        <Text style={{ fontSize: 14, color: "gray" }}>
          {gerenciadorProps.mac}
        </Text>
      </View>
      {renderizarBotaoConectar(gerenciadorProps)}
    </View>
  );
}
