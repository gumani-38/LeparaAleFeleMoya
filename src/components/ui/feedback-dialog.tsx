import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type DialogTone = "error" | "success" | "info";

export type DialogAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
};

export type DialogMessage = {
  title: string;
  message: string;
  tone: DialogTone;
  actions?: DialogAction[];
};

export function useFeedbackDialog() {
  const [dialog, setDialog] = useState<DialogMessage | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const showDialog = useCallback(
    (
      title: string,
      message: string,
      tone: DialogTone = "error",
      actions?: DialogAction[],
    ) => setDialog({ title, message, tone, actions }),
    [],
  );

  return {
    dialog,
    closeDialog,
    showDialog,
  };
}

export function FeedbackDialog({
  dialog,
  onClose,
}: {
  dialog: DialogMessage | null;
  onClose: () => void;
}) {
  const toneColor =
    dialog?.tone === "success"
      ? "#16803c"
      : dialog?.tone === "info"
        ? "#2563eb"
        : "#c62828";
  const actions = dialog?.actions ?? [{ label: "Close" }];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={dialog !== null}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        {dialog ? (
          <View
            accessibilityRole="alert"
            accessibilityViewIsModal
            style={styles.card}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${toneColor}15` }]}>
              <Ionicons
                name={
                  dialog.tone === "success"
                    ? "checkmark-circle"
                    : dialog.tone === "info"
                      ? "information-circle"
                      : "alert-circle"
                }
                size={32}
                color={toneColor}
              />
            </View>
            <Text style={styles.title}>{dialog.title}</Text>
            <Text style={styles.message}>{dialog.message}</Text>
            <View style={styles.actions}>
              {actions.map((action, index) => {
                const isPrimary = action.variant !== "secondary";
                return (
                  <Pressable
                    key={`${action.label}-${index}`}
                    accessibilityRole="button"
                    style={[
                      styles.actionButton,
                      isPrimary ? styles.primaryButton : styles.secondaryButton,
                    ]}
                    onPress={() => {
                      onClose();
                      action.onPress?.();
                    }}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isPrimary
                          ? styles.primaryActionText
                          : styles.secondaryActionText,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderRadius: 28,
  },
  title: {
    color: "#111111",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    color: "#595959",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 22,
  },
  actionButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 9,
  },
  primaryButton: {
    backgroundColor: "#111111",
  },
  secondaryButton: {
    backgroundColor: "#f1f1f1",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryActionText: {
    color: "#ffffff",
  },
  secondaryActionText: {
    color: "#111111",
  },
});
