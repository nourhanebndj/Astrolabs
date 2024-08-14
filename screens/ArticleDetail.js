import { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const ArticleDetail = ({ route, navigation }) => {
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

  if (!fontsLoaded) {
    return undefined;
  } else {
    SplashScreen.hideAsync();
  }
  const { article } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="arrowleft" size={30} color="#2E6FF3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('articleDetail')}</Text>
      </View>
      <ScrollView>
        <Image source={{ uri: article.Image }} style={styles.image} />
        <Text style={styles.title}>{article.Title}</Text>
        <Text style={styles.description}>{article.Description}</Text>
        <Text style={styles.date}>
          {new Date(article.Creation_AT.seconds * 1000).toLocaleDateString()}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: "Montserrat-Bold",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
    fontFamily: "Montserrat-Regular",
  },
  date: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    paddingHorizontal: 20,
  },
});

export default ArticleDetail;
