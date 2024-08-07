import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next"; // Import useTranslation

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedAccountType, setSelectedAccountType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // Use i18n for translations

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const membersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
      setFilteredMembers(membersData); // Initially show all members
    } catch (error) {
      console.error("Error fetching members: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    // Filter members based on selected account type
    if (selectedAccountType === "All") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(
        members.filter(
          (member) =>
            member.accountType.toLowerCase() ===
            selectedAccountType.toLowerCase()
        )
      );
    }
  }, [selectedAccountType, members]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const renderMember = ({ item }) => {
    // Determine if the current language is RTL
    const isRTL = i18n.dir() === "rtl";

    return (
      <View style={[styles.card, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Image
          source={require("../assets/images/member.png")}
          style={[styles.patientImage, { marginLeft: isRTL ? 15 : 0, marginRight: isRTL ? 0 : 15 }]}
        />
        <TouchableOpacity
          style={[styles.cardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          onPress={() =>
            navigation.navigate("MemberDetail", { memberId: item.id })
          }
        >
          <View style={[styles.patientInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
            <Text style={[styles.patientName, { textAlign: isRTL ? "right" : "left" }]}>
              {item.firstname} {item.lastname}
            </Text>
            <Text style={[styles.patientDetails, { textAlign: isRTL ? "right" : "left" }]}>
              {item.email}
            </Text>
            <Text style={[styles.patientDetails, { textAlign: isRTL ? "right" : "left" }]}>
              {t("accountType")}: {item.accountType}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { alignItems: isRTL ? "flex-start" : "flex-end" }]}
          >
            <FontAwesome
              name="chevron-right"
              size={20}
              color="#2E6FF3"
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} // Flip for RTL
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  // Determine if the current language is RTL
  const isRTL = i18n.dir() === "rtl";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.goBackButton,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
        onPress={() => navigation.navigate("Admin")}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"}
          size={30}
          color="#2E6FF3"
        />
        <Text style={styles.goBackText}>{t("goBack")}</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={
            selectedAccountType === "All"
              ? styles.filterButtonSelected
              : styles.filterButton
          }
          onPress={() => setSelectedAccountType("All")}
        >
          <Text
            style={
              selectedAccountType === "All"
                ? styles.filterButtonTextSelected
                : styles.filterButtonText
            }
          >
            {t("all")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            selectedAccountType === "Standard"
              ? styles.filterButtonSelected
              : styles.filterButton
          }
          onPress={() => setSelectedAccountType("Standard")}
        >
          <Text
            style={
              selectedAccountType === "Standard"
                ? styles.filterButtonTextSelected
                : styles.filterButtonText
            }
          >
            {t("standard")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            selectedAccountType === "VIP"
              ? styles.filterButtonSelected
              : styles.filterButton
          }
          onPress={() => setSelectedAccountType("VIP")}
        >
          <Text
            style={
              selectedAccountType === "VIP"
                ? styles.filterButtonTextSelected
                : styles.filterButtonText
            }
          >
            {t("vip")}
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2E6FF3" />
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  goBackText: {
    color: "#2E6FF3",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginLeft: I18nManager.isRTL ? 0 : 10,
    marginRight: I18nManager.isRTL ? 10 : 0,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 25,
    width: 100,
  },
  filterButtonSelected: {
    padding: 10,
    backgroundColor: "#2E6FF3",
    borderRadius: 25,
    width: 100,
  },
  filterButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
  filterButtonTextSelected: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  patientInfo: {
    flex: 1,
    marginLeft: 10,
  },
  patientName: {
    fontSize: 16,
    color: "#333",
  },
  patientDetails: {
    fontSize: 16,
    color: "#666",
  },
  analysisType: {
    fontSize: 14,
    color: "#666",
  },
  arrowButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Members;
