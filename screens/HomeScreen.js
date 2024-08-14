import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  I18nManager,
} from "react-native";
import { FontAwesome, FontAwesome5, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dimensions } from 'react-native';

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

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
    const fetchData = async () => {
      try {
        const lang = i18n.language; // Get the current language

        const servicesCollection = collection(db, "Services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name[lang], // Get the name in the selected language
          images: doc.data().images,
          price: doc.data().price,
          route: doc.data().route,
        }));
        setServices(servicesData);

        const postsCollection = collection(db, "Posts");
        const postsSnapshot = await getDocs(postsCollection);
        const postsData = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      } else {
        navigation.navigate("Auth");
      }
    });

    return unsubscribe;
  }, [i18n.language]); // Re-fetch data when language changes

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  // Function to open social media links
  const openLink = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.error("Don't know how to open URI: " + url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#2e6ff3" />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {services.slice(0, 3).map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.button}
            onPress={() => navigation.navigate(service.route)}
          >
            <Image source={{ uri: service.images }} style={styles.icon} />
            <Text style={styles.buttonText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.button, styles.moreButton]}
        onPress={() => navigation.navigate("More")}
      >
        <FontAwesome name="ellipsis-h" size={30} color="#fff" />
        <Text style={styles.buttonText}>{t("More")}</Text>
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <View style={styles.socialMediaContainer}>
          <View style={styles.socialMediaIcons}>
            <TouchableOpacity
              onPress={() =>
                openLink(
                  "https://www.facebook.com/profile.php?id=61559661161781&mibextid=ZbWKwL"
                )
              }
            >
              <FontAwesome name="facebook-square" size={50} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openLink(
                  "https://www.instagram.com/signs.codes?igsh=bWF6azhsYjM1MWxm"
                )
              }
            >
              <FontAwesome name="instagram" size={50} color="#e1306c" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                openLink("https://www.tiktok.com/@signs.codes");
              }}
            >
              <FontAwesome5 name="tiktok" size={40} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openLink("https://www.youtube.com/@signscodes8656")
              }
            >
              <FontAwesome name="youtube-play" size={50} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openLink("https://t.me/astrothings888")}
            >
              <FontAwesome name="telegram" size={50} color="#08c" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.articlesContainer}>
          <Text style={styles.sectionHeader}>{t("our_articles")}</Text>
          <View style={styles.articleList}>
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.articleCard}
                onPress={() =>
                  navigation.navigate("ArticleDetail", { article: post })
                }
              >
                <Image
                  source={{ uri: post.Image }}
                  style={styles.articleImage}
                />
                <View style={styles.articleContent}>
                  <Text style={styles.articleDate}>
                    {format(
                      new Date(post.Creation_AT.seconds * 1000),
                      "MMMM d, yyyy"
                    )}
                  </Text>
                  <Text style={styles.articleTitle}>{post.Title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const isRTL = I18nManager.isRTL;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'), // 5% de la largeur de l'écran
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: /*isRTL ? "row-reverse" :*/ "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp('5%'), // 5% de la hauteur de l'écran
    marginTop: hp('2%'), // 2% de la hauteur de l'écran
  },
  logo: {
    width: wp('25%'), // 25% de la largeur de l'écran
    height: hp('7%'), // 7% de la hauteur de l'écran
    resizeMode: "contain",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: /*isRTL ? "flex-end" :*/ "space-between",
  },
  button: {
    width: wp('28%'), // 30% de la largeur de l'écran
    height: hp('15%'), // 15% de la hauteur de l'écran
    backgroundColor: "#2E6FF3",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp('2.5%'), // 2.5% de la largeur de l'écran
    marginBottom: hp('2%'), // 2% de la hauteur de l'écran
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  moreButton: {
    width: "100%",
    height: hp('8%'), // 8% de la hauteur de l'écran
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: wp('4%'), // 4% de la largeur de l'écran
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  icon: {
    width: wp('12%'), // 12% de la largeur de l'écran
    height: hp('6%'), // 6% de la hauteur de l'écran
    marginBottom: hp('1.5%'), // 1.5% de la hauteur de l'écran
  },
  sectionHeader: {
    fontSize: wp('5%'), // 5% de la largeur de l'écran
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: hp('2.5%'), // 2.5% de la hauteur de l'écran
    alignSelf: "center",
    textAlign: isRTL ? "right" : "left",
  },
  contentContainer: {
    flexDirection: /*isRTL ? "row-reverse" :*/ "row",
    justifyContent: "space-between",
  },
  socialMediaContainer: {
    justifyContent: "center",
  },
  socialMediaIcons: {
    alignItems: "center",
    gap: hp('2%'), // 2% de la hauteur de l'écran
  },
  articlesContainer: {
    width: "70%",
  },
  articleList: {
    flexDirection: "column",
  },
  articleCard: {
    width: "100%",
    height: hp('30%'), // 30% de la hauteur de l'écran
    backgroundColor: "#fff",
    marginBottom: hp('2%'), // 2% de la hauteur de l'écran
    borderRadius: wp('2.5%'), // 2.5% de la largeur de l'écran
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  articleImage: {
    width: "100%",
    height: hp('15%'), // 20% de la hauteur de l'écran
    borderTopLeftRadius: wp('2.5%'), // 2.5% de la largeur de l'écran
    borderTopRightRadius: wp('2.5%'), // 2.5% de la largeur de l'écran
  },
  articleContent: {
    padding: wp('3%'), 
  },
  articleDate: {
    fontSize: wp('3%'), 
    color: "#777",
    marginBottom: hp('0.5%'),
    //textAlign: isRTL ? "right" : "left",
  },
  articleTitle: {
    fontSize: wp('5%'), 
    color: "#333",
    fontFamily: "Montserrat-Bold",
    textAlign: isRTL ? "right" : "left",
  },
});
