import { ProvedorGerenciador } from "@/contexts/ContextoGerenciador";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ProvedorGerenciador>
      <Stack>
        <Stack.Screen name={"index"} />
        <Stack.Screen
          name={"ble_scanner"}
          options={{ title: "Escanear gerenciadores" }}
        />
        <Stack.Screen
          name="device_info"
          options={{ title: "Configuração gerenciador" }}
        />
      </Stack>
    </ProvedorGerenciador>
  );
}
