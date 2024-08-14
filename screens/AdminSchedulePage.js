import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const AdminSchedulePage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params || {};

  const [meetingID, setMeetingID] = useState("");
  const [meetingURL, setMeetingURL] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();

  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    if (requestId) {
      fetchMeetingDetails();
    } else {
      Alert.alert(t("error"), t("requestIDMissing"));
      navigation.goBack();
    }
  }, [requestId]);

  const fetchMeetingDetails = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "appointments", requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setMeetingID(data.meetingID || "");
        setMeetingURL(data.meetingURL || "");
        setStartTime(data.startTime || "");
        setDuration(data.duration ? data.duration.toString() : "");
      } else {
        console.log("No existing meeting details found!");
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Alert.alert(t("error"), `${t("fetchMeetingDetailsFailed")}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenZoom = async () => {
    await WebBrowser.openBrowserAsync("https://zoom.us/meeting/schedule");
  };

  const handleSaveMeetingDetails = async () => {
    if (!requestId) {
      Alert.alert(t("error"), t("requestIDMissing"));
      return;
    }
    try {
      await setDoc(doc(db, "appointments", requestId), {
        meetingID,
        meetingURL,
        startTime,
        duration: parseInt(duration),
        requestId,
      });

      await setDoc(
        doc(db, "chatsession", requestId),
        {
          lastMeetingID: meetingID,
          lastMeetingURL: meetingURL,
          lastMeetingStartTime: startTime,
          lastMeetingDuration: parseInt(duration),
        },
        { merge: true }
      );

      Alert.alert(t("success"), t("meetingDetailsSaved"));
    } catch (error) {
      console.error("Error saving meeting details:", error);
      Alert.alert(t("error"), `${t("failedToSaveMeetingDetails")}: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          styles.goBackButton,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"}
          size={30}
          color="#2E6FF3"
        />
        <Text style={[styles.goBackText, { textAlign: isRTL ? "right" : "left" }]}>{t("goBack")}</Text>
      </TouchableOpacity>
      <Text style={[styles.header, { textAlign: "center" }]}>{t("scheduleZoomMeeting")}</Text>
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("meetingID")}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
        value={meetingID}
        onChangeText={setMeetingID}
        placeholder={t("enterMeetingID")}
        placeholderTextColor="#999"
      />
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("meetingURL")}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
        value={meetingURL}
        onChangeText={setMeetingURL}
        placeholder={t("enterMeetingURL")}
        placeholderTextColor="#999"
      />
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("startTime")}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
        value={startTime}
        onChangeText={setStartTime}
        placeholder={t("enterStartTime")}
        placeholderTextColor="#999"
      />
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("durationMinutes")}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder={t("enterDuration")}
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.button} onPress={handleOpenZoom}>
        <Text style={styles.buttonText}>{t("openZoom")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={handleSaveMeetingDetails}
      >
        <Text style={styles.buttonText}>{t("saveMeetingDetails")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  goBackText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginLeft: 10,
    marginRight: 0,
    color: "#2E6FF3",
  },
  header: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 30,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontFamily: "Montserrat-Bold",
  },
  button: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default AdminSchedulePage;
