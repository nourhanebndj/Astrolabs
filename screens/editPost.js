import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../firebase";
import { useTranslation } from "react-i18next";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AntDesign } from "@expo/vector-icons";

const EditPost = ({ route }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "Posts", postId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const postData = docSnap.data();
        setPost(postData);
        setTitle(postData.Title);
        setDescription(postData.Description);
        setImage(postData.Image);
      } else {
        Alert.alert(t("error"), t("postNotFound"));
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (!fontsLoaded) {
    return null;
  } else {
    SplashScreen.hideAsync();
  }

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf("/") + 1);
    const ref = ref(storage, `posts/${filename}`);
    await uploadBytes(ref, blob);
    return await getDownloadURL(ref);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imageUrl = image;
      if (image && image !== post.Image) {
        imageUrl = await uploadImage(image);
      }

      await updateDoc(doc(db, "Posts", postId), {
        Title: title,
        Description: description,
        Image: imageUrl,
      });

      Alert.alert(t("success"), t("postUpdated"));
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      console.error("Error updating post: ", error);
      Alert.alert(t("error"), t("failedToUpdatePost"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6FF3" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.headerContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name={isRTL ? "arrowright" : "arrowleft"} size={30} color="#2E6FF3" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("editPost")}</Text>
      </View>

      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("title")}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
        value={title}
        onChangeText={setTitle}
        placeholder={t("enterTitle")}
      />

      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("description")}</Text>
      <TextInput
        style={[styles.input, styles.textArea, { textAlign: isRTL ? "right" : "left" }]}
        value={description}
        onChangeText={setDescription}
        placeholder={t("enterDescription")}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("attachedImages")}</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <FontAwesome name="camera" size={30} color="gray" />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Montserrat-Regular",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePicker: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#2E6FF3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
});

export default EditPost;
