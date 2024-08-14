import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ImageBackground,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const AssistanceScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleRegisterLink = () => {
    const url = "#"; // Replace with the actual URL
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const handleAssistanceRequest = () => {
    navigation.navigate("AssistanceRequestScreen");
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg-assistance.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <FontAwesome
            name="info-circle"
            size={24}
            color="white"
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            {t('learn')}{" "}
            <Text style={styles.linkText} onPress={handleRegisterLink}>
              {t('register_link')}
            </Text>
            {"\n"}
            {"\n"}
            {t('new_knowledge')}
            {"\n"}
            {"\n"}
            {t('discovered_facts')}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleAssistanceRequest}
          >
            <Text style={styles.buttonText}>{t('request_assistance')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    backgroundColor: "#2E6FF3",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  infoIcon: {
    alignSelf: "flex-end",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    fontFamily: "Montserrat-Regular",
  },
  linkText: {
    color: "#000000",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});
export default AssistanceScreen;