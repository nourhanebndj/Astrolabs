import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useTranslation } from "react-i18next"; // Importer useTranslation

const AdminScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // Utiliser useTranslation
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('admin_dashboard')}</Text>
      </View>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("AddPost")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="plus" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('add_post')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("Request")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="bell" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('requests')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("ChatAdmin")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="comments" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('chat')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("PriceManagementScreen")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="dollar" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('manage_prices')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("Members")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="users" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('members')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("Profile")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome name="user" size={30} color="#2E6FF3" />
          </View>
          <Text style={styles.cardText}>{t('profile')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#2E6FF3",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  title: {
    marginTop: 25,
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
    color: "#333",
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default AdminScreen;
