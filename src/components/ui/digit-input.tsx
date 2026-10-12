import React, { useRef } from "react";
import { StyleSheet, View, TextInput } from "react-native";

interface DigitInputProps {
  code: string[];
  setCode: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DigitInput({ code, setCode }: DigitInputProps) {
  // Create an array of references to jump between input boxes automatically
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const updatedCode = [...code];
    // Keep only the last character entered
    updatedCode[index] = text.slice(-1);
    setCode(updatedCode);

    // If user typed a digit, automatically shift focus forward to the next box
    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // If user presses backspace and the box is empty, jump back to the previous box
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.rowContainer}>
      {code.map((digit, index) => (
        <View key={index} style={styles.boxWrapper}>
          <TextInput
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={styles.inputField}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            textAlign="center"
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
    marginVertical: 12,
  },
  boxWrapper: {
    width: 46,
    height: 54,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    width: "100%",
    height: "100%",
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
});
