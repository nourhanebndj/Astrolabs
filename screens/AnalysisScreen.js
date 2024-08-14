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
} from "react-native";
import { FontAwesome, Ionicons, AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../firebase";
import { collection, addDoc, updateDoc, getDocs } from "firebase/firestore";
import PaymentComponent from "../Component/PaymentComponent";
import DateTimePickerAnalysis from "../Component/DateTimePickerAnalysis";
import Toast from "react-native-toast-message";
import CheckBox from "react-native-check-box";
import { useTranslation } from "react-i18next";

const AnalysisScreen = ({ navigation }) => {
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
  

  const analysisTypes = [
    { id: "", name: t("chooseAnalysisType") },
    { id: "personal", name: t("personal") },
    { id: "compatibility", name: t("compatibility") },
  ];

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("");
  const [selectedAdditionalOptions, setSelectedAdditionalOptions] = useState([]);
  const [payment, setPayment] = useState("");
  const [selectedCompatibilityType, setSelectedCompatibilityType] = useState("");
  const [formData, setFormData] = useState({
    firstName1: "",
    lastName1: "",
    birthPlace1: "",
    firstName2: "",
    lastName2: "",
    birthPlace2: "",
  });
  const [formValid, setFormValid] = useState(false);
  const [images, setImages] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [supplementServices, setSupplementServices] = useState([]);

  useEffect(() => {
    validateForm();
  }, [
    formData,
    selectedCountry,
    selectedAnalysisType,
    selectedCompatibilityType,
    selectedAdditionalOptions,
  ]);

  useEffect(() => {
    fetchSupplementServices();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedAnalysisType, selectedAdditionalOptions]);

  const fetchSupplementServices = async () => {
    try {
      const servicesCollection = collection(
        db,
        "Services",
        "6vdePubVH2mJbu6XmoiL",
        "Supplement_Services(Personnel)"
      );
      const serviceDocs = await getDocs(servicesCollection);
      const services = serviceDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSupplementServices(services);
    } catch (error) {
      console.error("Error fetching supplement services:", error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateTimeChange = (field, value, prefix) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [`${prefix}${field}`]: value,
    }));
  };

  const validateForm = () => {
    if (selectedCountry && selectedAnalysisType) {
      if (selectedAnalysisType === "personal") {
        setFormValid(
          formData.firstName1 && formData.lastName1 && formData.birthPlace1
        );
      } else if (selectedAnalysisType === "compatibility") {
        setFormValid(
          formData.firstName1 &&
            formData.lastName1 &&
            formData.birthPlace1 &&
            formData.firstName2 &&
            formData.lastName2 &&
            formData.birthPlace2
        );
      }
    } else {
      setFormValid(false);
    }
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

  const handleAdditionalOptionToggle = (optionId) => {
    setSelectedAdditionalOptions((prevOptions) =>
      prevOptions.includes(optionId)
        ? prevOptions.filter((id) => id !== optionId)
        : [...prevOptions, optionId]
    );
  };

  const calculateTotalPrice = () => {
    let basePrice = 0;
    if (selectedAnalysisType === "personal" || selectedAnalysisType === "compatibility") {
      basePrice = 20;
    }
    const total = selectedAdditionalOptions.length > 0
      ? selectedAdditionalOptions.reduce((sum, optionId) => {
          const option = supplementServices.find((opt) => opt.id === optionId);
          return sum + (option ? option.price : 0);
        }, 0)
      : basePrice;
    setTotalPrice(total);
  };

  const handleSubmit = async () => {
    const confirmBirthTime = () => {
      return new Promise((resolve) => {
        Toast.show({
          type: "info",
          text1: t("confirmBirthTime"),
          text2: t("sureAboutBirthTime"),
          visibilityTime: 3000,
          onShow: () => {
            resolve(true);
          },
        });
      });
    };

    const isSure = await confirmBirthTime();
    if (!isSure) {
      Toast.show({
        type: "error",
        text1: t("verificationNeeded"),
        text2: t("pleaseVerifyBirthTime"),
      });
      return;
    }

    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      // Map selected option IDs to their names
      const selectedOptionNames = selectedAdditionalOptions.map((optionId) => {
        const option = supplementServices.find((opt) => opt.id === optionId);
        return option ? (isRTL ? option.name.ar : option.name.en) : "";
      });

      const dataToSave = {
        ...formData,
        selectedCountry,
        selectedAnalysisType,
        selectedCompatibilityType,
        selectedAdditionalOptions: selectedOptionNames,
        uid,
        createdAt: new Date().toISOString(),
        images,
        totalPrice,
      };
      const docRef = await addDoc(
        collection(db, "Analysisrequest"),
        dataToSave
      );

      // Update the document to include the requestId
      await updateDoc(docRef, {
        requestId: docRef.id,
      });

      console.log("Document written with ID: ", docRef.id);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("dataSubmittedSuccessfully"),
        onPress: () => navigation.navigate("Appointment"),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      Toast.show({
        type: "error",
        text1: t("submissionFailed"),
        text2: t("failedToSubmitData"),
      });
    }
  };

  const handleInfoClick = (option) => {
    const description = option.description || { ar: "لم يتم العثور على وصف", en: "No Description Found" };
    const descriptionText = isRTL ? description.ar : description.en;
    Alert.alert(t("info"), descriptionText);
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
          <Text style={styles.headerTitle}>{t("analysis")}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Country Picker */}
          <Picker
            selectedValue={selectedCountry}
            onValueChange={(itemValue) => {
              setSelectedCountry(itemValue);
              validateForm();
            }}
            style={[styles.picker, { textAlign: isRTL ? "right" : "left" }]}
          >
            {countries.map((country) => (
              <Picker.Item
                key={country.code}
                label={country.name}
                value={country.code}
              />
            ))}
          </Picker>

          {/* Analysis Type Picker */}
          <Picker
            selectedValue={selectedAnalysisType}
            onValueChange={(itemValue) => {
              setSelectedAnalysisType(itemValue);
              validateForm();
            }}
            style={[styles.picker, { textAlign: isRTL ? "right" : "left" }]}
          >
            {analysisTypes.map((type) => (
              <Picker.Item key={type.id} label={type.name} value={type.id} />
            ))}
          </Picker>

          {/* Display Form based on Analysis Type */}
          {selectedAnalysisType === "personal" && (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("firstName")}
                value={formData.firstName1}
                onChangeText={(text) => handleInputChange("firstName1", text)}
              />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("lastName")}
                value={formData.lastName1}
                onChangeText={(text) => handleInputChange("lastName1", text)}
              />

              <DateTimePickerAnalysis
                onChange={(field, value) =>
                  handleDateTimeChange(field, value, "birth")
                }
                initialValues={{
                  birthDay: formData.birthDay1,
                  birthMonth: formData.birthMonth1,
                  birthYear: formData.birthYear1,
                  birthHour: formData.birthHour1,
                  birthMinute: formData.birthMinute1,
                  birthSecond: formData.birthSecond1,
                }}
              />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("placeOfBirth")}
                value={formData.birthPlace1}
                onChangeText={(text) => handleInputChange("birthPlace1", text)}
              />
              <View style={styles.additionalOptionsContainer}>
                <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("supplementService")}</Text>
                {supplementServices.map((option) => (
                  <View key={option.id} style={[styles.checkboxContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <CheckBox
                      isChecked={selectedAdditionalOptions.includes(option.id)}
                      onClick={() => handleAdditionalOptionToggle(option.id)}
                    />
                    <Text
                      style={[
                        styles.checkboxLabel,
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {isRTL ? option.name.ar : option.name.en}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleInfoClick(option)}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="gray"
                        style={{
                          marginLeft: isRTL ? 0 : 10,
                          marginRight: isRTL ? 10 : 0,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedAnalysisType === "compatibility" && (
            <View style={styles.form}>
              <View style={styles.compatibilityButtons}>
                <TouchableOpacity
                  style={[
                    styles.compatibilityButton,
                    selectedCompatibilityType === "acquaintance" &&
                      styles.selectedButton,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                  onPress={() => setSelectedCompatibilityType("acquaintance")}
                >
                  <Text
                    style={[
                      styles.compatibilityButtonText,
                      selectedCompatibilityType === "acquaintance" &&
                        styles.selectedButtonText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {t("acquaintance")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.compatibilityButton,
                    selectedCompatibilityType === "marriage" &&
                      styles.selectedButton,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                  onPress={() => setSelectedCompatibilityType("marriage")}
                >
                  <Text
                    style={[
                      styles.compatibilityButtonText,
                      selectedCompatibilityType === "marriage" &&
                        styles.selectedButtonText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {t("marriage")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.compatibilityButton,
                    selectedCompatibilityType === "work" &&
                      styles.selectedButton,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                  onPress={() => setSelectedCompatibilityType("work")}
                >
                  <Text
                    style={[
                      styles.compatibilityButtonText,
                      selectedCompatibilityType === "work" &&
                        styles.selectedButtonText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {t("work")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  display: "flex",
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat-Bold",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {t("firstPersonDetails")}
                </Text>
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("firstName")}
                  value={formData.firstName1}
                  onChangeText={(text) => handleInputChange("firstName1", text)}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("lastName")}
                  value={formData.lastName1}
                  onChangeText={(text) => handleInputChange("lastName1", text)}
                />

                <DateTimePickerAnalysis
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "birth1")
                  }
                  initialValues={{
                    birthDay: formData.birthDay1,
                    birthMonth: formData.birthMonth1,
                    birthYear: formData.birthYear1,
                    birthHour: formData.birthHour1,
                    birthMinute: formData.birthMinute1,
                    birthSecond: formData.birthSecond1,
                  }}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("placeOfBirth")}
                  value={formData.birthPlace1}
                  onChangeText={(text) =>
                    handleInputChange("birthPlace1", text)
                  }
                />
              </View>

              <View
                style={{
                  display: "flex",
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat-Bold",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {t("secondPersonDetails")}
                </Text>
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("firstName")}
                  value={formData.firstName2}
                  onChangeText={(text) => handleInputChange("firstName2", text)}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("lastName")}
                  value={formData.lastName2}
                  onChangeText={(text) => handleInputChange("lastName2", text)}
                />
                <DateTimePickerAnalysis
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "birth2")
                  }
                  initialValues={{
                    birthDay: formData.birthDay2,
                    birthMonth: formData.birthMonth2,
                    birthYear: formData.birthYear2,
                    birthHour: formData.birthHour2,
                    birthMinute: formData.birthMinute2,
                    birthSecond: formData.birthSecond2,
                  }}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("placeOfBirth")}
                  value={formData.birthPlace2}
                  onChangeText={(text) =>
                    handleInputChange("birthPlace2", text)
                  }
                />
              </View>
            </View>
          )}

          {/* Image Picker */}
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
            {t("selectImages")}
          </Text>
          <View
            style={[
              styles.imageInputContainer,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <TouchableOpacity
              onPress={pickImages}
              style={[
                styles.iconButton,
                { marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 },
              ]}
            >
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

          {/* Payment Component */}
          <PaymentComponent
            serviceId="6vdePubVH2mJbu6XmoiL"
            price={totalPrice}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              //!formValid && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            //disabled={!formValid}
          >
            <Text
              style={[
                styles.submitButtonText,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("submit")}
            </Text>
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
  form: {
    marginVertical: 16,
    width: "100%",
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
  dateTimePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compatibilityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  compatibilityButton: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    borderColor: "#ccc",
    borderWidth: 1,
    marginHorizontal: 4,
  },
  selectedButton: {
    backgroundColor: "#2E6FF3",
    borderColor: "#2E6FF3",
    color: "#fff",
  },
  selectedButtonText: {
    color: "#FFF", // White color for the selected button text
  },
  compatibilityButtonText: {
    color: "#000",
    fontFamily: "Montserrat-Regular",
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
    width: 50,
    height: 50,
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
  additionalOptionsContainer: {
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontFamily: "Montserrat-Regular",
  },
  totalPriceContainer: {
    marginTop: 16,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  rtlImages: {
    flexDirection: 'row-reverse',
  },
  ltrImages: {
    flexDirection: 'row',
  },
});

export default AnalysisScreen;
