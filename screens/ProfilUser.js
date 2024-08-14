import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  I18nManager,
  Alert,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from "react-native-picker-select";
import { useTranslation } from "react-i18next";
import * as Updates from "expo-updates";

const ProfileUser = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    accountType: "",
  });

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userEmail = await AsyncStorage.getItem("userEmail");
        const userFirstName = await AsyncStorage.getItem("userFirstname");
        const userLastName = await AsyncStorage.getItem("userLastname");
        const userGender = await AsyncStorage.getItem("userGender");
        const userAccountType = await AsyncStorage.getItem("userAccountType");

        setProfile({
          firstName: userFirstName || "First Name",
          lastName: userLastName || "Last Name",
          gender: userGender || "Gender",
          email: userEmail || "email@example.com",
          accountType: userAccountType || "Standard",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("selectedLanguage");
        if (storedLanguage) {
          i18n.changeLanguage(storedLanguage);
          setSelectedLanguage(storedLanguage);

          // Enforce RTL if the selected language is Arabic
          const isRTL = storedLanguage === "ar";
          I18nManager.forceRTL(isRTL);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };

    fetchProfile();
    loadLanguage();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleLanguageChange = async (value) => {
    try {
      await i18n.changeLanguage(value);
      setSelectedLanguage(value);

      const isRTL = value === "ar";
      I18nManager.forceRTL(isRTL);
      await AsyncStorage.setItem("selectedLanguage", value);

      // Prompt the user to restart the app
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { textAlign: isRTL ? "right" : "left" }]}>
          {t("Profile")}
        </Text>
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={
            profile.gender === "Female"
              ? require("../assets/images/doctor.png")
              : require("../assets/images/maleProfile.png")
          }
          style={[
            styles.profileImage,
            { marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 },
          ]}
        />
        <Text
          style={[styles.name, { textAlign: isRTL ? "right" : "left" }]}
        >{`${profile.firstName} ${profile.lastName}`}</Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {t("AccountType")}: {profile.accountType}
        </Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {t("Gender")}: {profile.gender}
        </Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {t("Email")}: {profile.email}
        </Text>

        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={(value) => handleLanguageChange(value)}
            value={selectedLanguage}
            items={[
              { label: "English", value: "en" },
              { label: "العربية", value: "ar" },
              // Add more languages here
            ]}
            style={{
              ...pickerSelectStyles,
              inputIOS: {
                ...pickerSelectStyles.inputIOS,
                textAlign: isRTL ? "right" : "left",
              },
              inputAndroid: {
                ...pickerSelectStyles.inputAndroid,
                textAlign: isRTL ? "right" : "left",
              },
            }}
            placeholder={{ label: "Select Language", value: null }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.optionButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() => handleNavigation("Security")}
        >
          <Text
            style={[styles.optionText, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("Security")}
          </Text>
          <MaterialIcons
            name="security"
            size={20}
            color="#2E6FF3"
            style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() => handleNavigation("payments")}
        >
          <Text
            style={[styles.optionText, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("PaymentMethods")}
          </Text>
          <MaterialIcons
            name="payment"
            size={20}
            color="#2E6FF3"
            style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() => handleNavigation("SubscriptionHistory")}
        >
          <Text
            style={[styles.optionText, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("SubscriptionHistory")}
          </Text>
          <MaterialIcons
            name="history"
            size={20}
            color="#2E6FF3"
            style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={handleLogout}
        >
          <FontAwesome
            name="sign-out"
            size={20}
            color="#E74C3C"
            style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}
          />
          <Text
            style={[styles.buttonText, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("Logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E6FF3",
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
  },
  title: {
    fontSize: 25,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    marginTop: 30,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 140,
    marginBottom: 20,
    marginTop: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: "#7d7d7d",
    marginBottom: 10,
    fontFamily: "Montserrat-Regular",
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    color: "#2E6FF3",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  logoutButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginHorizontal: 10,
  },
  dropdownContainer: {
    width: "90%",
    marginVertical: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

// Adjust text alignment based on RTL settings in styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 0,
    color: "#333",
    paddingRight: 30,
    //textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0,
    color: "#333",
    paddingRight: 30,
    //textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});

export default ProfileUser;
