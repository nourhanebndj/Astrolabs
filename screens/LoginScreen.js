import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = i18n.dir() === 'rtl'; // Check RTL direction

  useEffect(() => {
    const checkRTL = async () => {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
      if (savedLanguage === "ar" && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
      } else if (savedLanguage !== "ar" && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
      }
    };
    checkRTL();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true); // Start loading
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Store user data in AsyncStorage
        await AsyncStorage.setItem("userId", user.uid);
        await AsyncStorage.setItem("userToken", await user.getIdToken());
        await AsyncStorage.setItem("userEmail", userData.email);
        await AsyncStorage.setItem("userFirstname", userData.firstname);
        await AsyncStorage.setItem("userLastname", userData.lastname);
        await AsyncStorage.setItem("userGender", userData.gender);
        await AsyncStorage.setItem("userAccountType", userData.accountType);

        const isAdmin =
          email ===
            ("Astro.labs.888@gmail.com" || "astro.labs.888@gmail.com") &&
          password === "king_1990";
        await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdmin));

        navigation.navigate(isAdmin ? "Admin" : "BottomNavBar");
      } else {
        Toast.show({
          type: "error",
          text1: t("User not found"),
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Login Error"),
        text2: error.message,
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const rtlStyles = isRTL
    ? { textAlign: "right", alignItems: "flex-end" }
    : { textAlign: "left", alignItems: "flex-start" };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/images/im2.gif")}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Image
            source={require("../assets/images/logoW.png")}
            style={styles.logo}
          />
          <Text style={[styles.title, rtlStyles]}>{t("WelcomeBack")}</Text>
          <TextInput
            style={[styles.input, rtlStyles]}
            placeholder={t("Email")}
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, rtlStyles]}
            placeholder={t("Password")}
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            {isLoading ? (
              <ActivityIndicator color="#4A90E2" />
            ) : (
              <Text style={styles.buttonText}>{t("Login")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, rtlStyles]}>
              {t("ForgotPassword")}
            </Text>
          </TouchableOpacity>

          <View style={[styles.signupContainer, isRTL && styles.rtlSignupContainer]}>
            <Text style={[styles.signupPrompt, rtlStyles]}>
              {t("DontHaveAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={[styles.signupText, rtlStyles]}>
                {t("SignUp")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    marginTop: 40,
    width: "100%",
    height: "40%",
    resizeMode: "contain",
  },
  textContainer: {
    width: "100%",
    backgroundColor: "#2E6FF3",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 120,
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
  },
  logo: {
    width: 150,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    fontSize: 35,
    color: "white",
    fontFamily: "Montserrat-Bold",
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    fontFamily: "Montserrat-Regular",
  },
  button: {
    width: "80%",
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  forgotPasswordText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginTop: 10,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  rtlSignupContainer: {
    flexDirection: 'row-reverse', // Adjust direction for RTL
  },
  signupPrompt: {
    color: "lightgrey",
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
  },
  signupText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});
