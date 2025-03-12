import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"ble_scanner"} />
    </Stack>
  );
}
