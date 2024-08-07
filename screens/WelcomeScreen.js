import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Swiper from "react-native-swiper";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

export default function WelcomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        paginationStyle={{ bottom: 50 }}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        <View style={styles.slide}>
          <Image
            source={require("../assets/images/img1.png")}
            style={styles.image}
          />
          <View style={styles.textContainer}>
            <MaterialIcons name="local-hospital" size={48} color="white" />
            <Text style={styles.text}>Consult with trusted doctors</Text>
          </View>
        </View>
        <View style={styles.slide}>
          <Image
            source={require("../assets/images/im2.gif")}
            style={styles.image}
          />
          <View style={styles.textContainer}>
            <MaterialIcons name="accessibility" size={48} color="white" />
            <Text style={styles.text}>Get the best advice</Text>
          </View>
        </View>
        <View style={styles.slide}>
          <Image
            source={require("../assets/images/img3.png")}
            style={styles.image}
          />
          <View style={styles.textContainer}>
            <MaterialIcons name="mood" size={48} color="white" />
            <Text style={styles.text}>Feel better with our help</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  wrapper: {},
  slide: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",
    marginBottom: 200,
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    height: 250,
    width: "100%",
    backgroundColor: "#2E6FF3",
    padding: 20,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    alignItems: "center",
  },
  text: {
    fontSize: 25,
    width: "80%",
    color: "white",
    marginTop: 20,
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  button: {
    position: "absolute",
    bottom: 50,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
  },
  dot: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "white",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
