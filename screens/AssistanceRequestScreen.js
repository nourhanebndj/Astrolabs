import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DateTimePicker from "../Component/DateTimePicker";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const AssistanceRequestScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const countries = [
    { code: "", name: t("chooseCountry"), flag: "🌍" },
    { code: "DZ", name: t("Algeria"), flag: "🇩🇿" },
    { code: "LY", name: t("Libya"), flag: "🇱🇾" },
    { code: "SA", name: t("SaudiArabia"), flag: "🇸🇦" },
    { code: "AE", name: t("UnitedArabEmirates"), flag: "🇦🇪" }, // الامارات
    { code: "TN", name: t("Tunisia"), flag: "🇹🇳" }, // تونس
    { code: "MA", name: t("Morocco"), flag: "🇲🇦" }, // مغرب
    { code: "QA", name: t("Qatar"), flag: "🇶🇦" }, // قطر
    { code: "BH", name: t("Bahrain"), flag: "🇧🇭" }, // بحرين
    { code: "IQ", name: t("Iraq"), flag: "🇮🇶" }, // عراق
    { code: "SY", name: t("Syria"), flag: "🇸🇾" }, // سوريا
    { code: "JO", name: t("Jordan"), flag: "🇯🇴" }, // الاردن
    { code: "EG", name: t("Egypt"), flag: "🇪🇬" }, // مصر
    { code: "UK", name: t("UnitedKingdom"), flag: "🇬🇧" }, // Uk
    { code: "EU", name: t("EuroZone"), flag: "🇪🇺" }, // Euro zone
    { code: "US", name: t("UnitedStatesAndCanada"), flag: "🇺🇸" }, // Us & Canada
  ];
  

  const [requestTitle, setRequestTitle] = useState("");
  const [requestText, setRequestText] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    birthHour: "",
    birthMinute: "",
    birthSecond: "",
    birthPlace: "",
  });

  const handleInputChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const uploadImages = async () => {
    const uploadedImageUrls = [];
    for (const imageUri of images) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileRef = ref(
        storage,
        `assistance-requests/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`
      );
      await uploadBytes(fileRef, blob);
      const downloadUrl = await getDownloadURL(fileRef);
      uploadedImageUrls.push(downloadUrl);
    }
    return uploadedImageUrls;
  };

  const submitRequest = async () => {
    if (
      !requestTitle ||
      !requestText ||
      !firstname ||
      !lastname ||
      !selectedCountry ||
      !formData.birthPlace
    ) {
      Toast.show({
        type: "error",
        text1: t("missingFields"),
        text2: t("pleaseFillAllFields"),
      });
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      const uploadedImageUrls = await uploadImages();

      const dataToSave = {
        Title: requestTitle,
        Description: requestText,
        firstname: firstname,
        lastname: lastname,
        Country: selectedCountry,
        uid: uid,
        Creation_AT: new Date(),
        images: uploadedImageUrls,
        birthDay: formData.birthDay,
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
        birthHour: formData.birthHour,
        birthMinute: formData.birthMinute,
        birthSecond: formData.birthSecond,
        birthPlace: formData.birthPlace,
      };

      const docRef = await addDoc(collection(db, "AssistanceRequest"), dataToSave);

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("requestAddedSuccessfully"),
        onPress: () => navigation.navigate("Home"),
      });

      setRequestTitle("");
      setRequestText("");
      setFirstname("");
      setLastname("");
      setSelectedCountry("");
      setImages([]);
      setFormData({
        birthDay: "",
        birthMonth: "",
        birthYear: "",
        birthHour: "",
        birthMinute: "",
        birthSecond: "",
        birthPlace: "",
      });
    } catch (error) {
      console.error("Failed to add request:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failedToAddRequest"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign
              name="arrowleft"
              size={30}
              color="#2E6FF3"
              style={{ marginTop: 30 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("assistance")}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("firstName")}
            value={firstname}
            onChangeText={setFirstname}
          />
          <TextInput
            style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("lastName")}
            value={lastname}
            onChangeText={setLastname}
          />

          <Picker
            selectedValue={selectedCountry}
            onValueChange={(itemValue) => {
              setSelectedCountry(itemValue);
            }}
            style={[styles.picker, { textAlign: isRTL ? "right" : "left" }]}
          >
            {countries.map((country) => (
              <Picker.Item
                key={country.code}
                label={t(country.name)}
                value={country.code}
              />
            ))}
          </Picker>

          <TextInput
            style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("titleOfAssistance")}
            value={requestTitle}
            onChangeText={setRequestTitle}
          />
          <TextInput
            style={[styles.input, styles.textInput, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("description")}
            value={requestText}
            onChangeText={setRequestText}
            multiline
          />

          <DateTimePicker
            onChange={handleInputChange}
            initialValues={formData}
          />

          <TextInput
            style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("birthPlace")}
            value={formData.birthPlace}
            onChangeText={(value) => handleInputChange("birthPlace", value)}
          />

          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("selectImages")}</Text>
          <View style={[styles.imageInputContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity onPress={pickImages} style={styles.iconButton}>
              <FontAwesome name="plus-circle" size={30} color="gray" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal contentContainerStyle={isRTL ? styles.rtlImages : styles.ltrImages}>
            {images.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={styles.imagePreview}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={submitRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.submitButtonText, { textAlign: isRTL ? "right" : "left" }]}>
                {t("submit")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
  },
  headerTitle: {
    marginLeft: 10,
    marginTop: 30,
    fontSize: 18,
    color: "#2E6FF3",
    fontFamily: "Montserrat-Bold",
  },
  scrollContainer: {
    padding: 16,
  },
  picker: {
    marginVertical: 8,
    backgroundColor: "#F8F8F8",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontFamily: "Montserrat-Regular",
  },
  textInput: {
    height: 100,
    fontFamily: "Montserrat-Regular",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  imageInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 25,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#2E6FF3",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
  },
  rtlImages: {
    flexDirection: "row-reverse",
  },
  ltrImages: {
    flexDirection: "row",
  },
});

export default AssistanceRequestScreen;
