import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const animationRef = useRef(null);

  const handlePress = (index) => {
    if (animationRef.current) {
      animationRef.current.animate("pulse");
    }
    navigation.navigate(state.routeNames[index]);
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            style={styles.tabButton}
          >
            <Animatable.View
              ref={animationRef}
              style={[styles.tabIcon, isFocused && styles.activeTabIcon]}
            >
              <FontAwesome
                name={
                  options.tabBarIcon({ focused: isFocused, color: "", size: 0 })
                    .props.name
                }
                size={24}
                color={isFocused ? "#2E6FF3" : "#8E8E93"}
              />
            </Animatable.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    padding: 10,
    borderRadius: 10,
  },
  activeTabIcon: {
    backgroundColor: "#F0F0F0",
  },
});

export default CustomTabBar;
