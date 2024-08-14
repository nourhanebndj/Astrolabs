import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; // Import useTranslation

const MemberDetail = ({ route, navigation }) => {
  const { memberId } = route.params;
  const [member, setMember] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    accountType: "",
  });
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation(); // Initialize i18n

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      const docRef = doc(db, "users", memberId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMember(docSnap.data());
      } else {
        Toast.show({
          type: "error",
          text1: t("error"), // Translate this text
          text2: t("memberNotFound"), // Translate this text
          position: "top",
        });
        navigation.goBack();
      }
      setLoading(false);
    };

    fetchMember();
  }, [memberId]);

  const handleUpdateAccountType = async (newType) => {
    if (member.accountType === newType) return; // No change if same type is selected
    try {
      await updateDoc(doc(db, "users", memberId), { accountType: newType });
      setMember({ ...member, accountType: newType });
      Toast.show({
        type: "success",
        text1: t("success"), // Translate this text
        text2: t("accountTypeUpdated"), // Translate this text
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("error"), // Translate this text
        text2: t("updateAccountTypeFailed"), // Translate this text
        position: "top",
      });
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  // Determine if the current language is RTL
  const isRTL = i18n.dir() === "rtl";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.goBackButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          onPress={() => navigation.navigate("Members")}
        >
          <AntDesign
            name={isRTL ? "arrowright" : "arrowleft"}
            size={30}
            color="#fff"
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
        <Text style={styles.title}>{t("memberDetail")}</Text>
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={
            member.gender === "female"
              ? require("../assets/images/doctor.png")
              : require("../assets/images/maleProfile.png")
          }
          style={styles.profileImage}
        />
        <Text style={[styles.name, { textAlign: isRTL ? "right" : "left" }]}>
          {`${member.firstname} ${member.lastname}`}
        </Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {`${t("email")}: ${member.email}`}
        </Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {`${t("gender")}: ${member.gender}`}
        </Text>
        <Text style={[styles.detail, { textAlign: isRTL ? "right" : "left" }]}>
          {t("accountType")}: {member.accountType}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              member.accountType === "Standard" && styles.buttonSelected,
            ]}
            onPress={() => handleUpdateAccountType("Standard")}
          >
            <Text
              style={
                member.accountType === "Standard"
                  ? styles.buttonTextSelected
                  : styles.buttonText
              }
            >
              {t("standard")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              member.accountType === "VIP" && styles.buttonSelected,
            ]}
            onPress={() => handleUpdateAccountType("VIP")}
          >
            <Text
              style={
                member.accountType === "VIP"
                  ? styles.buttonTextSelected
                  : styles.buttonText
              }
            >
              {t("vip")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#2E6FF3",
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  goBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  goBackText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    textAlign: "center", // Adjust text alignment
  },
  title: {
    fontSize: 20,
    color: "white",
    fontFamily: "Montserrat-Bold",
    marginTop: 60,
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 140,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    fontFamily: "Montserrat-Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    padding: 10,
    width: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonSelected: {
    backgroundColor: "#2E6FF3",
    width: 100,
  },
  buttonText: {
    color: "#2E6FF3",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  buttonTextSelected: {
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});

export default MemberDetail;
