import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/Chat";
import ProfileUser from "../screens/ProfilUser";
import AppointmentScreen from "../screens/Appointement";
import CustomTabBar from "./CustomTabBar";
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function BottomNavBar() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Chat") {
            iconName = "comments";
          } else if (route.name === "Appointment") {
            iconName = "calendar";
          } else if (route.name === "ProfileUser") {
            iconName = "user";
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Appointment"
        component={AppointmentScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ProfileUser"
        component={ProfileUser}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default BottomNavBar;
