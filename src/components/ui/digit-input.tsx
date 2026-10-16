import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";

interface DigitInputProps {
  code: string[];
  setCode: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DigitInput({ code, setCode }: DigitInputProps) {
  // Create an array of references to jump between input boxes automatically
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const updatedCode = [...code];
    const digits = text.replace(/\D/g, "");
    if (digits.length > 1) {
      digits
        .slice(0, code.length - index)
        .split("")
        .forEach((digit, offset) => {
          updatedCode[index + offset] = digit;
        });
      setCode(updatedCode);
      inputsRef.current[Math.min(index + digits.length, code.length - 1)]?.focus();
      return;
    }

    updatedCode[index] = digits;
    setCode(updatedCode);

    if (digits && index < code.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    // If user presses backspace and the box is empty, jump back to the previous box
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.rowContainer} accessibilityLabel="Email verification code">
      {code.map((digit, index) => (
        <View key={index} style={styles.boxWrapper}>
          <TextInput
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            style={styles.inputField}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            textAlign="center"
            accessibilityLabel={`Verification digit ${index + 1}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    marginBottom: 8,
  },
  boxWrapper: {
    flex: 1,
    maxWidth: 54,
    height: 60,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  inputField: {
    width: "100%",
    height: "100%",
    fontSize: 27,
    fontWeight: "700",
    color: "#000000",
  },
});
