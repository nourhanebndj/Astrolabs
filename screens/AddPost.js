import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

const AddPost = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);

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

  useEffect(() => {
    (async () => {
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryStatus !== "granted") {
        Toast.show({
          type: "info",
          text1: t("permissionRequired"),
          text2: t("permissionRequiredMessage"),
        });
      }
    })();
  }, []);

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
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1].toLowerCase();

      const fileRef = ref(storage, `posts/${Date.now()}.${fileType}`);
      await uploadBytes(fileRef, blob);
      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw new Error("Failed to upload image");
    }
  };

  const submitPost = async () => {
    if (!image || !postTitle || !postText) {
      Toast.show({
        type: "error",
        text1: t("missingFields"),
        text2: t("missingFieldsMessage"),
      });
      return;
    }

    try {
      const imageUrl = await uploadImage(image);
      const newPost = {
        Title: postTitle,
        Image: imageUrl,
        Description: postText,
        Creation_AT: new Date(),
      };

      const docRef = doc(db, "Posts", `${Date.now()}`);
      await setDoc(docRef, newPost);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("postAddedSuccessfully"),
      });

      setImage(null);
      setPostTitle("");
      setPostText("");
      setImageUri(null);
    } catch (error) {
      console.error("Error during the post creation: ", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failedToAddPost"),
      });
    }
  };

  const isRTL = i18n.dir() === "rtl";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign
              name={isRTL ? "arrowright" : "arrowleft"}
              size={30}
              color="#2E6FF3"
              style={{ marginTop: 30 }}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("addPost")}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("title")}</Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("enterTitle")}
            value={postTitle}
            onChangeText={setPostTitle}
          />

          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("frontImage")}</Text>
          <View style={[styles.imageInputContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <FontAwesome name="plus-circle" size={30} color="gray" />
            </TouchableOpacity>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            )}
          </View>

          <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>{t("description")}</Text>
          <TextInput
            style={[styles.input, styles.textInput, { textAlign: isRTL ? "right" : "left" }]}
            placeholder={t("enterDescription")}
            value={postText}
            onChangeText={setPostText}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={submitPost}>
            <Text style={[styles.submitButtonText, { textAlign: isRTL ? "right" : "left" }]}>{t("postButton")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
  },
  headerTitle: {
    marginLeft: 10,
    marginTop: 30,
    fontSize: 18,
    color: "#2E6FF3",
    fontFamily: "Montserrat-Bold",
  },
  scrollContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  textInput: {
    height: 150,
    fontFamily: "Montserrat-Regular",
  },
  imageInputContainer: {
    justifyContent: "center",
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 25,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#2E6FF3",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
  },
});

export default AddPost;
