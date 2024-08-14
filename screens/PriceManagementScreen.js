import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next"; // Import useTranslation

const PriceManagementScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [supplementServices, setSupplementServices] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation(); // Use i18n for translations

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "Services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
        const initialPrices = {};
        servicesData.forEach((service) => {
          initialPrices[service.id] = service.price || "";
        });
        setPrices(initialPrices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchSupplementServices = async () => {
      try {
        const servicesCollection = collection(
          db,
          "Services",
          "6vdePubVH2mJbu6XmoiL",
          "Supplement_Services(Personnel)"
        );
        const servicesSnapshot = await getDocs(servicesCollection);
        const supplementServicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSupplementServices(supplementServicesData);
        const initialPrices = {};
        supplementServicesData.forEach((service) => {
          initialPrices[service.id] = service.price || "";
        });
        setPrices((prevPrices) => ({
          ...prevPrices,
          ...initialPrices,
        }));
      } catch (error) {
        console.error("Error fetching supplement services:", error);
      }
    };

    fetchServices();
    fetchSupplementServices();
  }, []);

  const handlePriceChange = (id, value) => {
    setPrices((prevPrices) => ({
      ...prevPrices,
      [id]: value,
    }));
  };

  const savePrices = async () => {
    setLoading(true);
    try {
      for (const [id, price] of Object.entries(prices)) {
        const isMainService = services.find((service) => service.id === id);
        if (isMainService) {
          const serviceDoc = doc(db, "Services", id);
          await updateDoc(serviceDoc, { price: parseFloat(price) });
          console.log(`Updated price for main service ${id}: ${price}`);
        } else {
          const supplementServiceDoc = doc(
            db,
            "Services",
            "6vdePubVH2mJbu6XmoiL",
            "Supplement_Services(Personnel)",
            id
          );
          await updateDoc(supplementServiceDoc, { price: parseFloat(price) });
          console.log(`Updated price for supplement service ${id}: ${price}`);
        }
      }
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("pricesUpdated"),
      });
    } catch (error) {
      console.error("Error updating prices:", error);
      Toast.show({
        type: "error",
        text1: t("errorUpdatingPrices"),
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if the current language is RTL
  const isRTL = i18n.dir() === "rtl";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.goBackButton,
          { flexDirection: isRTL ? "row-reverse" : "row" }, // Adjust direction
        ]}
        onPress={() => navigation.navigate("Admin")}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"} // Adjust arrow direction
          size={30}
          color="#2E6FF3"
        />
        <Text style={styles.goBackText}>{t("goBack")}</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{t("priceManagement")}</Text>
      <ScrollView>
        {services.map((service) => (
          <View key={service.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.serviceName}>
                {service.name ? (typeof service.name === "object" ? service.name.en : service.name) : ""}
              </Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                placeholder={t("free")}
                value={prices[service.id] ? prices[service.id].toString() : ""}
                onChangeText={(text) => handlePriceChange(service.id, text)}
              />
            </View>
          </View>
        ))}
        <Text style={styles.subHeader}>{t("supplementServices")}</Text>
        {supplementServices.map((service) => (
          <View key={service.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.serviceName}>
                {service.name ? (typeof service.name === "object" ? service.name.en : service.name) : ""}
              </Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                placeholder={t("free")}
                value={prices[service.id] ? prices[service.id].toString() : ""}
                onChangeText={(text) => handlePriceChange(service.id, text)}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePrices}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t("savePrices")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  goBackText: {
    color: "#2E6FF3",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginLeft: I18nManager.isRTL ? 0 : 10, // Swap margin for RTL
    marginRight: I18nManager.isRTL ? 10 : 0, // Swap margin for RTL
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  header: {
    fontSize: 26,
    fontFamily: "Montserrat-Bold",
    color: "#1A202C",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: "#1A202C",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row", // Adjust direction
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 18,
    color: "#1A202C",
    flex: 1,
    fontFamily: "Montserrat-Bold",
    textAlign: I18nManager.isRTL ? "right" : "left", // Adjust text alignment
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    backgroundColor: "#EDF2F7",
    width: 100,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2E6FF3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
});

export default PriceManagementScreen;
