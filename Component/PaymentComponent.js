import React, { useState, useEffect, useCallback } from "react";
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
  const [approvalUrl, setApprovalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    console.log("Attempting payment...");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://us-central1-astrolabs-1a622.cloudfunctions.net/createPayment",
        {
          price: price,
        }
      );

      console.log("Payment creation response:", response.data);

      if (response.status === 200) {
        const { links } = response.data;
        const approvalLink = links.find((link) => link.rel === "approval_url");

        if (approvalLink) {
          const approvalUrl = approvalLink.href;
          setApprovalUrl(approvalUrl); // Store the approval URL in state
          // Open the URL in the browser
          await WebBrowser.openBrowserAsync(approvalUrl);
        } else {
          console.error("Approval URL not found in response.");
          Alert.alert("Error", "Approval URL not found in payment response.");
        }
      } else {
        console.error("Unexpected response status:", response.status);
        Alert.alert("Error", "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Payment creation failed:", error);
      if (error.response && error.response.status === 400) {
        Alert.alert(
          "Error",
          "Invalid request payload. Please check your request data."
        );
      } else if (error.response && error.response.status === 404) {
        Alert.alert(
          "Error",
          "Payment endpoint not found. Please try again later."
        );
      } else {
        Alert.alert("Error", "Payment creation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.paypal}
        onPress={handlePayment}
        disabled={loading}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/paypal.png")}
            style={{ width: 30, height: 30 }}
          />
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginLeft: 10 }}
            />
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16, // Added padding for better layout
  },
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
  text: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
  },
});

export default PaymentComponent;
