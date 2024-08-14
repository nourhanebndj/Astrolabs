import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = i18n.dir() === 'rtl';

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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const rtlStyles = isRTL
    ? { textAlign: "right", alignItems: "flex-end" }
    : { textAlign: "left", alignItems: "flex-start" };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} extraScrollHeight={20}>
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
    </KeyboardAwareScrollView>
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
    marginTop: hp('5%'),
    width: "100%",
    height: hp('35%'),
    resizeMode: "contain",
  },
  textContainer: {
    width: "100%",
    backgroundColor: "#2E6FF3",
    padding: wp('5%'),
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('30%'),
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
  },
  logo: {
    width: wp('40%'),
    height: hp('15%'),
    resizeMode: "contain",
  },
  title: {
    fontSize: wp('8.5%'),
    color: "white",
    fontFamily: "Montserrat-Bold",
  },
  input: {
    width: "80%",
    height: hp('5%'),
    backgroundColor: "white",
    borderRadius: wp('5%'),
    paddingHorizontal: wp('3%'),
    marginVertical: hp('1%'),
    fontFamily: "Montserrat-Regular",
  },
  button: {
    width: "80%",
    height: hp('5%'),
    backgroundColor: "white",
    borderRadius: wp('5%'),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp('2%'),
  },
  buttonText: {
    color: "#4A90E2",
    fontSize: wp('4.5%'),
    fontFamily: "Montserrat-Bold",
  },
  forgotPasswordText: {
    color: "white",
    fontSize: wp('4.5%'),
    fontFamily: "Montserrat-Bold",
    marginTop: hp('1.5%'),
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: hp('2.5%'),
  },
  rtlSignupContainer: {
    flexDirection: 'row-reverse',
  },
  signupPrompt: {
    color: "lightgrey",
    fontFamily: "Montserrat-Regular",
    fontSize: wp('4%'),
  },
  signupText: {
    color: "white",
    fontSize: wp('4%'),
    fontFamily: "Montserrat-Bold",
  },
});
