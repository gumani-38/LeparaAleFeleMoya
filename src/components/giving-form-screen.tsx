import { FormField } from "@/components/ui/form-field";
import {
  FeedbackDialog,
  useFeedbackDialog,
} from "@/components/ui/feedback-dialog";
import { useAuth } from "@/components/auth-context";
import {
  API_ROUTES,
  ApiError,
  apiRequest,
  getResponseData,
} from "@/lib/api";
import {
  validateDonationAmount,
  validateEmail,
  validateFields,
  validateName,
  validatePhone,
  validateText,
} from "@/lib/validation";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SelectFieldProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
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
  const selectedOption = options.find((option) => option.value === value);
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
          {selectedOption?.label ?? value}
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
            const selected = value === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={styles.selectOption}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => onSelect(option.value)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    selected && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
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

type VolunteerTask = { taskId: number; name: string };
type VolunteerOpportunity = {
  initiativeId: number;
  title: string;
  dateLabel: string;
  tasks: VolunteerTask[];
};
type DonationEvent = {
  initiativeId: number;
  title: string;
  dateLabel: string;
  phase: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseVolunteerInitiative(
  value: unknown,
): Omit<VolunteerOpportunity, "tasks"> | null {
  if (
    !isRecord(value) ||
    typeof value.initiativeId !== "number" ||
    typeof value.title !== "string" ||
    typeof value.dateLabel !== "string" ||
    value.phase !== "Upcoming" ||
    value.volunteersRequired !== true
  ) {
    return null;
  }

  return {
    initiativeId: value.initiativeId,
    title: value.title,
    dateLabel: value.dateLabel,
  };
}

function parseVolunteerTask(value: unknown): VolunteerTask {
  if (
    !isRecord(value) ||
    typeof value.taskId !== "number" ||
    typeof value.name !== "string"
  ) {
    throw new ApiError("A volunteer task was not in the expected format.", 0);
  }
  return { taskId: value.taskId, name: value.name };
}

function parseDonationEvent(value: unknown): DonationEvent {
  if (
    !isRecord(value) ||
    typeof value.initiativeId !== "number" ||
    typeof value.title !== "string" ||
    typeof value.dateLabel !== "string" ||
    typeof value.phase !== "string"
  ) {
    throw new ApiError("An event from the server was not in the expected format.", 0);
  }
  return {
    initiativeId: value.initiativeId,
    title: value.title,
    dateLabel: value.dateLabel,
    phase: value.phase,
  };
}

const validateOptionalEmail = (value: string) =>
  value.trim() ? validateEmail(value) : undefined;

export default function GivingFormScreen({
  mode,
}: {
  mode: "donation" | "volunteer";
}) {
  const router = useRouter();
  const { initiativeId: initiativeIdParam } = useLocalSearchParams<{
    initiativeId?: string;
  }>();
  const requestedInitiativeId =
    typeof initiativeIdParam === "string" ? initiativeIdParam : undefined;
  const { token } = useAuth();
  const [donateName, setDonateName] = useState("");
  const [donateEmail, setDonateEmail] = useState("");
  const [donatePhone, setDonatePhone] = useState("");
  const [donateDesc, setDonateDesc] = useState("");
  const [donateValue, setDonateValue] = useState("");
  const [donateConsent, setDonateConsent] = useState(false);
  const [donationCategory, setDonationCategory] = useState("Goods");
  const [donationInitiativeId, setDonationInitiativeId] = useState("");
  const [donationEvents, setDonationEvents] = useState<DonationEvent[]>([]);
  const [donationFormKey, setDonationFormKey] = useState(0);

  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [volunteerDesc, setVolunteerDesc] = useState("");
  const [volunteerAvail, setVolunteerAvail] = useState("");
  const [volunteerConsent, setVolunteerConsent] = useState(false);
  const [volunteerOpportunities, setVolunteerOpportunities] = useState<
    VolunteerOpportunity[]
  >([]);
  const [volunteerInitiativeId, setVolunteerInitiativeId] = useState("");
  const [volunteerTaskId, setVolunteerTaskId] = useState("");
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [opportunityError, setOpportunityError] = useState<string | null>(null);
  const [retryOpportunities, setRetryOpportunities] = useState(0);
  const [volunteerFormKey, setVolunteerFormKey] = useState(0);
  const [openSelector, setOpenSelector] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState<
    "donation" | "volunteer" | null
  >(null);
  const [showValidationFor, setShowValidationFor] = useState<
    "donation" | "volunteer" | null
  >(null);
  const { dialog, showDialog, closeDialog } = useFeedbackDialog();

  useEffect(() => {
    let isCurrent = true;

    const loadOpportunities = async () => {
      setIsLoadingOpportunities(true);
      setOpportunityError(null);
      try {
        const payload = await apiRequest<unknown>(
          `${API_ROUTES.initiatives}?page=1&pageSize=50`,
        );
        const data = getResponseData(payload);
        if (!Array.isArray(data)) {
          throw new ApiError("The events response was not in the expected format.", 0);
        }

        const donationEventList = data.map(parseDonationEvent);
        const upcoming = data
          .map(parseVolunteerInitiative)
          .filter(
            (
              initiative,
            ): initiative is Omit<VolunteerOpportunity, "tasks"> =>
              initiative !== null,
          );
        const opportunities = await Promise.all(
          upcoming.map(async (initiative) => {
              let tasks: VolunteerTask[] = [];
              if (mode === "volunteer") {
                const tasksPayload = await apiRequest<unknown>(
                  API_ROUTES.initiativeTasks(initiative.initiativeId),
                );
                const tasksData = getResponseData(tasksPayload);
                if (!Array.isArray(tasksData)) {
                  throw new ApiError(
                    "The volunteer task response was not in the expected format.",
                    0,
                  );
                }
                tasks = tasksData.map(parseVolunteerTask);
            }
            return {
              initiativeId: initiative.initiativeId,
              title: initiative.title,
              dateLabel: initiative.dateLabel,
              tasks,
            };
          }),
        );

        if (isCurrent) {
          const available = opportunities;
          const selected =
            available.find(
              ({ initiativeId }) =>
                String(initiativeId) === requestedInitiativeId,
            ) ?? (requestedInitiativeId ? undefined : available[0]);
          const selectedDonationEvent = donationEventList.find(
            ({ initiativeId }) =>
              String(initiativeId) === requestedInitiativeId,
          );
          setDonationEvents(
            donationEventList.filter((event) => event.phase === "Upcoming"),
          );
          setDonationInitiativeId(
            selectedDonationEvent ? String(selectedDonationEvent.initiativeId) : "",
          );
          setVolunteerOpportunities(available);
          setVolunteerInitiativeId(
            selected ? String(selected.initiativeId) : "",
          );
          setVolunteerTaskId("");
        }
      } catch (error) {
        if (isCurrent) {
          setOpportunityError(
            error instanceof Error
              ? error.message
              : "Could not load volunteer opportunities. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setIsLoadingOpportunities(false);
      }
    };

    void loadOpportunities();
    return () => {
      isCurrent = false;
    };
  }, [mode, requestedInitiativeId, retryOpportunities]);

  const selectedOpportunity = volunteerOpportunities.find(
    ({ initiativeId }) => String(initiativeId) === volunteerInitiativeId,
  );
  const taskOptions = [
    { value: "", label: "General volunteering" },
    ...(selectedOpportunity?.tasks ?? []).map((task) => ({
      value: String(task.taskId),
      label: task.name,
    })),
  ];
  const initiativeOptions = volunteerOpportunities.map((initiative) => ({
    value: String(initiative.initiativeId),
    label: `${initiative.title} - ${initiative.dateLabel}`,
  }));
  const donationEventOptions = [
    { value: "", label: "General donation" },
    ...donationEvents.map((event) => ({
      value: String(event.initiativeId),
      label: `${event.title} - ${event.dateLabel}`,
    })),
  ];
  const requestedOpportunityUnavailable =
    requestedInitiativeId !== undefined &&
    volunteerInitiativeId === "" &&
    volunteerOpportunities.length > 0 &&
    !volunteerOpportunities.some(
      ({ initiativeId }) => String(initiativeId) === requestedInitiativeId,
    );

  const clearDonationForm = () => {
    setDonateName("");
    setDonateEmail("");
    setDonatePhone("");
    setDonateDesc("");
    setDonateValue("");
    setDonateConsent(false);
    setDonationCategory("Goods");
    setDonationInitiativeId("");
    setDonationFormKey((key) => key + 1);
    setShowValidationFor(null);
    setOpenSelector(null);
  };

  const clearVolunteerForm = () => {
    setVolunteerName("");
    setVolunteerEmail("");
    setVolunteerPhone("");
    setVolunteerDesc("");
    setVolunteerAvail("");
    setVolunteerConsent(false);
    const firstOpportunity = volunteerOpportunities[0];
    setVolunteerInitiativeId(
      firstOpportunity ? String(firstOpportunity.initiativeId) : "",
    );
    setVolunteerTaskId("");
    setVolunteerFormKey((key) => key + 1);
    setShowValidationFor(null);
    setOpenSelector(null);
  };

  const handleDonateSubmit = async () => {
    const email = donateEmail.trim().toLowerCase();
    setShowValidationFor("donation");
    const validationError = validateFields([
      { value: donateName, validate: validateName("Full name") },
      { value: email, validate: validateEmail },
      { value: donatePhone, validate: validatePhone },
      { value: donateDesc, validate: validateText("Description", 10) },
      { value: donateValue, validate: validateDonationAmount },
    ]);
    if (validationError) {
      showDialog("Check your donation details", validationError);
      return;
    }
    if (!donateConsent) {
      showDialog("Consent required", "Please consent to be contacted.");
      return;
    }

    setSubmittingForm("donation");
    try {
      await apiRequest(API_ROUTES.donations, {
        method: "POST",
        token,
        body: {
          fullName: donateName.trim(),
          email,
          phone: donatePhone.trim(),
          category: donationCategory,
          initiativeId: donationInitiativeId
            ? Number(donationInitiativeId)
            : null,
          description: donateDesc.trim(),
          estimatedValue: donateValue.trim() || null,
          consent: donateConsent,
        },
      });
      clearDonationForm();
      showDialog(
        "Donation request sent",
        "Your donation details have been sent for review.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not submit donation",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSubmittingForm(null);
    }
  };

  const handleVolunteerSubmit = async () => {
    const email = volunteerEmail.trim().toLowerCase();
    setShowValidationFor("volunteer");
    const validationError = validateFields([
      { value: volunteerName, validate: validateName("Full name") },
      ...(email ? [{ value: email, validate: validateEmail }] : []),
      { value: volunteerPhone, validate: validatePhone },
      { value: volunteerDesc, validate: validateText("Description", 10) },
      { value: volunteerAvail, validate: validateText("Availability", 3) },
    ]);
    if (validationError) {
      showDialog("Check your volunteer details", validationError);
      return;
    }
    if (!volunteerConsent) {
      showDialog("Consent required", "Please consent to be contacted.");
      return;
    }
    if (!selectedOpportunity) {
      showDialog(
        "No volunteer event selected",
        "Choose an available event before submitting your request.",
      );
      return;
    }

    setSubmittingForm("volunteer");
    try {
      await apiRequest(API_ROUTES.volunteerApplications, {
        method: "POST",
        token,
        body: {
          fullName: volunteerName.trim(),
          email: email || null,
          phone: volunteerPhone.trim(),
          initiativeId: selectedOpportunity.initiativeId,
          taskId: volunteerTaskId ? Number(volunteerTaskId) : null,
          contribution: volunteerDesc.trim(),
          availability: volunteerAvail.trim(),
          consent: volunteerConsent,
        },
      });
      clearVolunteerForm();
      showDialog(
        "Volunteer request sent",
        "Your request has been sent for review.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not submit volunteer request",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSubmittingForm(null);
    }
  };

  const selectOption = (setter: (value: string) => void, value: string) => {
    setter(value);
    setOpenSelector(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#111111" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topLabel}>
          GET INVOLVED / {mode === "donation" ? "DONATION" : "VOLUNTEER"}
        </Text>
        <Text style={styles.mainTitle}>
          {mode === "donation" ? "Make a donation." : "Volunteer your time."}
        </Text>
        <Text style={styles.description}>
          {mode === "donation"
            ? "Share goods or make a contribution to support community initiatives."
            : "Offer your time and skills to support an upcoming community initiative."}
        </Text>
      </View>

      {mode === "donation" ? (
      <View style={styles.formContainer}>
        <View style={styles.formChip}>
          <Text style={styles.formChipText}>Donation pledge</Text>
        </View>

        <FormField
          label="Full name *"
          resetKey={donationFormKey}
          value={donateName}
          onChangeText={setDonateName}
          validate={validateName("Full name")}
          showValidation={showValidationFor === "donation"}
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
        />
        <FormField
          label="Email *"
          resetKey={donationFormKey}
          value={donateEmail}
          onChangeText={setDonateEmail}
          keyboardType="email-address"
          validate={validateEmail}
          showValidation={showValidationFor === "donation"}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="name@example.com"
          maxLength={254}
        />
        <FormField
          label="Phone *"
          resetKey={donationFormKey}
          value={donatePhone}
          onChangeText={setDonatePhone}
          keyboardType="phone-pad"
          validate={validatePhone}
          showValidation={showValidationFor === "donation"}
          autoComplete="tel"
          placeholder="082 123 4567 or +27 82 123 4567"
          maxLength={16}
        />

        <SelectField
          label="Event (optional)"
          value={donationInitiativeId}
          options={donationEventOptions}
          expanded={openSelector === "donationEvent"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "donationEvent" ? null : "donationEvent",
            )
          }
          onSelect={(value) => selectOption(setDonationInitiativeId, value)}
        />

        <SelectField
          label="Donation type *"
          value={donationCategory}
          options={["Goods", "Monetary", "School supplies", "Food and essentials"].map(
            (category) => ({ value: category, label: category }),
          )}
          expanded={openSelector === "donationCategory"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "donationCategory" ? null : "donationCategory",
            )
          }
          onSelect={(value) => selectOption(setDonationCategory, value)}
        />

        <FormField
          label="Describe your donation *"
          resetKey={donationFormKey}
          value={donateDesc}
          onChangeText={setDonateDesc}
          validate={validateText("Description", 10)}
          showValidation={showValidationFor === "donation"}
          multiline
          maxLength={1000}
        />
        <FormField
          label="Estimated value in rands (optional)"
          resetKey={donationFormKey}
          value={donateValue}
          onChangeText={setDonateValue}
          validate={validateDonationAmount}
          showValidation={showValidationFor === "donation"}
          keyboardType="decimal-pad"
          placeholder="e.g. 1200.00"
          maxLength={12}
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
          disabled={submittingForm !== null}
          onPress={handleDonateSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitButtonText}>
            {submittingForm === "donation"
              ? "Submitting..."
              : "Submit donation pledge"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.underNotice}>
          Our team will contact you to arrange next steps.
        </Text>
      </View>
      ) : null}

      {mode === "volunteer" ? (
      <View style={styles.formContainer}>
        <View style={styles.formChip}>
          <Text style={styles.formChipText}>Volunteer application</Text>
        </View>

        <SelectField
          label="Event *"
          value={volunteerInitiativeId}
          options={initiativeOptions}
          expanded={openSelector === "volunteerEvent"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "volunteerEvent" ? null : "volunteerEvent",
            )
          }
          onSelect={(value) => {
            setVolunteerInitiativeId(value);
            setVolunteerTaskId("");
            setOpenSelector(null);
          }}
        />
        <SelectField
          label="Task (optional)"
          value={volunteerTaskId}
          options={taskOptions}
          expanded={openSelector === "volunteerTask"}
          onToggle={() =>
            setOpenSelector((current) =>
              current === "volunteerTask" ? null : "volunteerTask",
            )
          }
          onSelect={(value) => selectOption(setVolunteerTaskId, value)}
        />
        {isLoadingOpportunities ? (
          <ActivityIndicator style={styles.opportunityStatus} color="#111111" />
        ) : opportunityError ? (
          <View style={styles.opportunityStatus}>
            <Text style={styles.opportunityError}>{opportunityError}</Text>
            <TouchableOpacity
              onPress={() => setRetryOpportunities((count) => count + 1)}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : volunteerOpportunities.length === 0 ? (
          <Text style={styles.opportunityError}>
            There are no upcoming volunteer events.
          </Text>
        ) : requestedOpportunityUnavailable ? (
          <Text style={styles.opportunityError}>
            This event is not available for volunteering. Choose another event to continue.
          </Text>
        ) : null}

        <FormField
          label="Full name *"
          resetKey={volunteerFormKey}
          value={volunteerName}
          onChangeText={setVolunteerName}
          validate={validateName("Full name")}
          showValidation={showValidationFor === "volunteer"}
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
        />
        <FormField
          label="Email (optional)"
          resetKey={volunteerFormKey}
          value={volunteerEmail}
          onChangeText={setVolunteerEmail}
          keyboardType="email-address"
          validate={validateOptionalEmail}
          showValidation={showValidationFor === "volunteer"}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="name@example.com"
          maxLength={254}
        />
        <FormField
          label="Phone *"
          resetKey={volunteerFormKey}
          value={volunteerPhone}
          onChangeText={setVolunteerPhone}
          keyboardType="phone-pad"
          validate={validatePhone}
          showValidation={showValidationFor === "volunteer"}
          autoComplete="tel"
          placeholder="082 123 4567 or +27 82 123 4567"
          maxLength={16}
        />

        <FormField
          label="Describe how you can help *"
          resetKey={volunteerFormKey}
          value={volunteerDesc}
          onChangeText={setVolunteerDesc}
          validate={validateText("How you can help", 10)}
          showValidation={showValidationFor === "volunteer"}
          multiline
          maxLength={1000}
        />
        <FormField
          label="Availability *"
          resetKey={volunteerFormKey}
          value={volunteerAvail}
          onChangeText={setVolunteerAvail}
          validate={validateText("Availability", 3)}
          showValidation={showValidationFor === "volunteer"}
          maxLength={120}
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
          disabled={submittingForm !== null}
          onPress={handleVolunteerSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitButtonText}>
            {submittingForm === "volunteer"
              ? "Submitting..."
              : "Submit volunteer application"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.underNotice}>
          The team will review your request and confirm your task.
        </Text>
      </View>
      ) : null}

      <Text style={styles.footerFineprint}>
        Required fields marked * · Your details are sent to our team.
      </Text>
    </ScrollView>
    <FeedbackDialog dialog={dialog} onClose={closeDialog} />
    </SafeAreaView>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 12,
  },
  backButtonText: {
    marginLeft: 6,
    color: "#111111",
    fontSize: 13,
    fontWeight: "600",
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
  opportunityStatus: {
    marginVertical: 12,
  },
  opportunityError: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  retryText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
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
  footerFineprint: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 40,
  },
});
