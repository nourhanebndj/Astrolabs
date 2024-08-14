import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

const AppointmentScreen = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [services] = useState([
    { id: "1", name: { en: "Analysis", ar: "تحليل", fr: "Analyse" }, collection: "Analysisrequest" },
    { id: "2", name: { en: "Consultation", ar: "استشارة", fr: "Consultation" }, collection: "ConsultationRequest" },
    { id: "3", name: { en: "Assistance", ar: "مساعدة", fr: "Assistance" }, collection: "AssistanceRequest" },
  ]);
  
  const defaultService = services[0].name[i18n.language]; // Set default to the first service
  const [selectedService, setSelectedService] = useState(defaultService);
  const [patients, setPatients] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Function to update existing Analysisrequest documents
  const updateAnalysisRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Analysisrequest"));
      snapshot.forEach(async (docSnapshot) => {
        const docData = docSnapshot.data();
        if (typeof docData.createdAt === "string") {
          const timestamp = Timestamp.fromDate(new Date(docData.createdAt));
          console.log(`Updating document ${docSnapshot.id} with createdAt timestamp`);
          await updateDoc(doc(db, "Analysisrequest", docSnapshot.id), {
            createdAt: timestamp,
          });
        }
      });
      console.log("Update complete.");
    } catch (e) {
      console.error("Error updating documents: ", e);
    }
  };

  // Fetch Analysis Requests
  const fetchAnalysisRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Analysisrequest"));
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        const timestamp = docData.createdAt ? docData.createdAt.seconds : null;
        return {
          id: doc.id,
          collection: "Analysisrequest",
          ...docData,
          createdAt: timestamp,
        };
      });
      return data;
    } catch (e) {
      console.error("Error fetching Analysis requests: ", e);
      return [];
    }
  };

  // Fetch Consultation and Assistance Requests
  const fetchConsultationAndAssistanceRequests = async () => {
    try {
      const consultationSnapshot = await getDocs(collection(db, "ConsultationRequest"));
      const consultationData = consultationSnapshot.docs.map((doc) => {
        const docData = doc.data();
        const timestamp = docData.Creation_AT ? docData.Creation_AT.seconds : null;
        return {
          id: doc.id,
          collection: "ConsultationRequest",
          ...docData,
          createdAt: timestamp,
        };
      });

      const assistanceSnapshot = await getDocs(collection(db, "AssistanceRequest"));
      const assistanceData = assistanceSnapshot.docs.map((doc) => {
        const docData = doc.data();
        const timestamp = docData.Creation_AT ? docData.Creation_AT.seconds : null;
        return {
          id: doc.id,
          collection: "AssistanceRequest",
          ...docData,
          createdAt: timestamp,
        };
      });

      return [...consultationData, ...assistanceData];
    } catch (e) {
      console.error("Error fetching Consultation and Assistance requests: ", e);
      return [];
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      await updateAnalysisRequests(); // Ensure all Analysis requests have a createdAt field
      const analysisRequests = await fetchAnalysisRequests();
      const otherRequests = await fetchConsultationAndAssistanceRequests();
      const allRequests = [...analysisRequests, ...otherRequests];
      allRequests.sort((a, b) => b.createdAt - a.createdAt); // Ensure sorting by most recent
      setRequests(allRequests);
      filterRequests(allRequests, selectedService);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching all requests: ", e);
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});
      setPatients(usersData);
    } catch (e) {
      console.error("Error fetching users: ", e);
    }
  };

  // Refresh data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
      fetchUsers();
    }, [])
  );

  useEffect(() => {
    fetchRequests();
    fetchUsers();

    const interval = setInterval(() => {
      fetchRequests();
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter Requests
  const filterRequests = (requests, selectedService) => {
    const user = auth.currentUser;
    if (user) {
      const userUid = user.uid;
      let filtered = requests.filter((request) => request.uid === userUid);
      if (selectedService) {
        const serviceCollection = services.find(
          (service) => service.name[i18n.language] === selectedService
        )?.collection;
        filtered = filtered.filter(
          (request) => request.collection === serviceCollection
        );
      }
      setFilteredRequests(filtered);
    }
  };

  useEffect(() => {
    filterRequests(requests, selectedService);
  }, [selectedService, requests]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    await fetchUsers();
    setRefreshing(false);
  }, []);

  // Cancel Request
  const cancelRequest = async (requestId, collectionName) => {
    Alert.alert(
      t("cancelRequest"),
      t("cancelRequestConfirmation"),
      [
        {
          text: t("no"),
          style: "cancel",
        },
        {
          text: t("yes"),
          onPress: async () => {
            try {
              await deleteDoc(doc(db, collectionName, requestId));
              setRequests(
                requests.filter((request) => request.id !== requestId)
              );
              setFilteredRequests(
                filteredRequests.filter((request) => request.id !== requestId)
              );
              Alert.alert(t("requestCancelled"));
            } catch (e) {
              Alert.alert(t("errorCancellingRequest"), e.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format Timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: "", time: "" };
    const date = new Date(timestamp * 1000);
    const optionsDate = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    const optionsTime = { hour: "2-digit", minute: "2-digit" };
    return {
      date: date.toLocaleDateString([], optionsDate),
      time: date.toLocaleTimeString([], optionsTime),
    };
  };

  // Render Request Item
  const renderRequest = ({ item }) => {
    const patient = patients[item.uid] || {};
    const formattedTimestamp = formatTimestamp(item.createdAt);

    return (
      <View style={[styles.card, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Image
          source={require("../assets/images/profile.png")}
          style={[styles.patientImage, { marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 }]}
        />
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            navigation.navigate("AppointmentDetailScreen", {
              requestId: item.id,
              collectionName: item.collection,
            })
          }
        >
          <View style={styles.patientInfo}>
            <Text style={[styles.patientName, { textAlign: isRTL ? "right" : "left" }]}>
              {patient.firstname} {patient.lastname}
            </Text>
            <Text style={[styles.patientDetails, { textAlign: isRTL ? "right" : "left" }]}>
              {patient.gender}
            </Text>
            {item.selectedAnalysisType && (
              <Text style={[styles.analysisType, { textAlign: isRTL ? "right" : "left" }]}>
                {t("typeOfAnalysis")}: {item.selectedAnalysisType}
              </Text>
            )}
            <Text style={[styles.timestamp, { textAlign: isRTL ? "right" : "left" }]}>
              {formattedTimestamp.date} {formattedTimestamp.time}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelRequest(item.id, item.collection)}
        >
          <MaterialIcons name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title,]}>
        {t("myRequests")}
      </Text>
      <View style={styles.chipContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.chip,
              selectedService === service.name[i18n.language] && styles.chipSelected,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
            onPress={() => setSelectedService(service.name[i18n.language])}
          >
            <Text
              style={[
                styles.chipText,
                selectedService === service.name[i18n.language] && { color: "#fff" },
              ]}
            >
              {service.name[i18n.language]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2E6FF3" />
      ) : filteredRequests.length === 0 ? (
        <View style={styles.noRequestsContainer}>
          <Text style={styles.noRequestsText}>{t("no_requests")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2E6FF3"]}
              tintColor="#2E6FF3"
            />
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
    textAlign: "center",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: "#2E6FF3",
  },
  chipText: {
    color: "#000",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  cancelButton: {
    padding: 10,
  },
  noRequestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRequestsText: {
    fontSize: 18,
    color: "#2E6FF3",
    fontFamily: "Montserrat-Regular",
  },
});

export default AppointmentScreen;
