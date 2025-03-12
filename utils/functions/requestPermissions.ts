import { PermissionsAndroid, Platform, Alert } from "react-native";

// 🔹 Função para solicitar permissões BLE antes de escanear
const requestPermissionsAndroid = async (): Promise<boolean> => {
  if (Platform.OS === "android" && Platform.Version >= 31) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted["android.permission.BLUETOOTH_SCAN"] !==
          PermissionsAndroid.RESULTS.GRANTED ||
        granted["android.permission.BLUETOOTH_CONNECT"] !==
          PermissionsAndroid.RESULTS.GRANTED ||
        granted["android.permission.ACCESS_FINE_LOCATION"] !==
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert(
          "Permissão negada",
          "O aplicativo precisa de permissões de Bluetooth para funcionar corretamente."
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      Alert.alert("Erro", "Não foi possível solicitar permissões.");
      return false;
    }
  }

  return true; // No iOS ou Android < 12, não precisa pedir permissões
};

export { requestPermissionsAndroid };