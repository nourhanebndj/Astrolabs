import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";

const PaymentComponent = ({ price }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://us-central1-astrolabs-1a622.cloudfunctions.net/createPayment",
        { price }
      );

      if (response.status === 200) {
        const { links } = response.data;
        const approvalLink = links.find((link) => link.rel === "approval_url");

        if (approvalLink) {
          const approvalUrl = approvalLink.href;
          const result = await WebBrowser.openAuthSessionAsync(approvalUrl);

          if (result.type === "success" && result.url) {
            const urlParams = new URLSearchParams(result.url.split("?")[1]);
            const paymentId = urlParams.get("paymentId");
            const PayerID = urlParams.get("PayerID");

            if (paymentId && PayerID) {
              await executePayment(paymentId, PayerID);
            } else {
              Alert.alert("Error", "Payment ID or Payer ID is missing.");
            }
          } else {
            Alert.alert("Error", "Payment not approved.");
          }
        } else {
          Alert.alert("Error", "Approval URL not found in payment response.");
        }
      } else {
        Alert.alert("Error", "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Payment creation failed:", error);
      Alert.alert("Error", "Payment creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executePayment = async (paymentId, PayerID) => {
    try {
      const response = await axios.post(
        `https://us-central1-astrolabs-1a622.cloudfunctions.net/executePayment`,
        null,
        {
          params: { paymentId, PayerID },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Payment executed successfully.");
      } else {
        Alert.alert("Error", "Failed to execute payment.");
      }
    } catch (error) {
      console.error("Payment execution failed:", error);
      Alert.alert("Error", "Payment execution failed. Please try again.");
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.paypal}
        onPress={handlePayment}
        disabled={loading}
      >
        <View style={styles.paypalInner}>
          <Image
            source={require("../assets/images/paypal.png")}
            style={styles.paypalImage}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
          ) : (
            <Text style={styles.text}>Pay Now</Text>
          )}
        </View>
        <Text style={styles.text}>${price}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paypal: {
    backgroundColor: "#003087",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  paypalInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  paypalImage: {
    width: 30,
    height: 30,
  },
  loader: {
    marginLeft: 10,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
  },
});

export default PaymentComponent;
