import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  I18nManager,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the import path based on your project structure

const PostDetail = ({ route, navigation }) => {
  const { t } = useTranslation();

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const [refreshing, setRefreshing] = useState(false);
  const [post, setPost] = useState(route.params.post);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const docRef = doc(db, "Posts", post.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost(docSnap.data());
      }
    } catch (error) {
      console.error("Error refreshing post: ", error);
    }
    setRefreshing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name={I18nManager.isRTL ? "arrowright" : "arrowleft"} size={30} color="#2E6FF3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("articleDetail")}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditPost", { postId: post.id })}
          style={styles.editButton}
        >
          <FontAwesome name="edit" size={30} color="#2E6FF3" />
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Image source={{ uri: post.Image }} style={styles.image} />
        <Text style={styles.title}>{post.Title}</Text>
        <Text style={styles.description}>{post.Description}</Text>
        <Text style={styles.date}>
          {new Date(post.Creation_AT.seconds * 1000).toLocaleDateString()}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: 'Montserrat-Bold',
    flex: 1, // Center the title
    textAlign: 'center',
  },
  editButton: {
    marginLeft: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: 'Montserrat-Bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat-Regular',
  },
  date: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 20,
    textAlign: 'right',
  },
});

export default PostDetail;
