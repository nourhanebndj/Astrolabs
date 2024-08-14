import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const isRTL = i18n.dir() === 'rtl'; // Check RTL direction

  const handlePasswordReset = async () => {
    setIsLoading(true); // Start loading
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      Toast.show({
        type: "success",
        text1: t("Email Sent"),
        text2: t("Check your email for the reset link"),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Reset Error"),
        text2: error.message,
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const rtlStyles = isRTL
    ? { textAlign: "right", alignItems: "flex-end" }
    : { textAlign: "left", alignItems: "flex-start" };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isRTL && { alignItems: 'flex-start' }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={[styles.title, rtlStyles]}>{t("Forgot Password")}</Text>
        {!isEmailSent ? (
          <>
            <TextInput
              style={[styles.input, rtlStyles]}
              placeholder={t("Enter your email")}
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasswordReset}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>{t("Reset Password")}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.successMessage, rtlStyles]}>
            {t("Check your email for the reset link")}
          </Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.backToLoginText, rtlStyles]}>
            {t("Back to Login")}
          </Text>
        </TouchableOpacity>
        <Toast />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    color: "#333",
    marginBottom: 30,
    fontFamily: "Montserrat-Bold",
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    fontFamily: "Montserrat-Regular",
  },
  button: {
    width: "80%",
    height: 40,
    backgroundColor: "#2E6FF3",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  backToLoginText: {
    color: "#2E6FF3",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginTop: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#4A90E2",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
  },
});
