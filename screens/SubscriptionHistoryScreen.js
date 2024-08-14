import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function SubscriptionHistoryScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "subscriptions"));
        const subscriptionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubscriptions(subscriptionsData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error.message);
      }
      setIsLoading(false);
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const handleRTL = () => {
      if (i18n.language === 'ar' && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
      } else if (i18n.language !== 'ar' && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
      }
    };
    handleRTL();
  }, [i18n.language]);

  const renderSubscription = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>{t('subscriptionId')}: {item.id}</Text>
      <Text style={styles.cardText}>{t('plan')}: {item.plan}</Text>
      <Text style={styles.cardText}>{t('startDate')}: {item.startDate}</Text>
      <Text style={styles.cardText}>{t('endDate')}: {item.endDate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('subscriptionHistory')}</Text>
      <View style={styles.comingSoonOverlay}>
        <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2E6FF3" />
      ) : subscriptions.length === 0 ? (
        <Text style={styles.noHistoryText}>{t('noHistory')}</Text>
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const isRTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    position: "relative",
  },
  title: {
    fontSize: 30,
    color: "#333",
    marginTop: 30,
    marginBottom: 30,
    fontFamily: "Montserrat-Bold",
    textAlign: isRTL ? 'right' : 'left',
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  comingSoonText: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  noHistoryText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    opacity: 0.6, // Reduced opacity to indicate disabled state
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat-Regular",
    marginBottom: 5,
    textAlign: isRTL ? 'right' : 'left',
  },
});
