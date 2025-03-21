import { requestPermissionsAndroid } from "@/utils/functions/requestPermissions";
import { router } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { Alert, NativeEventEmitter, NativeModules } from "react-native";

export interface GerenciadorProps {
  name: string;
  mac: string;
}

interface ContextoGerenciadorProps {
  gerenciadores: GerenciadorProps[];
  gerenciadorAutenticado: GerenciadorProps | null;
  isConectando: boolean;
  isEscaneando: boolean;
  escanearGerenciadores: () => Promise<void>;
  iniciarConexaoGerenciador: (mac: string) => Promise<void>;
  obterStatusConexao: () => Promise<void>;
  desconectarGerenciador: () => Promise<void>;
}

const ContextoGerenciador = createContext<ContextoGerenciadorProps>({} as any);

export function ProvedorGerenciador(props: any) {
  const { MokoScanModule } = NativeModules;
  const mokoScanEmitter = new NativeEventEmitter();

  const [gerenciadores, setGerenciadores] = useState<GerenciadorProps[]>([]);
  const [gerenciadorAutenticado, setGerenciadorAutenticado] =
    useState<GerenciadorProps | null>(null);
  const [isConectando, setIsConectando] = useState(false);
  const [isEscaneando, setIsEscaneando] = useState(false);

  const escanearGerenciadores = async () => {
    const hasPermission = await requestPermissionsAndroid();
    if (!hasPermission) return;

    setIsEscaneando(true);
    setGerenciadores([]); // Limpa a lista antes de escanear novamente

    try {
      const result = await MokoScanModule.startScanDevices();
      setGerenciadores(JSON.parse(result));
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

  const iniciarConexaoGerenciador = async (mac: string) => {
    setIsConectando(true);

    try {
      await MokoScanModule.connectToDevice(mac);
    } catch (error: any) {
      console.error("Erro ao conectar ao dispositivo:", error);
      Alert.alert(
        "Erro",
        error.message || "Falha na conexão com o dispositivo."
      );
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

    const onDeviceAuthSubscription = mokoScanEmitter.addListener(
      "onDeviceAuth",
      (event) => {
        console.log("Evento recebido:", event);

        if (event.isDeviceConnected && event.isDeviceAuthenticated) {
          console.log("entrou aqui!");
          console.log(
            "event.authenticatedDeviceMac",
            event.authenticatedDeviceMac
          );
          console.log(
            "event.authenticatedDeviceName",
            event.authenticatedDeviceName
          );

          setIsConectando(false);
          setGerenciadorAutenticado({
            mac: event.authenticatedDeviceMac,
            name: event.authenticatedDeviceName,
          });

          console.log("gerenciador autenticado aqui!", gerenciadorAutenticado);

          if (gerenciadorAutenticado) {
            router.push({
              pathname: "/device_info",
              params: { ...gerenciadorAutenticado },
            });
          }

          // Navega para a tela de informações do dispositivo
        }
      }
    );

    return () => {
      connectStatusSubscription.remove();
      onDeviceAuthSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (gerenciadorAutenticado) {
      console.log("gerenciador autenticado aqui!", gerenciadorAutenticado);
      router.push({
        pathname: "/device_info",
        params: { ...gerenciadorAutenticado },
      });
    }
  }, [gerenciadorAutenticado]);

  return (
    <ContextoGerenciador.Provider
      value={{
        gerenciadores,
        gerenciadorAutenticado,
        isConectando,
        isEscaneando,
        escanearGerenciadores,
        iniciarConexaoGerenciador,
        obterStatusConexao,
        desconectarGerenciador,
      }}
    >
      {props.children}
    </ContextoGerenciador.Provider>
  );
}

export default ContextoGerenciador;
