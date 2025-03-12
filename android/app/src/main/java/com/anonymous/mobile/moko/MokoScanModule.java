package com.anonymous.mobile.moko;

import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.moko.support.scannergw.MokoBleScanner;
import com.moko.support.scannergw.MokoSupport;
import com.moko.support.scannergw.callback.MokoScanDeviceCallback;
import com.moko.support.scannergw.entity.DeviceInfo;
import com.moko.support.scannergw.entity.OrderServices;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import no.nordicsemi.android.support.v18.scanner.ScanRecord;
import no.nordicsemi.android.support.v18.scanner.ScanResult;

public class MokoScanModule extends ReactContextBaseJavaModule {

    private static final String TAG = "MokoScanModule";
    private MokoBleScanner mokoBleScanner;
    private ConcurrentHashMap<String, DeviceInfo> deviceMap;
    private List<DeviceInfo> devices;
    private Handler scanHandler;
    private boolean isScanning = false;
    private Promise scanPromise;

    public MokoScanModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mokoBleScanner = new MokoBleScanner(reactContext);
        deviceMap = new ConcurrentHashMap<>();
        devices = new ArrayList<>();
        scanHandler = new Handler(Looper.getMainLooper());
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

                    if (serviceData == null || serviceData.isEmpty()) return;

                    byte[] data = serviceData.get(new ParcelUuid(OrderServices.SERVICE_ADV.getUuid()));
                    if (data == null || data.length != 1) return;

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

                    // 🔹 Converte os dispositivos encontrados para JSON e retorna para o React Native
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
            }, 10000);

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
}
