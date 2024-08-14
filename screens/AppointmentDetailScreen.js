import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const AppointmentDetailScreen = ({ route }) => {
  const { requestId, collectionName } = route.params;
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // Check if the current language direction is RTL
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const docRef = doc(db, collectionName, requestId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequestDetails(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, collectionName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  if (!requestDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("noRequestDetailsFound")}</Text>
      </View>
    );
  }

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
          name={isRTL ? "arrowright" : "arrowleft"} // Adjust icon based on RTL
          size={30}
          color="#2E6FF3"
        />
        <Text style={styles.goBackText}>{t("goBack")}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerText}>{t("requestDetails")}</Text>
      </View>
      <Image
        source={require("../assets/images/profile.png")}
        style={styles.requestImage}
      />
      <View style={styles.card}>
        {requestDetails.firstname && requestDetails.lastname && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="user" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("person")} 1: {requestDetails.firstname}{" "}
              {requestDetails.lastname}
            </Text>
          </View>
        )}

        {requestDetails.Country && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="flag" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("country")}: {requestDetails.Country}
            </Text>
          </View>
        )}
        {requestDetails.birthDay &&
          requestDetails.birthMonth &&
          requestDetails.birthYear && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="birthday-cake" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("dateOfBirth")}: {requestDetails.birthDay}/
                {requestDetails.birthMonth}/{requestDetails.birthYear}
              </Text>
            </View>
          )}
        {requestDetails.birthHour &&
          requestDetails.birthMinute &&
          requestDetails.birthSecond && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="clock-o" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("timeOfBirth")}: {requestDetails.birthHour}:
                {requestDetails.birthMinute}:{requestDetails.birthSecond}
              </Text>
            </View>
          )}
        {requestDetails.birthPlace && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="map" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("birthPlace")}: {requestDetails.birthPlace}
            </Text>
          </View>
        )}
        {requestDetails.Title && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="file-text" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("title")}: {requestDetails.Title}
            </Text>
          </View>
        )}
        {requestDetails.Description && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="align-left" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("description")}: {requestDetails.Description}
            </Text>
          </View>
        )}
        {requestDetails.Creation_AT && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="calendar" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("creationDate")}:{" "}
              {requestDetails.Creation_AT.toDate
                ? new Date(requestDetails.Creation_AT.toDate()).toLocaleString()
                : new Date(requestDetails.Creation_AT).toLocaleString()}
            </Text>
          </View>
        )}
        {/* Person 1 Details */}
        {requestDetails.firstName1 && requestDetails.lastName1 && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="user" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("person")} 1: {requestDetails.firstName1}{" "}
              {requestDetails.lastName1}
            </Text>
          </View>
        )}
        {requestDetails.birth1birthDay &&
          requestDetails.birth1birthMonth &&
          requestDetails.birth1birthYear && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="birthday-cake" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthDatePerson1")}: {requestDetails.birth1birthDay}/
                {requestDetails.birth1birthMonth}/
                {requestDetails.birth1birthYear}
              </Text>
            </View>
          )}
        {requestDetails.birth1birthHour &&
          requestDetails.birth1birthMinute &&
          requestDetails.birth1birthSecond && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="clock-o" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthTimePerson1")}: {requestDetails.birth1birthHour}:
                {requestDetails.birth1birthMinute}:
                {requestDetails.birth1birthSecond}
              </Text>
            </View>
          )}

        {requestDetails.birthbirthDay &&
          requestDetails.birthbirthMonth &&
          requestDetails.birthbirthYear && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="birthday-cake" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthDatePerson1")}: {requestDetails.birthbirthDay}/
                {requestDetails.birthbirthMonth}/{requestDetails.birthbirthYear}
              </Text>
            </View>
          )}
        {requestDetails.birthbirthHour &&
          requestDetails.birthbirthMinute &&
          requestDetails.birthbirthSecond && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="clock-o" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthTimePerson1")}: {requestDetails.birthbirthHour}:
                {requestDetails.birthbirthMinute}:
                {requestDetails.birthbirthSecond}
              </Text>
            </View>
          )}
        {requestDetails.birthPlace1 && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="map-marker" size={20} color="#333" />
            <Text style={styles.infoText}>
              Birth Place (Person 1): {requestDetails.birthPlace1}
            </Text>
          </View>
        )}

        {/* Person 2 Details */}
        {requestDetails.firstName2 && requestDetails.lastName2 && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="user" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("person2")}: {requestDetails.firstName2}{" "}
              {requestDetails.lastName2}
            </Text>
          </View>
        )}
        {requestDetails.birth2birthDay &&
          requestDetails.birth2birthMonth &&
          requestDetails.birth2birthYear && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="birthday-cake" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthDatePerson2")}: {requestDetails.birth2birthDay}/
                {requestDetails.birth2birthMonth}/
                {requestDetails.birth2birthYear}
              </Text>
            </View>
          )}
        {requestDetails.birth2birthHour &&
          requestDetails.birth2birthMinute &&
          requestDetails.birth2birthSecond && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="clock-o" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("birthTimePerson2")}: {requestDetails.birth2birthHour}:
                {requestDetails.birth2birthMinute}:
                {requestDetails.birth2birthSecond}
              </Text>
            </View>
          )}
        {requestDetails.birthPlace2 && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="map-marker" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("birthPlacePerson2")}: {requestDetails.birthPlace2}
            </Text>
          </View>
        )}

        {requestDetails.selectedCountry && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="flag" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("country")}: {requestDetails.selectedCountry}
            </Text>
          </View>
        )}
        {requestDetails.selectedAnalysisType && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="flask" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("typeOfAnalysis")}: {requestDetails.selectedAnalysisType}
            </Text>
          </View>
        )}
        {requestDetails.selectedAdditionalOptions &&
          requestDetails.selectedAdditionalOptions.length > 0 && (
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="flask" size={20} color="#333" />
              <Text style={styles.infoText}>
                {t("supplementServices")}:{" "}
                {requestDetails.selectedAdditionalOptions.join(", ")}
              </Text>
            </View>
          )}

        {requestDetails.selectedCompatibilityType && (
          <View
            style={[
              styles.infoRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <FontAwesome name="users" size={20} color="#333" />
            <Text style={styles.infoText}>
              {t("typeOfCompatibility")}:{" "}
              {requestDetails.selectedCompatibilityType}
            </Text>
          </View>
        )}
        {requestDetails.images && requestDetails.images.length > 0 && (
          <View>
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <FontAwesome name="image" size={20} color="#333" />
              <Text style={styles.infoText}>{t("attachedImages")}:</Text>
            </View>
            <ScrollView horizontal={true} style={styles.imageRow}>
              {requestDetails.images.map((imageUri, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={styles.attachedImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("UserSchedule", { requestId })}
        >
          <Text style={styles.buttonText}>{t("viewMeetingDetails")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
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
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  goBackText: {
    color: "#2E6FF3",
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  requestImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    flexWrap: "wrap",
  },
  button: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageRow: {
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 10,
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
});

export default AppointmentDetailScreen;
