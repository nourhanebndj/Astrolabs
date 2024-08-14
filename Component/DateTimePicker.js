import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Platform, I18nManager } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

const DateTimePicker = ({ onChange, initialValues }) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const currentYear = new Date().getFullYear();

  const [day, setDay] = useState(initialValues.birthDay || "");
  const [month, setMonth] = useState(initialValues.birthMonth || "");
  const [year, setYear] = useState(initialValues.birthYear || "");
  const [hour, setHour] = useState(initialValues.birthHour || "");
  const [minute, setMinute] = useState(initialValues.birthMinute || "");
  const [second, setSecond] = useState(initialValues.birthSecond || "");

  useEffect(() => {
    onChange("birthDay", day);
    onChange("birthMonth", month);
    onChange("birthYear", year);
    onChange("birthHour", hour);
    onChange("birthMinute", minute);
    onChange("birthSecond", second);
  }, [day, month, year, hour, minute, second]);

  const generateItems = (start, end) => {
    const items = [];
    for (let i = start; i <= end; i++) {
      items.push({ label: i < 10 ? `0${i}` : `${i}`, value: `${i}` });
    }
    return items;
  };

  const monthItems = [
    { label: t("January"), value: "01" },
    { label: t("February"), value: "02" },
    { label: t("March"), value: "03" },
    { label: t("April"), value: "04" },
    { label: t("May"), value: "05" },
    { label: t("June"), value: "06" },
    { label: t("July"), value: "07" },
    { label: t("August"), value: "08" },
    { label: t("September"), value: "09" },
    { label: t("October"), value: "10" },
    { label: t("November"), value: "11" },
    { label: t("December"), value: "12" },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
        {t("Birth Date and Time")}
      </Text>
      {Platform.OS === "ios" ? (
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Day"),
              value: null,
            }}
            value={day}
            onValueChange={(value) => setDay(value)}
            items={generateItems(1, 31)}
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Month"),
              value: null,
            }}
            value={month}
            onValueChange={(value) => setMonth(value)}
            items={monthItems}
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Year"),
              value: null,
            }}
            value={year}
            onValueChange={(value) => setYear(value)}
            items={generateItems(2100 - 100, 2100)} // Adjusted to end at 2100
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Hour"),
              value: null,
            }}
            value={hour}
            onValueChange={(value) => setHour(value)}
            items={generateItems(0, 23)}
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Minute"),
              value: null,
            }}
            value={minute}
            onValueChange={(value) => setMinute(value)}
            items={generateItems(0, 59)}
          />
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: t("Second"),
              value: null,
            }}
            value={second}
            onValueChange={(value) => setSecond(value)}
            items={generateItems(0, 59)}
          />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Picker
              selectedValue={day}
              style={styles.picker}
              onValueChange={(itemValue) => setDay(itemValue)}
            >
              <Picker.Item label={t("dd")} value={null} />
              {generateItems(1, 31).map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={month}
              style={styles.picker}
              onValueChange={(itemValue) => setMonth(itemValue)}
            >
              <Picker.Item label={t("mm")} value={null} />
              {monthItems.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={year}
              style={styles.picker}
              onValueChange={(itemValue) => setYear(itemValue)}
            >
              <Picker.Item label={t("yyyy")} value={null} />
              {generateItems(currentYear - 100, 2100).map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.row}>
            <Picker
              selectedValue={hour}
              style={styles.picker}
              onValueChange={(itemValue) => setHour(itemValue)}
            >
              <Picker.Item label={t("HH")} value={null} />
              {generateItems(0, 23).map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={minute}
              style={styles.picker}
              onValueChange={(itemValue) => setMinute(itemValue)}
            >
              <Picker.Item label={t("MM")} value={null} />
              {generateItems(0, 59).map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={second}
              style={styles.picker}
              onValueChange={(itemValue) => setSecond(itemValue)}
            >
              <Picker.Item label={t("SS")} value={null} />
              {generateItems(0, 59).map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8", // Optional background color
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap", // Ensures the pickers wrap in small screens
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 110,
    marginHorizontal: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    paddingRight: 10, // to ensure the text is never behind the icon
    textAlign: "center",
    width: 80,
    margin: 5,
  },
});

export default DateTimePicker;
