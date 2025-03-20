package com.anonymous.mobile.moko;

import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import android.util.Log;
import androidx.annotation.NonNull;
import android.bluetooth.BluetoothDevice;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.moko.support.scannergw.MokoBleScanner;
import com.moko.support.scannergw.OrderTaskAssembler;
import com.moko.support.scannergw.MokoSupport;
import com.moko.support.scannergw.callback.MokoScanDeviceCallback;
import com.moko.support.scannergw.entity.DeviceInfo;
import com.moko.support.scannergw.entity.OrderServices;
import com.moko.support.scannergw.entity.OrderCHAR;

import com.moko.ble.lib.task.OrderTask;
import com.moko.ble.lib.event.ConnectStatusEvent;
import com.moko.ble.lib.event.OrderTaskResponseEvent;
import com.moko.ble.lib.task.OrderTaskResponse;
import com.moko.ble.lib.MokoConstants;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;

import no.nordicsemi.android.support.v18.scanner.ScanRecord;
import no.nordicsemi.android.support.v18.scanner.ScanResult;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;
import javax.annotation.Nullable;

public class MokoScanModule extends ReactContextBaseJavaModule {

    private static final String TAG = "MokoScanModule";
    private MokoBleScanner mokoBleScanner;
    private ConcurrentHashMap<String, DeviceInfo> deviceMap;
    private List<DeviceInfo> devices;
    private Handler scanHandler;
    private boolean isPasswordError;
    private boolean isScanning = false;
    private Promise scanPromise;

    public MokoScanModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mokoBleScanner = new MokoBleScanner(reactContext);
        deviceMap = new ConcurrentHashMap<>();
        devices = new ArrayList<>();
        scanHandler = new Handler(Looper.getMainLooper());

        // Registra o EventBus para receber eventos de conexão se ainda não estiver
        // registrado
        if (!EventBus.getDefault().isRegistered(this)) {
            EventBus.getDefault().register(this);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "MokoScanModule";
    }

