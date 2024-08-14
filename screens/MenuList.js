// components/MenuList.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ActionSheet from "react-native-actionsheet";

const MenuList = ({ title, options, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showActionSheet = () => setIsVisible(true);
  const handleActionSheetPress = (index) => {
    setIsVisible(false);
    onSelect(index);
  };

  return (
    <View>
      <TouchableOpacity style={styles.menuButton} onPress={showActionSheet}>
        <Text style={styles.menuButtonText}>{title}</Text>
      </TouchableOpacity>
      <ActionSheet
        ref={(o) => (this.ActionSheet = o)}
        title={title}
        options={options.map((option) => option.name).concat("Cancel")}
        cancelButtonIndex={options.length}
        onPress={handleActionSheetPress}
        visible={isVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    width: "90%",
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#2E6FF3",
    alignItems: "center",
    borderRadius: 8,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MenuList;
