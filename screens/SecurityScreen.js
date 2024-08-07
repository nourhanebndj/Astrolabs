import React, { useState, useEffect } from "react";
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
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function SecurityScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRTL = () => {
      if (i18n.language === 'ar' && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
      } else if (i18n.language !== 'ar' && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
      }
    };
    handleRTL();
  }, [i18n.language]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("PasswordError"),
        text2: t("NewPasswordsDoNotMatch"),
      });
      return;
    }

    setIsLoading(true); // Start loading
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Toast.show({
        type: "success",
        text1: t("PasswordChanged"),
        text2: t("PasswordChangedSuccessfully"),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("ChangePasswordError"),
        text2: error.message,
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("ChangePassword")}</Text>
        <TextInput
          style={[styles.input, { flexDirection: isRTL ? "row-reverse" : "row" },]}
          placeholder={t("CurrentPassword")}
          placeholderTextColor="#aaa"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder={t("NewPassword")}
          placeholderTextColor="#aaa"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder={t("ConfirmNewPassword")}
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("ChangePassword")}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backToSettingsText}>{t("BackToSettings")}</Text>
        </TouchableOpacity>
        <Toast />
      </View>
    </KeyboardAvoidingView>
  );
}

const isRTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: "#333",
    marginBottom: 30,
    fontFamily: "Montserrat-Bold",
    textAlign: isRTL ? 'right' : 'left',
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
    textAlign:'center',
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
    textAlign: isRTL ? 'right' : 'left',
  },
  backToSettingsText: {
    color: "#2E6FF3",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginTop: 20,
    textAlign: isRTL ? 'right' : 'left',
  },
});
