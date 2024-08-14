import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: "", time: "" };
    const date = new Date(timestamp * 1000);
    const optionsDate = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    const optionsTime = { hour: "2-digit", minute: "2-digit" };
    return {
      date: date.toLocaleDateString([], optionsDate),
      time: date.toLocaleTimeString([], optionsTime),
    };
  };

  const fetchChatSessions = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);

    const collections = [
      "ConsultationRequest",
      "AssistanceRequest",
      "Analysisrequest",
    ];

    const chatPromises = collections.map((collectionName) => {
      return new Promise((resolve) => {
        const q = query(collection(db, collectionName));
        onSnapshot(q, async (querySnapshot) => {
          const requests = await Promise.all(
            querySnapshot.docs.map(async (docSnapshot) => {
              const requestId = docSnapshot.id;
              const requestData = docSnapshot.data();

              const chatSessionDoc = await getDoc(
                doc(db, "chatsession", requestId)
              );
              const chatSessionData = chatSessionDoc.exists()
                ? chatSessionDoc.data()
                : null;

              const userDoc = await getDoc(doc(db, "users", requestData.uid));
              const userData = userDoc.exists() ? userDoc.data() : null;

              const formattedTimestamp = chatSessionData?.lastMessageTimestamp
                ? formatTimestamp(chatSessionData.lastMessageTimestamp.seconds)
                : { date: "", time: "" };

              return {
                requestId,
                senderId: id,
                lastMessage: chatSessionData?.lastMessage || null,
                imageUrls: chatSessionData?.imageUrls || [],
                messageDate: formattedTimestamp.date,
                messageTime: formattedTimestamp.time,
                timestamp: chatSessionData?.lastMessageTimestamp
                  ? chatSessionData.lastMessageTimestamp.seconds
                  : 0,
                userId: requestData.uid,
                username: userData
                  ? `${userData.firstname} ${userData.lastname}`
                  : "Unknown User",
              };
            })
          );
          resolve(requests);
        });
      });
    });

    try {
      const resolvedChatsArrays = await Promise.all(chatPromises);
      const resolvedChats = resolvedChatsArrays.flat();
      const filteredChats = resolvedChats.filter(
        (chat) => chat.lastMessage !== null
      );

      // Sort chats by timestamp in descending order
      const sortedChats = filteredChats.sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setChats(sortedChats);
    } catch (error) {
      console.error("Error fetching chat sessions: ", error);
    }
  };

  useEffect(() => {
    fetchChatSessions();
    const interval = setInterval(fetchChatSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChatSessions().then(() => setRefreshing(false));
  };

  const navigateToChatScreen = (requestId, userId) => {
    navigation.navigate("ChatScreen", { requestId, userId });
  };

  const renderLastMessage = (item) => {
    const isAdminMessage = String(item.senderId) === String(userId);
    const messageColor = isAdminMessage ? "#2e6ff3" : "green";
  
    // Extract the first two words from the last message
    const truncatedMessage = item.lastMessage.split(" ").slice(0, 2).join(" ");
  
    return (
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center" }}>
        <FontAwesome
          name={isAdminMessage ? "arrow-right" : "arrow-left"}
          size={16}
          color={messageColor}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
        <Text style={{ color: messageColor, marginLeft: isRTL ? 0 : 5, marginRight: isRTL ? 5 : 0 }}>
          {truncatedMessage}
        </Text>
      </View>
    );
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.chatItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}
      onPress={() => navigateToChatScreen(item.requestId, item.userId)}
    >
      <Image
        source={require("../assets/images/member.png")}
        style={[styles.avatar, { marginLeft: isRTL ? 15 : 0, marginRight: isRTL ? 0 : 15 }]}
      />
      <View style={[styles.chatInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.username, { textAlign: isRTL ? "right" : "left" }]}>
          {item.username}
        </Text>
        {renderLastMessage(item)}
      </View>
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center" }}>
        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageDate}>{item.messageDate}</Text>
          <Text style={styles.messageTime}>{item.messageTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{
            alignItems: isRTL ? "flex-end" : "flex-start",
            width: "90%",
            marginTop: 30,
          }}
        >
          <TouchableOpacity
            style={[styles.goBackButton, { flexDirection: isRTL ? "row-reverse" : "row" }]}
            onPress={() => navigation.navigate("Admin")}
          >
            <AntDesign
              name={isRTL ? "arrowright" : "arrowleft"}
              size={30}
              color="#fff"
            />
            <Text
              style={[
                styles.goBackText,
                { marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0, textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("goBack")}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>
          {t("header")}
        </Text>    
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.requestId}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    backgroundColor: "#2E6FF3",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 15,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
  },
  goBackText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  headerText: {
    color: "#fff",
    fontSize: 25,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    marginTop: 15,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginVertical: 7.5,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
  },
  username: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  messageTimeContainer: {
    alignItems: "flex-end",
  },
  messageDate: {
    color: "#999",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
  messageTime: {
    color: "#999",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
});

export default ChatList;
