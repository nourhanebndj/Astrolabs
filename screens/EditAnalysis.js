import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const EditAnalysis = ({ route }) => {
  const { requestId, patientData } = route.params;
  const [patient, setPatient] = useState(patientData);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "Analysisrequest", requestId);
      await updateDoc(docRef, patient);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
  };

  const updateBirthDetails = (field, value) => {
    if (patient[`birth1${field}`]) {
      handleInputChange(`birth1${field}`, value);
    } else {
      handleInputChange(`birth${field}`, value);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  // Determine if the current language is RTL
  const isRTL = i18n.dir() === "rtl";

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.goBackButton,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
        onPress={() => navigation.goBack()}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"}
          size={30}
          color="#2E6FF3"
        />
        <Text
          style={[
            styles.goBackText,
            { marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 },
          ]}
        >
          {t("goBack")}
        </Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <View style={[styles.infoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="id-card" size={20} color="#333" />
          <Text style={[styles.cardNumber, { textAlign: isRTL ? "right" : "left" }]}>
            {t("patientID")}: {patient.uid}
          </Text>
        </View>
        <View style={[styles.infoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="flag" size={20} color="#2e6ff3" />
          <Text style={[styles.birthInfo, { textAlign: isRTL ? "right" : "left" }]}>
            {t("country")}: {patient.selectedCountry}
          </Text>
        </View>

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="user" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("firstName")}
          </Text>
        </View>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("firstName")}
          value={patient.firstName1}
          onChangeText={(text) => handleInputChange("firstName1", text)}
        />
        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="user" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("lastName")}
          </Text>
        </View>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("lastName")}
          value={patient.lastName1}
          onChangeText={(text) => handleInputChange("lastName1", text)}
        />

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="birthday-cake" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("dateOfBirth")}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <TextInput
            style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("day")}
            value={patient.birth1birthDay || patient.birthbirthDay}
            onChangeText={(text) => updateBirthDetails("birthDay", text)}
          />
          <TextInput
            style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("month")}
            value={patient.birth1birthMonth || patient.birthbirthMonth}
            onChangeText={(text) => updateBirthDetails("birthMonth", text)}
          />
          <TextInput
            style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("year")}
            value={patient.birth1birthYear || patient.birthbirthYear}
            onChangeText={(text) => updateBirthDetails("birthYear", text)}
          />
        </View>

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="clock-o" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("timeOfBirth")}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <TextInput
            style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("hour")}
            value={patient.birth1birthHour || patient.birthbirthHour}
            onChangeText={(text) => updateBirthDetails("birthHour", text)}
          />
          <TextInput
            style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("minute")}
            value={patient.birth1birthMinute || patient.birthbirthMinute}
            onChangeText={(text) => updateBirthDetails("birthMinute", text)}
          />
          <TextInput
            style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("second")}
            value={patient.birth1birthSecond || patient.birthbirthSecond}
            onChangeText={(text) => updateBirthDetails("birthSecond", text)}
          />
        </View>

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="map-marker" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("birthPlace")}
          </Text>
        </View>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("birthPlace")}
          value={patient.birthPlace1}
          onChangeText={(text) => handleInputChange("birthPlace1", text)}
        />

        {patient.firstName2 && (
          <>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t("person2")}
            </Text>
            <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <FontAwesome name="user" size={20} color="#333" />
              <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
                {t("firstName")}
              </Text>
            </View>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
              placeholder={t("firstName")}
              value={patient.firstName2}
              onChangeText={(text) => handleInputChange("firstName2", text)}
            />
            <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <FontAwesome name="user" size={20} color="#333" />
              <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
                {t("lastName")}
              </Text>
            </View>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
              placeholder={t("lastName")}
              value={patient.lastName2}
              onChangeText={(text) => handleInputChange("lastName2", text)}
            />
            <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <FontAwesome name="birthday-cake" size={20} color="#333" />
              <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
                {t("dateOfBirth")}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("day")}
                value={patient.birth2birthDay}
                onChangeText={(text) =>
                  handleInputChange("birth2birthDay", text)
                }
              />
              <TextInput
                style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("month")}
                value={patient.birth2birthMonth}
                onChangeText={(text) =>
                  handleInputChange("birth2birthMonth", text)
                }
              />
              <TextInput
                style={[styles.inputDate, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("year")}
                value={patient.birth2birthYear}
                onChangeText={(text) =>
                  handleInputChange("birth2birthYear", text)
                }
              />
            </View>
            <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <FontAwesome name="clock-o" size={20} color="#333" />
              <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
                {t("timeOfBirth")}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("hour")}
                value={patient.birth2birthHour}
                onChangeText={(text) =>
                  handleInputChange("birth2birthHour", text)
                }
              />
              <TextInput
                style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("minute")}
                value={patient.birth2birthMinute}
                onChangeText={(text) =>
                  handleInputChange("birth2birthMinute", text)
                }
              />
              <TextInput
                style={[styles.inputTime, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("second")}
                value={patient.birth2birthSecond}
                onChangeText={(text) =>
                  handleInputChange("birth2birthSecond", text)
                }
              />
            </View>
            <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <FontAwesome name="map-marker" size={20} color="#333" />
              <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
                {t("birthPlace")}
              </Text>
            </View>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
              placeholder={t("birthPlace")}
              value={patient.birthPlace2}
              onChangeText={(text) => handleInputChange("birthPlace2", text)}
            />
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  goBackText: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
    color: "#2E6FF3",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 14,
    marginLeft: 10,
    fontFamily: "Montserrat-Regular",
  },
  birthInfo: {
    fontSize: 20,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
    color: "#2e6ff3",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Montserrat-Regular",
  },
  inputDate: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "30%",
  },
  inputTime: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "30%",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#2E6FF3",
    borderRadius: 10,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
  },
});

export default EditAnalysis;
