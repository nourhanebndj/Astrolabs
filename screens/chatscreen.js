import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import ImageViewer from "react-native-image-zoom-viewer";
import AntDesign from "@expo/vector-icons/AntDesign";

const ChatScreen = ({ route }) => {
  const { requestId, userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState({});
  const [requestUser, setRequestUser] = useState({});
  const [senderId, setSenderId] = useState("");
  const [chatSessions, setChatSessions] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);
  const flatListRef = useRef(null);

  const getRequestData = async (requestId) => {
    const collections = [
      "ConsultationRequest",
      "AssistanceRequest",
      "Analysisrequest",
    ];
    for (const collectionName of collections) {
      console.log(`Checking collection: ${collectionName}`);
      const docRef = doc(db, collectionName, requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`Found document in collection: ${collectionName}`);
        return { data: docSnap.data(), collection: collectionName };
      }
    }
    return null;
  };

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "No user ID found in AsyncStorage");
          return;
        }

        setSenderId(userId);
        setIsAdmin(userId === "i50FoOqfgMYf3wB9o6ApoWfWSqG2");
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          Alert.alert("Error", `No document found for userId: ${userId}`);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    getUserId();

    const getRequestUserData = async () => {
      try {
        const requestData = await getRequestData(requestId);
        if (requestData) {
          const { data, collection } = requestData;
          const receiverId = data.uid;
          const username = `${data.firstname || data.firstName1} ${
            data.lastname || data.lastName1
          }`;

          setChatSessions((prevState) => ({
            ...prevState,
            [requestId]: {
              username: username,
              receiverId: receiverId,
            },
          }));
          setRequestUser(data);
        } else {
          Alert.alert("Error", `No document found for requestId: ${requestId}`);
        }
      } catch (error) {
        console.error("Error fetching request user data: ", error);
      }
    };

    getRequestUserData();

    const q = query(
      collection(db, "Messages"),
      where("requestId", "==", requestId),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
      flatListRef.current?.scrollToEnd({ animated: true }); // Scroll to end on new messages
    });

    const chatSessionRef = doc(db, "chatsession", requestId);
    const unsubscribeChatSession = onSnapshot(chatSessionRef, (docSnap) => {
      if (docSnap.exists()) {
        setChatSessions((prevState) => ({
          ...prevState,
          [requestId]: {
            ...prevState[requestId],
            lastMessage: docSnap.data().lastMessage,
            lastMessageTimestamp: docSnap.data().lastMessageTimestamp,
          },
        }));
      } else {
        console.log("No document found for chatsession:", requestId);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeChatSession();
    };
  }, [requestId]);

  useEffect(() => {
    const updateMessageStatuses = async () => {
      for (const message of messages) {
        if (message.senderId !== senderId && message.status !== "seen") {
          await updateDoc(doc(db, "Messages", message.id), {
            status: "seen",
          });
        }
      }
    };

    updateMessageStatuses();
  }, [messages, senderId]);

  useEffect(() => {
    const typingStatusRef = doc(db, "TypingStatus", requestId);

    const unsubscribe = onSnapshot(typingStatusRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== senderId && data.isTyping) {
          setTypingUser(data.username);
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      }
    });

    return () => unsubscribe();
  }, [requestId, senderId]);

  const sendMessage = async (message, imageUrls = []) => {
    try {
      if (message.trim().length === 0 && imageUrls.length === 0) return;

      const newMessageDoc = await addDoc(collection(db, "Messages"), {
        requestId,
        senderId,
        userId,
        message,
        imageUrls,
        timestamp: new Date(),
        status: "sent",
      });

      const lastMessage = message || (imageUrls.length > 0 ? "Image" : "");

      await setDoc(
        doc(db, "chatsession", requestId),
        {
          lastMessage: lastMessage,
          lastMessageTimestamp: new Date(),
        },
        { merge: true }
      );

      setNewMessage("");
      setSelectedImages([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "Messages", messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const selectImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets);
      setModalVisible(true);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleSendImages = async () => {
    const imageUrls = await Promise.all(
      selectedImages.map(async (image) => {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const storageRef = ref(
          storage,
          `images/${new Date().getTime()}_${image.uri.split("/").pop()}`
        );
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      })
    );

    await sendMessage("", imageUrls);
    setModalVisible(false);
  };

  const handleLongPressMessage = (messageId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage(messageId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    const typingStatusRef = doc(db, "TypingStatus", requestId);
    if (text.length > 0) {
      setDoc(
        typingStatusRef,
        {
          userId: senderId,
          username: `${user.firstname} ${user.lastname}`,
          isTyping: true,
        },
        { merge: true }
      );
    } else {
      setDoc(
        typingStatusRef,
        {
          userId: senderId,
          isTyping: false,
        },
        { merge: true }
      );
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.senderId === senderId) {
          handleLongPressMessage(item.id);
        }
      }}
      style={
        item.senderId === senderId ? styles.myMessage : styles.otherMessage
      }
    >
      {item.imageUrls &&
        item.imageUrls.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.messageImage}
          />
        ))}
      <Text
        style={
          item.senderId === senderId
            ? styles.myMessageText
            : styles.otherMessageText
        }
      >
        {item.message}
      </Text>
      <Text
        style={
          item.senderId === senderId
            ? styles.myTimestamp
            : styles.otherTimestamp
        }
      >
        {new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        - {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Image
                source={require("../assets/images/msg.png")}
                style={styles.avatar}
              />
              <Text style={styles.headerText}>
                {isAdmin
                  ? `${requestUser.firstname || requestUser.firstName1} ${
                      requestUser.lastname || requestUser.lastName1
                    }`
                  : "Astrolabs's Admin"}
              </Text>
            </View>
            <TouchableOpacity style={styles.videoButton}>
              <AntDesign name="infocirlce" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContentContainer}
            ref={flatListRef}
          />
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={selectImages}>
              <FontAwesome name="photo" size={24} color="#888" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type your message..."
            />
            <TouchableOpacity
              onPress={() => sendMessage(newMessage)}
              style={styles.sendButton}
            >
              <FontAwesome name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Modal visible={isModalVisible} transparent={true}>
            <ImageViewer
              imageUrls={selectedImages.map((image) => ({ url: image.uri }))}
              enableSwipeDown={true}
              onSwipeDown={() => setModalVisible(false)}
              renderIndicator={(currentIndex, allSize) => (
                <View style={styles.indicatorContainer}>
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(currentIndex - 1)}
                  >
                    <FontAwesome name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendImages}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2E6FF3",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  backButton: {
    padding: 5,
    marginTop: 30,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
  },
  videoButton: {
    padding: 5,
    marginTop: 30,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2e6ff3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
    elevation: 1,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
    elevation: 1,
  },
  myMessageText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Montserrat-Regular",
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat-Regular",
  },
  myTimestamp: {
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
    textAlign: "right",
  },
  otherTimestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    elevation: 10,
  },
  iconButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: "#f9f9f9",
    fontFamily: "Montserrat-Regular",
  },
  sendButton: {
    backgroundColor: "#2E6FF3",
    borderRadius: 25,
    padding: 10,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
  indicatorContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "right",
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "#888",
    paddingLeft: 10,
    paddingTop: 5,
  },
});

export default ChatScreen;
