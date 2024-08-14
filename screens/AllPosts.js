import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  I18nManager,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Posts"));
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "Posts", postId));
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post: ", error);
      Alert.alert(t("error"), t("failedToDeletePost"));
    }
  };

  const confirmDelete = (postId) => {
    Alert.alert(
      t("confirmDelete"),
      t("areYouSureToDelete"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("delete"), onPress: () => deletePost(postId), style: "destructive" },
      ]
    );
  };

  const renderPost = ({ item }) => {
    const isRTL = i18n.dir() === "rtl";

    return (
      <TouchableOpacity
        style={[styles.card, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        onPress={() => navigation.navigate("PostDetail", { post: item })}
      >
        {item.Image && (
          <Image
            source={{ uri: item.Image }}
            style={[styles.postImage, { marginLeft: isRTL ? 15 : 0, marginRight: isRTL ? 0 : 15 }]}
          />
        )}
        <View style={[styles.cardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.postInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
            <Text style={[styles.postTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {item.Title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)}
          >
            <FontAwesome name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
      {loading ? (
        <ActivityIndicator size="large" color="#2E6FF3" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
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
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  postInfo: {
    flex: 1,
    marginLeft: 10,
  },
  postTitle: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat-Bold",
  },
  deleteButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AllPosts;
