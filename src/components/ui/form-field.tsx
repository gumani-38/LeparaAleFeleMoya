import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextInputProps,
} from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  input: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    padding: 0,
  },
});
