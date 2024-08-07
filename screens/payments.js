import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  I18nManager,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const PaymentScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

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

  const handleGPay = () => {
    console.log("Google Pay button pressed");
  };

  const handlePayPal = () => {
    console.log("PayPal button pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AntDesign
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
          name="arrowleft"
          size={25}
          color="white"
        />
        <Text style={styles.title}>{t('paymentMethods')}</Text>
      </View>

      <View style={styles.comingSoonOverlay}>
        <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
      </View>

      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleGPay}
          disabled={true}
        >
          <Image
            source={require("../assets/images/gpay.png")}
            style={styles.paymentImage}
          />
          <AntDesign name="right" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handlePayPal}
          disabled={true}
        >
          <View style={styles.paypalImages}>
            <Image
              source={require("../assets/images/paypal.png")}
              style={styles.paymentImage}
            />
            <Image
              source={require("../assets/images/payp.png")}
              style={styles.paymentImage}
            />
          </View>
          <AntDesign name="right" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const isRTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
    position: "relative",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#2E6FF3",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
    flexDirection: "row",
  },
  backIcon: {
    marginTop: 15,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    marginLeft: 20,
    marginTop: 15,
    textAlign: isRTL ? 'right' : 'left',
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure overlay is on top
  },
  comingSoonText: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  paymentOptions: {
    padding: 20,
  },
  paymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    opacity: 0.6, // Reduce opacity to indicate disabled state
  },
  paymentImage: {
    width: 60,
    height: 30,
  },
  paypalImages: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default PaymentScreen;
