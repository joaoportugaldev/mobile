import { StyleSheet } from "react-native";

const colors = {
  sky500: "#0EA5E9",
  sky400: "#2CB0E8",
  branco: "#fff",
  preto: "#000",
};

const styles = StyleSheet.create({
  botaoPadrao: {
    backgroundColor: colors.sky500,
    padding: 10,
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: 18,
    fontFamily: "Inter", // se estiver usando fonte personalizada
  },
});

export { styles, colors };
