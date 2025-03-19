import { Alert, NativeEventEmitter, NativeModules } from "react-native";
import { useEffect, useState } from "react";
import { requestPermissionsAndroid } from "@/utils/functions/requestPermissions";

interface GerenciadorProps {
  name: string;
  mac: string;
}

const { MokoScanModule } = NativeModules;
const mokoScanEmitter = new NativeEventEmitter();

export default function useGerenciadores() {
  const [gerenciadores, setDevices] = useState<GerenciadorProps[]>([]);
  const [isConectando, setIsConectando] = useState(false);
  const [isEscaneando, setIsEscaneando] = useState(false);

  const escanearGerenciadores = async () => {
    const hasPermission = await requestPermissionsAndroid();
    if (!hasPermission) return;

    setIsEscaneando(true);
    setDevices([]); // Limpa a lista antes de escanear novamente

    try {
      const result = await MokoScanModule.startScanDevices();
      setDevices(JSON.parse(result));
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível iniciar o escaneamento."
      );
    } finally {
      setIsEscaneando(false);
    }
  };

  const conectarGerenciador = async (mac: string) => {
    setIsConectando(true);

    try {
      await MokoScanModule.connectToDevice(mac);

      // Navega para a tela de informações do dispositivo
      // router.push({ pathname: "/device_info", params: { name, mac } });
    } catch (error: any) {
      console.error("Erro ao conectar ao dispositivo:", error);
      Alert.alert(
        "Erro",
        error.message || "Falha na conexão com o dispositivo."
      );
    } finally {
      setIsConectando(false);
    }
  };

  const obterStatusConexao = async () => {
    try {
      const isConnected = await MokoScanModule.isDeviceConnected(
        "34:98:7A:AA:2E:0E"
      );
      Alert.alert("isConnected", `Conectado: ${isConnected}`);
    } catch (error: any) {
      console.error(error);
    }
  };

  const desconectarGerenciador = async () => {
    try {
      const message = await MokoScanModule.disconnectDevice();
      Alert.alert("Desconectado", message);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    mokoScanEmitter.emit(MokoScanModule);
    
    const connectStatusSubscription = mokoScanEmitter.addListener(
      "onConnectStatusEvent",
      (event) => {
        console.log("Connection status event received:", event);
        // Handle the connection status event
      }
    );

    const orderTaskResponseSubscription = mokoScanEmitter.addListener(
      "onOrderTaskResponseEvent",
      (event) => {
        console.log("Order task response event received:", event);
        // Handle the order task response event
      }
    );

    return () => {
      connectStatusSubscription.remove();
      orderTaskResponseSubscription.remove();
    };
  }, []);

  return {
    gerenciadores,
    isConectando,
    isEscaneando,
    escanearGerenciadores,
    conectarGerenciador,
    obterStatusConexao,
    desconectarGerenciador,
  };
}
