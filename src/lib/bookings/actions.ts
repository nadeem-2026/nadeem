"use server";

import { authClient, requireAccount } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n";

export async function createBooking(formData: FormData) {
  const client = await authClient();
  if (!client) {
    return { success: false, message: "Not authenticated" };
  }

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // Double check role
  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "tourist") {
    return { success: false, message: "Only tourists can book tours" };
  }

  const { data, error } = await client.rpc("request_booking", {
    p_guide_id: formData.get("guide_id"),
    p_start_time: formData.get("start_time"),
    p_duration: Number(formData.get("duration_hours")),
    p_participants: Number(formData.get("participants")),
    p_meeting_point: formData.get("meeting_point"),
  });
  if (error) return { success: false, message: bookingError(error.message) };
  revalidatePath("/[locale]/account", "layout");
  return { success: true, bookingId: data };
}

function bookingError(message: string) {
  if (message.includes("minimum_notice")) return "الحجز قبل 24 ساعة على الأقل / Book at least 24 hours ahead.";
  if (message.includes("outside_availability")) return "الموعد خارج توفر المرشد / Outside guide availability.";
  if (message.includes("capacity_exceeded")) return "عدد المشاركين يتجاوز السعة / Capacity exceeded.";
  if (message.includes("booking_conflict")) return "الموعد محجوز أو ضمن الفاصل بين الجولات / Time conflicts with another reservation.";
  if (message.includes("request_expired")) return "انتهت مهلة الطلب / Request expired.";
  return "تعذر تنفيذ الطلب؛ تحقق من البيانات وحالة الحجز / Request could not be completed.";
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const client = await authClient();
  if (!client) return { success: false, message: "Not authenticated" };
  if (!["awaiting_payment", "declined", "cancelled"].includes(status)) return { success: false, message: "Invalid transition" };
  const { error } = await client.rpc("change_booking_status", { p_booking_id: bookingId, p_status: status });
  if (error) return { success: false, message: bookingError(error.message) };
  revalidatePath("/[locale]/account", "layout");
  return { success: true };
}

export async function startTour(id: string, otp: string, locale: Locale) {
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "guide") return { error: "Unauthorized" };

  const { data, error } = await client.rpc("start_tour", {
    p_booking_id: id,
    p_otp: otp
  });

  if (error || !data) {
    console.error(error);
    return { error: "Invalid OTP or booking cannot be started" };
  }

  revalidatePath("/[locale]/account", "layout");
  revalidatePath("/[locale]/bookings/[id]", "page");
  return { success: true };
}

export async function endTour(id: string, locale: Locale) {
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "guide") return { error: "Unauthorized" };

  const { data, error } = await client.rpc("end_tour", {
    p_booking_id: id
  });

  if (error || !data) {
    console.error(error);
    return { error: "Failed to end tour" };
  }

  revalidatePath("/[locale]/account", "layout");
  revalidatePath("/[locale]/bookings/[id]", "page");
  return { success: true };
}

export async function submitReview(bookingId: string, rating: number, comment: string, locale: Locale) {
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "tourist") return { error: "Unauthorized" };

  const { data: booking } = await client.from("bookings").select("guide_id, status").eq("id", bookingId).single();
  if (!booking || booking.status !== "completed") return { error: "Booking not completed" };

  const { error } = await client.from("reviews").insert({
    booking_id: bookingId,
    tourist_id: profile.id,
    guide_id: booking.guide_id,
    rating,
    comment
  });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/bookings/[id]", "page");
  return { success: true };
}

export async function submitComplaint(bookingId: string, reason: string, locale: Locale) {
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "tourist") return { error: "Unauthorized" };

  const { data: booking } = await client.from("bookings").select("guide_id, status").eq("id", bookingId).single();
  if (!booking || !["in_progress", "completed"].includes(booking.status)) return { error: "Invalid booking status" };

  const { error } = await client.from("complaints").insert({
    booking_id: bookingId,
    tourist_id: profile.id,
    guide_id: booking.guide_id,
    reason
  });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/bookings/[id]", "page");
  return { success: true };
}
