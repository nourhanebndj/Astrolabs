import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function ChangeLanguageScreen({ navigation }) {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (language) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
      Toast.show({
        type: "success",
        text1: "Language Changed",
        text2: `The language has been changed to ${language}`,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Language Change Error",
        text2: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Change Language</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLanguageChange("en")}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>English</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLanguageChange("ar")}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Arabic</Text>
          )}
        </TouchableOpacity>
        <Toast ref={(ref) => Toast.setRef(ref)} />
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
  title: {
    fontSize: 30,
    color: "#333",
    marginBottom: 30,
    fontFamily: "Montserrat-Bold",
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
});