    @ReactMethod
    public void startScanDevices(Promise promise) {
        try {
            // 🔹 Verifica se o Bluetooth está ativado antes de escanear
            BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
                promise.reject("BLUETOOTH_DISABLED", "O Bluetooth está desligado ou não disponível.");
                return;
            }

            // 🔹 Se um escaneamento já estiver rodando, pare-o antes de iniciar outro
            if (isScanning) {
                mokoBleScanner.stopScanDevice();
                scanHandler.removeCallbacksAndMessages(null);
            }

            // 🔹 Inicializa variáveis
            isScanning = true;
            scanPromise = promise;
            deviceMap.clear();
            devices.clear();

            Log.d(TAG, "🔍 Iniciando escaneamento de dispositivos...");

            mokoBleScanner.startScanDevice(new MokoScanDeviceCallback() {
                @Override
                public void onStartScan() {
                    Log.d(TAG, "📡 Escaneamento iniciado...");
                }

                @Override
                public void onScanDevice(DeviceInfo deviceInfo) {
                    ScanResult scanResult = deviceInfo.scanResult;
                    ScanRecord scanRecord = scanResult.getScanRecord();
                    Map<ParcelUuid, byte[]> serviceData = scanRecord.getServiceData();

                    if (serviceData == null || serviceData.isEmpty()) {
                        return;
                    }

                    byte[] data = serviceData.get(new ParcelUuid(OrderServices.SERVICE_ADV.getUuid()));
                    if (data == null || data.length != 1) {
                        return;
                    }

                    deviceInfo.deviceType = data[0] & 0xFF;
                    deviceMap.put(deviceInfo.mac, deviceInfo);
                    Log.d(TAG, "📡 Dispositivo encontrado: " + deviceInfo.name + " - " + deviceInfo.mac);
                }

                @Override
                public void onStopScan() {
                    Log.d(TAG, "🛑 Escaneamento finalizado.");
                    isScanning = false;
                    devices.clear();
                    devices.addAll(deviceMap.values());

                    // 🔹 Converte os dispositivos encontrados para JSON e retorna para o React
                    // Native
                    JSONArray deviceArray = new JSONArray();
                    for (DeviceInfo device : devices) {
                        try {
                            JSONObject jsonDevice = new JSONObject();
                            jsonDevice.put("name", device.name);
                            jsonDevice.put("mac", device.mac);
                            jsonDevice.put("rssi", device.rssi);
                            deviceArray.put(jsonDevice);
                        } catch (Exception e) {
                            Log.e(TAG, "Erro ao converter dispositivo para JSON", e);
                        }
                    }

                    if (scanPromise != null) {
                        scanPromise.resolve(deviceArray.toString());
                        scanPromise = null;
                    }
                }
            });

            // 🔹 Define um timeout para parar o escaneamento após 10 segundos
            scanHandler.postDelayed(() -> {
                mokoBleScanner.stopScanDevice();
                Log.d(TAG, "⏳ Escaneamento finalizado automaticamente após timeout.");
            }, 1000);

        } catch (Exception e) {
            if (scanPromise != null) {
                scanPromise.reject("SCAN_ERROR", e);
                scanPromise = null;
            }
            isScanning = false;
        }
    }

    @ReactMethod
    public void stopScanDevices(Promise promise) {
        try {
            if (!isScanning) {
                promise.reject("NO_SCAN_RUNNING", "Nenhum escaneamento ativo.");
                return;
            }

            mokoBleScanner.stopScanDevice();
            scanHandler.removeCallbacksAndMessages(null);
            isScanning = false;
            Log.d(TAG, "🛑 Escaneamento interrompido com sucesso!");
            promise.resolve("Escaneamento interrompido com sucesso!");

        } catch (Exception e) {
            promise.reject("STOP_SCAN_ERROR", "Erro ao interromper escaneamento", e);
        }
    }

    @ReactMethod
    public void connectToDevice(String macAddress, Promise promise) {
        try {
            // Verifica se o dispositivo está no mapa de dispositivos
            if (!deviceMap.containsKey(macAddress)) {
                promise.reject("DEVICE_NOT_FOUND", "Dispositivo não encontrado no mapa de dispositivos.");
                return;
            }

            // Inicia a conexão do celular com o dispositivo (Gateway - Gerenciador de
            // Sensores)
            MokoSupport moko = MokoSupport.getInstance();
            moko.connDevice(macAddress);
            promise.resolve("Conexão com dispositivo de mac " + macAddress + " iniciada.");

        } catch (Exception e) {
            Log.e(TAG, "❌ Erro ao conectar ao dispositivo", e);
            promise.reject("CONNECTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public boolean isDeviceConnected(String macAddress) {
        try {
            MokoSupport moko = MokoSupport.getInstance();
            return moko.isConnDevice(macAddress);
        } catch (Exception e) {
            Log.e(TAG, "❌ Erro ao verificar conexão com dispositivo", e);
            return false;
        }
    }

    @ReactMethod
    public void disconnectDevice(Promise promise) {
        try {
            MokoSupport moko = MokoSupport.getInstance();
            moko.disConnectBle();
            promise.resolve("Dispositivo desconectado com sucesso!");
        } catch (Exception e) {
            promise.reject("DISCONNECTION_ERROR", e);
        }
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onConnectStatusEvent(ConnectStatusEvent event) {
        String action = event.getAction();
        WritableMap params = Arguments.createMap();

        if (MokoConstants.ACTION_DISCONNECTED.equals(action)) {
            Log.d(TAG, "🔗 EVENT_BUS: Dispositivo desconectado!");
            params.putString("status", "disconnected");
            sendEvent(getReactApplicationContext(), "onConnectStatusEvent", params);

            if (isPasswordError) {
                isPasswordError = false;
            } else {
                Log.e(TAG, "❌ Conexão falhou, tentando novamente...");
            }
        }

        if (MokoConstants.ACTION_DISCOVER_SUCCESS.equals(action)) {
            Log.d(TAG, "🔗 EVENT_BUS: Dispositivo descoberto com sucesso! Verificando senha...");
            params.putString("status", "connected");
            sendEvent(getReactApplicationContext(), "onConnectStatusEvent", params);

            new Handler().postDelayed(() -> {
                List<OrderTask> orderTasks = new ArrayList<>();
                orderTasks.add(OrderTaskAssembler.setPassword("Moko4321"));
                MokoSupport.getInstance().sendOrder(orderTasks.toArray(new OrderTask[0]));
                Log.d(TAG, "🔐 Senha enviada automaticamente para autenticação.");
            }, 500);
        }
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onOrderTaskResponseEvent(OrderTaskResponseEvent event) {
        final String action = event.getAction();
        WritableMap params = Arguments.createMap();

        if (MokoConstants.ACTION_ORDER_TIMEOUT.equals(action)) {
            Log.e(TAG, "⏳ Tempo limite atingido para resposta.");
            MokoSupport.getInstance().disConnectBle();
            return;
        }

        if (MokoConstants.ACTION_ORDER_RESULT.equals(action)) {
            OrderTaskResponse response = event.getResponse();
            if (response == null || response.responseValue == null || response.responseValue.length < 5) {
                Log.e(TAG, "❌ Resposta inválida do dispositivo.");
                return;
            }

            byte[] value = response.responseValue;
            int header = value[0] & 0xFF; // 0xED
            int flag = value[1] & 0xFF; // read or write
            int cmd = value[2] & 0xFF;
            int length = value[3] & 0xFF;

            if (header != 0xED)
                return;

            if (flag == 0x01 && cmd == 0x01 && length == 0x01) {
                int result = value[4] & 0xFF;

                if (result == 1) {
                    Log.d(TAG, "✅ Senha aceita pelo dispositivo!");
                    params.putString("status", "authenticated");
                    sendEvent(getReactApplicationContext(), "onOrderTaskResponseEvent", params);

                    // Enviar usuário para a tela de informações do dispositivo
                    // WritableMap deviceParams = Arguments.createMap();
                    // deviceParams.putString("mac", selectedMac);
                    // deviceParams.putString("name", selectedName);
                    // sendEvent(getReactApplicationContext(), "navigateToDeviceInfo",
                    // deviceParams);

                } else {
                    Log.e(TAG, "❌ Senha incorreta!");
                    MokoSupport.getInstance().disConnectBle();
                }
            }
        }
    }

    // @ReactMethod
    // public void setGatewayPassword() {
    // String password = "senhaerrada";
    // MokoSupport.getInstance().sendOrder(OrderTaskAssembler.setPassword(password));
    // }

    // Não se esqueça de desregistrar o EventBus quando não for mais necessário
    public void onDestroy() {
        EventBus.getDefault().unregister(this);
    }

    // Método para enviar eventos para o javascript
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

}
