import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const MoreScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const lang = i18n.language; // Get the current language
        const servicesCollection = collection(db, "Services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name[lang] || doc.data().name["en"], // Default to English if the language is not available
          images: doc.data().images,
          route: doc.data().route,
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [i18n.language]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
          width: "100%",
          marginTop: 40,
        }}
      >
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={30} color="#2E6FF3" />
          <Text style={styles.goBackText}>{t("Go Back")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>{t("All Services")}</Text>
      <View style={styles.grid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.card}
            onPress={() => navigation.navigate(service.route)}
          >
            <Image source={{ uri: service.images }} style={styles.image} />
            <Text style={styles.cardText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const isRTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    textAlign: isRTL ? "right" : "left",
  },
  goBackButton: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
  },
  goBackText: {
    color: "#2E6FF3",
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isRTL ? "flex-end" : "space-between",
  },
  card: {
    width: "30%",
    backgroundColor: "#2E6FF3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
    marginHorizontal: 5,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    fontFamily: "Montserrat-Bold",
  },
});

export default MoreScreen;
