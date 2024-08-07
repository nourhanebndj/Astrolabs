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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { collection, getDocs, orderBy, updateDoc, doc, Timestamp } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const RequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [services] = useState([
    { id: "1", name: "Analysis", collection: "Analysisrequest" },
    { id: "2", name: "Consultation", collection: "ConsultationRequest" },
    { id: "3", name: "Assistance", collection: "AssistanceRequest" },
  ]);
  const [selectedService, setSelectedService] = useState("Analysis");
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

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

  const fetchAnalysisRequests = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "Analysisrequest"),
        orderBy("createdAt", "desc")
      );
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        const timestamp = docData.createdAt ? docData.createdAt.seconds : null;
        console.log("Document Data: ", docData); // Log each document's data
        console.log("Timestamp: ", timestamp); // Log the timestamp

        return {
          id: doc.id,
          collection: "Analysisrequest",
          ...docData,
          createdAt: timestamp,
        };
      });
      console.log("Analysis requests: ", data); // Logging for debugging
      return data;
    } catch (e) {
      console.error("Error fetching Analysis requests: ", e);
      return [];
    }
  };

  const fetchConsultationAndAssistanceRequests = async () => {
    try {
      const consultationSnapshot = await getDocs(
        collection(db, "ConsultationRequest"),
        orderBy("Creation_AT", "desc")
      );
      const assistanceSnapshot = await getDocs(
        collection(db, "AssistanceRequest"),
        orderBy("Creation_AT", "desc")
      );

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

  const fetchRequests = async () => {
    setLoading(true);
    try {
      await updateAnalysisRequests(); // Ensure all Analysis requests have a createdAt field
      const analysisRequests = await fetchAnalysisRequests();
      const otherRequests = await fetchConsultationAndAssistanceRequests();
      const allRequests = [...analysisRequests, ...otherRequests];
      allRequests.sort((a, b) => b.createdAt - a.createdAt); // Ensure sorting by most recent
      setRequests(allRequests);
      setFilteredRequests(allRequests);
    } catch (e) {
      console.error("Error fetching all requests: ", e);
    }
    setLoading(false);
  };

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

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [selectedService, requests]);

  const filterRequests = () => {
    if (selectedService) {
      const serviceCollection = services.find(
        (service) => service.name === selectedService
      )?.collection;
      const filtered = requests.filter(
        (request) => request.collection === serviceCollection
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    await fetchUsers();
    setRefreshing(false);
  }, []);

  const renderRequest = ({ item }) => {
    const patient = patients[item.uid] || {};
    const formattedTimestamp = formatTimestamp(item.createdAt);

    return (
      <View style={[styles.card, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Image
          source={require("../assets/images/member.png")}
          style={[styles.patientImage, { marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 }]}
        />
        <TouchableOpacity
          style={[styles.cardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          onPress={() => {
            if (item.collection === "Analysisrequest") {
              navigation.navigate("AnalysisRequestDetail", {
                requestId: item.id,
              });
            }
            if (item.collection === "ConsultationRequest") {
              navigation.navigate("ConsultationRequestDetail", {
                requestId: item.id,
              });
            }
            if (item.collection === "AssistanceRequest") {
              navigation.navigate("AssistanceRequestDetail", {
                requestId: item.id,
              });
            }
          }}
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
                {t("typeAnalysis")}: {item.selectedAnalysisType}
              </Text>
            )}
            <Text style={[styles.timestamp, { textAlign: isRTL ? "right" : "left" }]}>
              {formattedTimestamp.date} {formattedTimestamp.time}
            </Text>
          </View>
          <TouchableOpacity style={[styles.arrowButton, { alignItems: isRTL ? "flex-start" : "flex-end" }]}>
            <FontAwesome
              name="chevron-right"
              size={20}
              color="#2E6FF3"
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.goBackButton, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        onPress={() => navigation.navigate("Admin")}
      >
        <AntDesign
          name={isRTL ? "arrowright" : "arrowleft"}
          size={30}
          color="#2E6FF3"
        />
        <Text style={[styles.goBackText, { textAlign: isRTL ? "right" : "left" }]}>
          {t("goBack")}
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>{t("requests")}</Text>
      <View style={styles.chipContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.chip,
              selectedService === service.name && styles.chipSelected,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
            onPress={() => setSelectedService(service.name)}
          >
            <Text
              style={[
                styles.chipText,
                selectedService === service.name && styles.chipTextSelected,
                { textAlign: isRTL ? "right" : "left" }
              ]}
            >
              {t(service.name.toLowerCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2E6FF3" />
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
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
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: "#2E6FF3",
  },
  chipText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  chipTextSelected: {
    color: "#FFF",
    fontFamily: "Montserrat-Bold",
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
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  arrowButton: {
    padding: 10,
  },
});

export default RequestsScreen;
