import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView, // Import ScrollView
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AdminScreen = ({ navigation }) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        t("exit_confirmation"),
        t("are_you_sure_you_want_to_exit"),
        [
          {
            text: t("cancel"),
            onPress: () => null,
            style: "cancel",
          },
          {
            text: t("logout"),
            onPress: () => navigation.navigate("Login"), // Navigate to Login screen
          },
        ]
      );
      return true; // Prevent default behavior (exiting the app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            onPress={() => handleNavigation("AllPosts")}
          >
            <View style={styles.cardIcon}>
              <FontAwesome name="file-text" size={30} color="#2E6FF3" />
            </View>
            <Text style={styles.cardText}>{t('AllPost')}</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  scrollContainer: {
    flexGrow: 1, // Ensure the ScrollView content takes up all available space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: wp('5%'), // 5% de la largeur de l'écran
    backgroundColor: "#2E6FF3",
    borderBottomLeftRadius: wp('5%'), // 5% de la largeur de l'écran
    borderBottomRightRadius: wp('5%'), // 5% de la largeur de l'écran
    alignItems: "center",
  },
  title: {
    marginTop: hp('3%'), // 3% de la hauteur de l'écran
    fontSize: wp('7%'), // 7% de la largeur de l'écran
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  cardContainer: {
    flex: 1,
    padding: wp('5%'), // 5% de la largeur de l'écran
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: wp('80%'), // 80% de la largeur de l'écran
    backgroundColor: "#fff",
    borderRadius: wp('4%'), // 4% de la largeur de l'écran
    padding: wp('2.5%'), // 2.5% de la largeur de l'écran
    marginVertical: hp('1.5%'), // 1.5% de la hauteur de l'écran
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: hp('1.5%'), // 1.5% de la hauteur de l'écran
  },
  cardText: {
    fontSize: wp('4.5%'), // 4.5% de la largeur de l'écran
    fontFamily: "Montserrat-Regular",
    color: "#333",
  },
});

export default AdminScreen;
