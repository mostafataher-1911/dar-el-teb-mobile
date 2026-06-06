import {
  AppointmentRequest,
  appointmentService,
} from "@/services/appointmentService";
import { FavoriteTest } from "@/services/favoritesService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
const LAB_PHONE = "201223649261";

type Props = {
  visible: boolean;
  test: FavoriteTest;
  onClose: () => void;
  onSuccess?: (appointment: AppointmentRequest) => void;
};

export default function AppointmentRequestModal({
  visible,
  test,
  onClose,
  onSuccess,
}: Props) {
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [preferredTime, setPreferredTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const [name, storedPhone] = await AsyncStorage.multiGet([
        "userName",
        "phoneNumber",
      ]);
      if (name[1]) setPatientName(name[1]);
      if (storedPhone[1]) setPhone(storedPhone[1]);
    })();
  }, [visible]);

  const validate = () => {
    if (!patientName.trim()) return "يرجى إدخال الاسم";
    if (!phone.trim() || phone.trim().length < 10)
      return "يرجى إدخال رقم هاتف صحيح";

    return null;
  };

  const resetForm = () => {
    setPreferredDate(new Date());
    setPreferredTime(new Date());
    setNotes("");
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("تنبيه", error);
      return;
    }

    setSubmitting(true);
    try {
      const appointment = await appointmentService.addAppointment({
        testId: test.id,
        testName: test.name,
        patientName: patientName.trim(),
        phone: phone.trim(),
        preferredDate: preferredDate.toISOString().split("T")[0],

        preferredTime: preferredTime.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        notes: notes.trim(),
      });

      resetForm();
      setSubmitting(false);

      Toast.show({
        type: "success",
        text1: "تم تأكيد طلب الحجز",
        text2: "تمت إضافته إلى طلباتي",
        position: "top",
        visibilityTime: 2500,
      });

      onClose();
      onSuccess?.(appointment);
    } catch {
      Alert.alert("خطأ", "تعذر حفظ الطلب. حاول مرة أخرى.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>طلب حجز موعد</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={28} color="#001D3C" />
            </TouchableOpacity>
          </View>

          <Text style={styles.testLabel} numberOfLines={2}>
            {test.name}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>الاسم *</Text>
            <TextInput
              style={styles.input}
              value={patientName}
              onChangeText={setPatientName}
              placeholder="الاسم الكامل"
              textAlign="right"
            />

            <Text style={styles.label}>رقم الهاتف *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="01XXXXXXXX"
              keyboardType="phone-pad"
              maxLength={11}
              textAlign="right"
            />

            <Text style={styles.label}>التاريخ المفضل *</Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {preferredDate.toLocaleDateString("ar-EG")}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={preferredDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    setPreferredDate(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.label}>الوقت المفضل *</Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {preferredTime.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={preferredTime}
                mode="time"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);

                  if (selectedTime) {
                    setPreferredTime(selectedTime);
                  }
                }}
              />
            )}

            <Text style={styles.label}>ملاحظات</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="أي تفاصيل إضافية (اختياري)"
              multiline
              textAlign="right"
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.submitText}>تأكيد طلب الحجز</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("4%"),
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  sheetTitle: {
    fontSize: wp("5.5%"),
    fontWeight: "bold",
    color: "#001D3C",
  },
  testLabel: {
    fontSize: wp("4%"),
    color: "#005FA1",
    textAlign: "right",
    marginBottom: hp("2%"),
    fontWeight: "600",
  },
  label: {
    fontSize: wp("3.8%"),
    color: "#666",
    textAlign: "right",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d7de",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: wp("4%"),
    marginBottom: hp("1.5%"),
    backgroundColor: "#fafbfc",
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005FA1",
    borderRadius: 12,
    paddingVertical: hp("2%"),
    marginTop: hp("1%"),
    gap: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  dateTimeText: {
    fontSize: wp("4%"),
    color: "#001D3C",
    textAlign: "right",
    fontWeight: "600",
  },
});
