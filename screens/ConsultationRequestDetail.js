import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  I18nManager,
} from "react-native";
import { FontAwesome, FontAwesome5, AntDesign } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ConsultationRequestDetail = ({ route }) => {
  const { requestId } = route.params;
  const [patient, setPatient] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // Use i18n for translations

  const fetchPatientData = async () => {
    try {
      const docRef = doc(db, "ConsultationRequest", requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPatient(docSnap.data());
      } else {
        console.log("No such document!");
      }

      const meetingRef = doc(db, "appointments", requestId);
      const meetingSnap = await getDoc(meetingRef);

      if (meetingSnap.exists()) {
        setMeetingDetails(meetingSnap.data());
      } else {
        console.log("No meeting details found!");
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [requestId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPatientData();
    }, [requestId])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("noPatientData")}</Text>
      </View>
    );
  }

  const handleJoinMeeting = async () => {
    if (meetingDetails && meetingDetails.meetingURL) {
      await WebBrowser.openBrowserAsync(meetingDetails.meetingURL);
    } else {
      Alert.alert(t("Error"), t("meetingURLError"));
    }
  };
  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.toDate());
      return date.toLocaleString(); // Customize this format as needed
    }
    return t("dateInvalid"); // Default message for invalid dates
  };
  // Determine if the current language is RTL
  const isRTL = i18n.dir() === "rtl";

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          styles.goBackButton,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"} // Adjust icon for RTL
          size={30}
          color="#2E6FF3"
        />
        <Text style={styles.goBackText}>{t("goBack")}</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t("consultationDetails")}</Text>
      </View>
      <Image
        source={require("../assets/images/profile.png")}
        style={styles.patientImage}
      />
      <View style={styles.card}>
        {patient.uid && (
          <View
            style={[
              styles.infoRowID,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="id-card" size={18} color="#333" />
            <Text style={styles.cardNumber}>
              {t("patientID")}: {patient.uid}
            </Text>
          </View>
        )}
        {(patient.firstname || patient.lastname) && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="user" size={20} color="#333" />
            <Text style={styles.patientName}>
              {t("patientName")}: {patient.firstname} {patient.lastname}
            </Text>
          </View>
        )}
        {patient.Country && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="flag" size={20} color="#333" />
            <Text style={styles.birthInfo}>
              {t("country")}: {patient.Country}
            </Text>
          </View>
        )}
        {patient.birthDay && patient.birthMonth && patient.birthYear && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="birthday-cake" size={20} color="#333" />
            <Text style={styles.birthInfo}>
              {t("dateOfBirth")}: {patient.birthDay}/{patient.birthMonth}/
              {patient.birthYear}
            </Text>
          </View>
        )}
        {patient.birthHour && patient.birthMinute && patient.birthSecond && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="clock-o" size={20} color="#333" />
            <Text style={styles.birthInfo}>
              {t("timeOfBirth")}: {patient.birthHour}:{patient.birthMinute}:
              {patient.birthSecond}
            </Text>
          </View>
        )}
        {patient.birthPlace && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="map" size={20} color="#333" />
            <Text style={styles.birthInfo}>
              {t("birthPlace")}: {patient.birthPlace}
            </Text>
          </View>
        )}
        {patient.Description && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="align-left" size={25} color="#333" />
            <Text style={styles.birthInfo}>
              {t("problem")}: {patient.Description}
            </Text>
          </View>
        )}
        {patient.Creation_AT && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="calendar" size={20} color="#333" />
            <Text style={styles.birthInfo}>
              {t("createdAt")}: {formatDate(patient.Creation_AT)}
            </Text>
          </View>
        )}
        {patient.images && patient.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text
              style={[
                styles.imagesTitle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("attachedImages")}:
            </Text>
            <ScrollView horizontal>
              {patient.images.map((imageUri, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(imageUri);
                    setModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.attachedImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.videoCallButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() =>
            navigation.navigate("ChatScreen", {
              requestId: requestId,
              userId: patient.uid,
            })
          }
        >
          <FontAwesome name="comments" size={20} color="#fff" />
          <Text style={styles.videoCallButtonText}>{t("startChat")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.videoCallButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() =>
            navigation.navigate("EditConsultation", {
              requestId: requestId,
              userId: patient.uid,
            })
          }
        >
          <FontAwesome name="edit" size={20} color="#fff" />
          <Text style={styles.videoCallButtonText}>
            {t("editConsultationRequest")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.videoCallButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() =>
            navigation.navigate("AdminSchedule", { requestId: requestId })
          }
        >
          <FontAwesome name="calendar" size={20} color="#fff" />
          <Text style={styles.videoCallButtonText}>{t("makeAppointment")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.videoCallButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            meetingDetails && meetingDetails.meetingURL
              ? styles.joinButton
              : styles.disabledButton,
          ]}
          onPress={
            meetingDetails && meetingDetails.meetingURL
              ? handleJoinMeeting
              : null
          }
          disabled={!meetingDetails || !meetingDetails.meetingURL}
        >
          <FontAwesome name="video-camera" size={20} color="#fff" />
          <Text style={styles.videoCallButtonText}>{t("joinZoomMeeting")}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>{t("close")}</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    marginLeft: I18nManager.isRTL ? 0 : 10, // Adjust for RTL
    marginRight: I18nManager.isRTL ? 10 : 0, // Adjust for RTL
  },
  goBackText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: "#2E6FF3",
    marginLeft: I18nManager.isRTL ? 0 : 10, // Adjust for RTL
    marginRight: I18nManager.isRTL ? 10 : 0, // Adjust for RTL
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  headerText: {
    fontSize: 30,
    fontFamily: "Montserrat-Bold",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  patientImage: {
    width: 100,
    height: 100,
    borderRadius: 80,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  infoRowID: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 5,
  },
  cardNumber: {
    fontSize: 14,
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
    fontFamily: "Montserrat-Bold",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  patientName: {
    fontSize: 18,
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
    fontFamily: "Montserrat-Regular",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  birthInfo: {
    fontSize: 16,
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
    fontFamily: "Montserrat-Regular",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  imagesContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    fontFamily: "Montserrat-Regular",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  imagesScroll: {
    flexDirection: "row",
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 5,
  },
  videoCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E6FF3",
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    marginBottom: 10,
  },
  joinButton: {
    backgroundColor: "#28a745",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  videoCallButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "#2E6FF3",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ConsultationRequestDetail;
