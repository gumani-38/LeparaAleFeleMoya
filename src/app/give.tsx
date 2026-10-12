import { FormField } from "@/components/ui/form-field";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  expanded,
  onToggle,
  onSelect,
}: SelectFieldProps) {
  return (
    <View style={styles.selectFieldContainer}>
      <Text style={styles.selectLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.selectBoxRow}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
      >
        <Text style={styles.selectValueText} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#000000"
        />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.selectOptions}>
          {options.map((option) => {
            const selected = value === option;
            return (
              <TouchableOpacity
                key={option}
                style={styles.selectOption}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => onSelect(option)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    selected && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark" size={18} color="#111111" />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const EVENTS = [
  "Community clothing drive - 24 Oct",
  "Winter support collection - 14 Nov",
  "Youth skills workshop - 07 Nov",
];

export default function GiveScreen() {
  // --- Form 1 States (Donation) ---
  const [donateName, setDonateName] = useState("Naledi Mokoena");
  const [donateEmail, setDonateEmail] = useState("naledi.mokoena@example.com");
  const [donatePhone, setDonatePhone] = useState("+27 71 234 5678");
  const [donateDesc, setDonateDesc] = useState(
    "12 clean blankets for the clothing drive. I can drop them off on 23 October after 15:00.",
  );
  const [donateValue, setDonateValue] = useState(
    "R1,200 (estimated goods value)",
  );
  const [donateConsent, setDonateConsent] = useState(true);
  const [donateEvent, setDonateEvent] = useState(EVENTS[0]);
  const [donationType, setDonationType] = useState("Goods — clothing / blankets");

  // --- Form 2 States (Volunteer) ---
  const [volunteerName, setVolunteerName] = useState("Sipho Dlamini");
  const [volunteerEmail, setVolunteerEmail] = useState(
    "sipho.dlamini@example.com",
  );
  const [volunteerPhone, setVolunteerPhone] = useState("+27 72 345 6789");
  const [volunteerDesc, setVolunteerDesc] = useState(
    "I can sort by size and prepare bundles. Available for the full 10:00–14:00 shift, including setup.",
  );
  const [volunteerAvail, setVolunteerAvail] = useState(
    "24 Oct 2026 · 10:00–14:00",
  );
  const [volunteerConsent, setVolunteerConsent] = useState(true);
  const [volunteerEvent, setVolunteerEvent] = useState(EVENTS[0]);
  const [volunteerTask, setVolunteerTask] = useState("Clothing sorting");
  const [openSelector, setOpenSelector] = useState<string | null>(null);

  const handleDonateSubmit = () => {
    Alert.alert(
      "Submission Successful",
      `Your ${donationType.toLowerCase()} donation for ${donateEvent} has been sent for review.`,
    );
  };

  const handleVolunteerSubmit = () => {
    Alert.alert(
      "Submission Successful",
      `Your request to help with ${volunteerTask.toLowerCase()} at ${volunteerEvent} has been sent for review.`,
    );
  };

  const selectOption = (setter: (value: string) => void, value: string) => {
    setter(value);
    setOpenSelector(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.topLabel}>GET INVOLVED / TWO FORM STATES</Text>
        <Text style={styles.mainTitle}>Give in your own way.</Text>
        <Text style={styles.description}>
          Choose to donate or volunteer. Both alternative form states are shown
          below for review.
        </Text>
      </View>

      {/* ==========================================
          01 DONATION FLOW
         ========================================== */}
      <View style={styles.formContainer}>
        <View style={styles.formChip}>
          <Text style={styles.formChipText}>01 Donation · Goods or funds</Text>
        </View>

        <FormField
          label="Full name *"
          value={donateName}
          onChangeText={setDonateName}
        />
        <FormField
          label="Email *"
          value={donateEmail}
          onChangeText={setDonateEmail}
          keyboardType="email-address"
        />
        <FormField
          label="Phone *"
          value={donatePhone}
          onChangeText={setDonatePhone}
          keyboardType="phone-pad"
        />

        <SelectField
          label="Event or task supported *"
          value={donateEvent}
          options={EVENTS}
          expanded={openSelector === "donateEvent"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "donateEvent" ? null : "donateEvent",
            )
          }
          onSelect={(value) => selectOption(setDonateEvent, value)}
        />

        <SelectField
          label="Donation type *"
          value={donationType}
          options={[
            "Goods — clothing / blankets",
            "Monetary donation",
            "School supplies",
            "Food and essentials",
          ]}
          expanded={openSelector === "donationType"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "donationType" ? null : "donationType",
            )
          }
          onSelect={(value) =>
            selectOption(setDonationType, value)
          }
        />

        <FormField
          label="Describe your donation *"
          value={donateDesc}
          onChangeText={setDonateDesc}
          multiline
        />
        <FormField
          label="Estimated value / amount (ZAR)"
          value={donateValue}
          onChangeText={setDonateValue}
        />

        {/* Checkbox Consent */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setDonateConsent(!donateConsent)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={donateConsent ? "checkbox" : "square-outline"}
            size={20}
            color="#000000"
            style={styles.checkboxIcon}
          />
          <Text style={styles.checkboxText}>
            I consent to contact about my donation.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blackSubmitButton}
          onPress={handleDonateSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitButtonText}>Submit donation request</Text>
        </TouchableOpacity>
        <Text style={styles.underNotice}>
          No payment collected. Our team will arrange next steps.
        </Text>
      </View>

      <View style={styles.sectionSeparator} />

      {/* ==========================================
          02 VOLUNTEER FLOW
         ========================================== */}
      <View style={styles.formContainer}>
        <View style={styles.formChip}>
          <Text style={styles.formChipText}>02 Volunteer · Time or skills</Text>
        </View>

        <FormField
          label="Full name *"
          value={volunteerName}
          onChangeText={setVolunteerName}
        />
        <FormField
          label="Email *"
          value={volunteerEmail}
          onChangeText={setVolunteerEmail}
          keyboardType="email-address"
        />
        <FormField
          label="Phone *"
          value={volunteerPhone}
          onChangeText={setVolunteerPhone}
          keyboardType="phone-pad"
        />

        <SelectField
          label="Event supported *"
          value={volunteerEvent}
          options={EVENTS}
          expanded={openSelector === "volunteerEvent"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "volunteerEvent" ? null : "volunteerEvent",
            )
          }
          onSelect={(value) =>
            selectOption(setVolunteerEvent, value)
          }
        />

        <SelectField
          label="Task *"
          value={volunteerTask}
          options={[
            "Clothing sorting",
            "Packing clothing bundles",
            "Event setup and registration",
            "Distribution support",
          ]}
          expanded={openSelector === "volunteerTask"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "volunteerTask" ? null : "volunteerTask",
            )
          }
          onSelect={(value) =>
            selectOption(setVolunteerTask, value)
          }
        />

        <FormField
          label="Describe your contribution *"
          value={volunteerDesc}
          onChangeText={setVolunteerDesc}
          multiline
        />
        <FormField
          label="Availability *"
          value={volunteerAvail}
          onChangeText={setVolunteerAvail}
        />

        {/* Checkbox Consent */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setVolunteerConsent(!volunteerConsent)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={volunteerConsent ? "checkbox" : "square-outline"}
            size={20}
            color="#000000"
            style={styles.checkboxIcon}
          />
          <Text style={styles.checkboxText}>
            I consent to contact about volunteering.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blackSubmitButton}
          onPress={handleVolunteerSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitButtonText}>Submit volunteer request</Text>
        </TouchableOpacity>
        <Text style={styles.underNotice}>
          The team will review your request and confirm your task.
        </Text>
      </View>

      <Text style={styles.footerFineprint}>
        Required fields marked * · All submissions are sample data.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formChip: {
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  formChipText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  selectFieldContainer: {
    width: "100%",
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 6,
  },
  selectBoxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  selectValueText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  selectOptions: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  selectOption: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  selectOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    marginRight: 10,
  },
  selectedOptionText: {
    color: "#000000",
    fontWeight: "700",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  checkboxIcon: {
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
  blackSubmitButton: {
    backgroundColor: "#0c0c0c",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  underNotice: {
    fontSize: 11,
    color: "#888888",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 10,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginHorizontal: 20,
    marginVertical: 24,
  },
  footerFineprint: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 40,
  },
});
