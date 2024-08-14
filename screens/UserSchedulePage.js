import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const UserSchedulePage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params || {};
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Determine if the current language is RTL

  const [meetingDetails, setMeetingDetails] = useState(null);

  useEffect(() => {
    if (requestId) {
      fetchMeetingDetails();
    } else {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("missingRequestId"),
      });
      navigation.goBack();
    }
  }, [requestId]);

  const fetchMeetingDetails = async () => {
    try {
      const docRef = doc(db, "appointments", requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMeetingDetails(docSnap.data());
      } else {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("noDetailsFound"),
        });
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: `${t("fetchError")}: ${error.message}`,
      });
    }
  };

  const handleJoinMeeting = async () => {
    if (meetingDetails && meetingDetails.meetingURL) {
      await WebBrowser.openBrowserAsync(meetingDetails.meetingURL);
    } else {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("invalidMeetingUrl"),
      });
    }
  };

  return (
    <View style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View>
        <TouchableOpacity
          style={[
            styles.goBackButton,
            { flexDirection: isRTL ? "row-reverse" : "row" }
          ]}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={30} color="#2E6FF3" />
          <Text
            style={[
              styles.goBackText,
              { marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }
            ]}
          >
            {t("goBack")}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>{t("meetingDetails")}</Text>
      {meetingDetails ? (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t("meetingId")}: </Text>
            <Text style={styles.value}>{meetingDetails.meetingID}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t("startTime")}: </Text>
            <Text style={styles.value}>{meetingDetails.startTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t("duration")}: </Text>
            <Text style={styles.value}>{meetingDetails.duration} {t("minutes")}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleJoinMeeting}>
            <Text style={styles.buttonText}>{t("joinMeeting")}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.loadingText}>{t("loadingDetails")}</Text>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    marginTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  button: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  goBackText: {
    color: "#2E6FF3",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
});

export default UserSchedulePage;
