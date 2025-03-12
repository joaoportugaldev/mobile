package com.anonymous.mobile.moko;

import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.moko.support.scannergw.MokoBleScanner;
import com.moko.support.scannergw.callback.MokoScanDeviceCallback;
import com.moko.support.scannergw.entity.DeviceInfo;
import java.util.ArrayList;
import java.util.List;

public class MokoScanModule extends ReactContextBaseJavaModule {

    private static final String TAG = "MokoScanModule";
    private MokoBleScanner mokoBleScanner;
    private List<DeviceInfo> scannedDevices = new ArrayList<>();

    public MokoScanModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mokoBleScanner = new MokoBleScanner(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "MokoScanModule";
    }

    @ReactMethod
    public void startScanDevices(Promise promise) {
        try {
            scannedDevices.clear();
            mokoBleScanner.startScanDevice(new MokoScanDeviceCallback() {
                @Override
                public void onStartScan() {
                    Log.d(TAG, "Escaneamento iniciado...");
                }

                @Override
                public void onScanDevice(DeviceInfo device) {
                    if (!scannedDevices.contains(device)) {
                        scannedDevices.add(device);
                        Log.d(TAG, "Dispositivo encontrado: " + device.name + " - " + device.mac);
                    }
                }

                @Override
                public void onStopScan() {
                    Log.d(TAG, "Escaneamento finalizado.");
                    promise.resolve(scannedDevices.toString());
                }
            });
        } catch (Exception e) {
            promise.reject("SCAN_ERROR", "Erro ao iniciar escaneamento", e);
        }
    }

    @ReactMethod
    public void stopScanDevices(Promise promise) {
        try {
            mokoBleScanner.stopScanDevice();
            promise.resolve("Escaneamento interrompido com sucesso!");
        } catch (Exception e) {
            promise.reject("STOP_SCAN_ERROR", "Erro ao interromper escaneamento", e);
        }
    }
}
