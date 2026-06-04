import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface AppointmentRequest {
  id: string;
  testId: string;
  testName: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
}

const APPOINTMENTS_KEY = "@dar_el_teb_appointments";

async function readStorage(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(APPOINTMENTS_KEY);
  }
  return AsyncStorage.getItem(APPOINTMENTS_KEY);
}

async function writeStorage(value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(APPOINTMENTS_KEY, value);
    return;
  }
  await AsyncStorage.setItem(APPOINTMENTS_KEY, value);
}

function sortByDate(list: AppointmentRequest[]): AppointmentRequest[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const appointmentService = {
  async getAppointments(): Promise<AppointmentRequest[]> {
    try {
      const json = await readStorage();
      if (!json) return [];
      const list = JSON.parse(json) as AppointmentRequest[];
      if (!Array.isArray(list)) return [];
      return sortByDate(list);
    } catch (error) {
      console.error("getAppointments error:", error);
      return [];
    }
  },

  async saveAppointments(list: AppointmentRequest[]): Promise<void> {
    await writeStorage(JSON.stringify(sortByDate(list)));
  },

  async addAppointment(
    data: Omit<AppointmentRequest, "id" | "status" | "createdAt">
  ): Promise<AppointmentRequest> {
    const appointments = await this.getAppointments();
    const entry: AppointmentRequest = {
      ...data,
      testId: data.testId || "unknown",
      id: `${Date.now()}-${data.testId || "test"}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(entry);
    await this.saveAppointments(appointments);

    const saved = await this.getAppointments();
    const found = saved.find((a) => a.id === entry.id);
    if (!found) {
      throw new Error("Failed to persist appointment");
    }
    return found;
  },

  /** Ensures appointment exists in storage (e.g. after navigation param handoff) */
  async ensureAppointment(appointment: AppointmentRequest): Promise<void> {
    const appointments = await this.getAppointments();
    if (appointments.some((a) => a.id === appointment.id)) return;
    appointments.unshift(appointment);
    await this.saveAppointments(appointments);
  },

  async cancelAppointment(id: string): Promise<void> {
    const appointments = await this.getAppointments();
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, status: "cancelled" as const } : a
    );
    await this.saveAppointments(updated);
  },

  buildWhatsAppMessage(appointment: AppointmentRequest): string {
    return (
      `طلب حجز موعد - تطبيق دار الطب\n` +
      `التحليل: ${appointment.testName}\n` +
      `الاسم: ${appointment.patientName}\n` +
      `الهاتف: ${appointment.phone}\n` +
      `التاريخ: ${appointment.preferredDate}\n` +
      `الوقت: ${appointment.preferredTime}\n` +
      (appointment.notes ? `ملاحظات: ${appointment.notes}\n` : "")
    );
  },
};
