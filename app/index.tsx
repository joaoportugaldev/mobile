import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Sagil</Text>
      <Link
        href={"/ble_scanner"}
        style={{
          width: "90%",
          textAlign: "center",
          backgroundColor: "gray",
          padding: 10,
          borderRadius: 5,
        }}
        onPress={() => {
          console.log("Clicou no botão de escanear dispositivos BLE");
        }}
      >
        <Text style={{ color: "white", fontSize: 18, marginBottom: 10 }}>
          Escanear Dispositivos BLE
        </Text>
      </Link>
    </View>
  );
}
