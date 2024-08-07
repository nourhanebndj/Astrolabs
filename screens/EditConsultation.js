import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator, 
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";


const EditConsultation = ({ route }) => {
  const { requestId, userId } = route.params;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();


  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const docRef = doc(db, "ConsultationRequest", requestId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [requestId]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "ConsultationRequest", requestId);
      await updateDoc(docRef, patient);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleInputChange = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
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

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No patient data found</Text>
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
        ]}      >
 <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"}
          size={30}
          color="#2E6FF3"
        />    
      <Text style={[
            styles.goBackText,
            { marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 },
          ]}>        
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
            {t("country")}: {patient.Country}
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
          value={patient.firstname}
          onChangeText={(text) => handleInputChange("firstname", text)}
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
          value={patient.lastname}
          onChangeText={(text) => handleInputChange("lastname", text)}
        />

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="birthday-cake" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("dateOfBirth")}
          </Text>
        </View>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Day"
            keyboardType="numeric"
            value={patient.birthDay}
            onChangeText={(text) => handleInputChange("birthDay", text)}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Month"
            keyboardType="numeric"
            value={patient.birthMonth}
            onChangeText={(text) => handleInputChange("birthMonth", text)}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Year"
            keyboardType="numeric"
            value={patient.birthYear}
            onChangeText={(text) => handleInputChange("birthYear", text)}
          />
        </View>

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FontAwesome name="clock-o" size={20} color="#333" />
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("timeOfBirth")}
          </Text>
        </View>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Hour"
            keyboardType="numeric"
            value={patient.birthHour}
            onChangeText={(text) => handleInputChange("birthHour", text)}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Minute"
            keyboardType="numeric"
            value={patient.birthMinute}
            onChangeText={(text) => handleInputChange("birthMinute", text)}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Second"
            keyboardType="numeric"
            value={patient.birthSecond}
            onChangeText={(text) => handleInputChange("birthSecond", text)}
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
          value={patient.birthPlace}
          onChangeText={(text) => handleInputChange("birthPlace", text)}
        />

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <FontAwesome name="align-left" size={20} color="#333" />
        <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("problem")}
        </Text>
        </View>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder= {t("problem")}
          value={patient.Description}
          onChangeText={(text) => handleInputChange("Description", text)}
          multiline
        />

        {patient.images && patient.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.imagesTitle}>Attached Images:</Text>
            <ScrollView horizontal>
              {patient.images.map((imageUri, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={styles.attachedImage}
                />
              ))}
            </ScrollView>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Ensure the background matches the app theme
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    color: "#ff0000",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoRowID: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
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
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Montserrat-Bold",
    color: "#2E6FF3",
  },
  infoRowCountry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  dateInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "30%",
    textAlign: "center",
  },
  imagesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  imagesTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
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
});

export default EditConsultation;
