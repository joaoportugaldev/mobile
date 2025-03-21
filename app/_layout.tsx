import { ProvedorGerenciador } from "@/contexts/ContextoGerenciador";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  return (
    <ProvedorGerenciador>
      <Stack>
        <Stack.Screen name={"index"} options={{ headerShown: false }} />
        <Stack.Screen
          name={"ble_scanner"}
          options={{ title: "Gerenciadores" }}
        />
        <Stack.Screen
          name="device_info"
          options={{ title: "Configuração gerenciador" }}
        />
      </Stack>
    </ProvedorGerenciador>
  );
}
