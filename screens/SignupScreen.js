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
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function SignupScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState("standard");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("Password Error"),
        text2: t("Passwords do not match"),
      });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid; // Get the user ID

      // Save user data to Firestore
      await setDoc(doc(db, "users", uid), {
        firstname,
        lastname,
        email,
        gender, // Enregistrer le genre
        accountType,
        uid,
        createdAt: new Date().toISOString(),
      });

      // Clear previous user data from AsyncStorage
      await AsyncStorage.clear();

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("userId", uid);
      await AsyncStorage.setItem("userToken", idToken);
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userFirstname", firstname);
      await AsyncStorage.setItem("userLastname", lastname);
      await AsyncStorage.setItem("userGender", gender);
      await AsyncStorage.setItem("userAccountType", accountType);

      // Redirect to BottomNavBar after signup
      navigation.replace("BottomNavBar");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Signup Error"),
        text2: error.message,
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const isRTL = i18n.dir() === 'rtl'; // Check RTL direction

  const rtlStyles = isRTL
    ? { textAlign: "right", alignItems: "flex-end" }
    : { textAlign: "left", alignItems: "flex-start" };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={[styles.title, rtlStyles]}>{t("Create an Account")}</Text>
        <TextInput
          style={[styles.input, rtlStyles]}
          placeholder={t("First Name")}
          placeholderTextColor="#aaa"
          value={firstname}
          onChangeText={setFirstname}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, rtlStyles]}
          placeholder={t("Last Name")}
          placeholderTextColor="#aaa"
          value={lastname}
          onChangeText={setLastname}
          autoCapitalize="none"
        />
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "male" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("male")}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === "male" && { color: "white" },
              ]}
            >
              {t("Male")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "female" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("female")}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === "female" && { color: "white" },
              ]}
            >
              {t("Female")}
            </Text>
          </TouchableOpacity>
        </View>
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
        <TextInput
          style={[styles.input, rtlStyles]}
          placeholder={t("Confirm Password")}
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("Sign Up")}</Text>
          )}
        </TouchableOpacity>
        <View style={{ alignItems: "center", marginTop: 20, width: "100%" }}>
          <View>
            <Text
              style={{
                width: "60%",
                fontFamily: "Montserrat-Regular",
                fontSize: 12,
                alignSelf: "center",
                textAlign: "center",
              }}
            >
              {t("By signing up, you agree to our")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 16,
                alignSelf: "center",
                textAlign: "center",
                color: "#4A96E2",
                textDecorationLine: "underline",
              }}
               >
              {t("Terms of Service and Privacy Policy")}
            </Text>
    </TouchableOpacity>
          </View>
          <View>
            <View
              style={{
                width: "60%",
                alignSelf: "center",
                marginVertical: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontFamily: "Montserrat-Bold",
                  fontSize: 20,
                }}
              >
                {t("OR")}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat-Regular",
                  fontSize: 16,
                }}
              >
                {t("Already have an account?")}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>{t("Log In")}</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    color: "#2E6FF3",
    marginBottom: 20,
    fontFamily: "Montserrat-Bold",
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Montserrat-Regular",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    width: "80%",
  },
  genderButton: {
    width: "45%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2E6FF3",
    marginHorizontal: 15,
  },
  genderButtonSelected: {
    backgroundColor: "#2E6FF3",
    color: "white",
  },
  genderButtonText: {
    color: "#2E6FF3",
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
  loginText: {
    color: "#2E6FF3",
    marginHorizontal: 10,
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
