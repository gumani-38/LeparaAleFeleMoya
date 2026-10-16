import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextInputProps,
} from "react-native";
import type { Validator } from "@/lib/validation";

interface FormFieldProps extends TextInputProps {
  label: string;
  validate?: Validator;
  showValidation?: boolean;
  resetKey?: number;
}

export function FormField({
  label,
  validate,
  showValidation = false,
  resetKey = 0,
  onBlur,
  onChangeText,
  value,
  ...props
}: FormFieldProps) {
  const [touchState, setTouchState] = useState({ resetKey, touched: false });
  const touched = touchState.resetKey === resetKey && touchState.touched;
  const error =
    validate && (touched || showValidation)
      ? validate(typeof value === "string" ? value : "")
      : undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          value={value}
          onChangeText={onChangeText}
          onBlur={(event) => {
            setTouchState({ resetKey, touched: true });
            onBlur?.(event);
          }}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  inputWrapperError: {
    borderColor: "#c62828",
  },
  input: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    padding: 0,
  },
  errorText: {
    marginTop: 5,
    color: "#b42318",
    fontSize: 12,
    lineHeight: 17,
  },
});
