package com.flaviocecca.since;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "SinceBiometrics")
public class SinceBiometricsPlugin extends Plugin {
    private static final int AUTHENTICATORS =
        BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        int result = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        JSObject response = new JSObject();
        response.put("available", result == BiometricManager.BIOMETRIC_SUCCESS);
        response.put("code", result);
        call.resolve(response);
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        int result = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        if (result != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject("Biometria o credenziale dispositivo non disponibile.");
            return;
        }

        String title = call.getString("title", "Sblocca Since");
        String subtitle = call.getString("subtitle", "Conferma la tua identita per continuare.");

        Executor executor = ContextCompat.getMainExecutor(getContext());
        FragmentActivity activity = (FragmentActivity) getActivity();
        BiometricPrompt prompt = new BiometricPrompt(
            activity,
            executor,
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    JSObject response = new JSObject();
                    response.put("verified", true);
                    call.resolve(response);
                }

                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                    call.reject(errString.toString());
                }

                @Override
                public void onAuthenticationFailed() {
                    notifyListeners("authenticationFailed", new JSObject());
                }
            }
        );

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(AUTHENTICATORS)
            .build();

        getBridge().executeOnMainThread(() -> prompt.authenticate(promptInfo));
    }
}
