"use server";

import { authClient, requireAccount } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n";
import { sendNotification } from "@/lib/notifications";

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

  const guide_id = formData.get("guide_id") as string;
  const start_time = formData.get("start_time") as string; // expected ISO string
  const duration_hours = parseInt(formData.get("duration_hours") as string, 10);
  const participants = parseInt(formData.get("participants") as string, 10);
  const meeting_point = formData.get("meeting_point") as string;

  if (!guide_id || !start_time || !duration_hours || !participants || !meeting_point) {
    return { success: false, message: "Missing required fields" };
  }

  // Calculate end time
  const startDate = new Date(start_time);
  const endDate = new Date(startDate.getTime() + duration_hours * 60 * 60 * 1000);

  // Fetch guide hourly rate to compute total price securely on the server
  const { data: guideProfile } = await client
    .from("guide_profiles")
    .select("hourly_rate, max_participants")
    .eq("user_id", guide_id)
    .single();

  if (!guideProfile) {
    return { success: false, message: "Guide not found" };
  }

  if (participants > guideProfile.max_participants) {
    return { success: false, message: `Participants exceed maximum limit of ${guideProfile.max_participants}` };
  }

  const total_price = guideProfile.hourly_rate * duration_hours;

  const { error } = await client.from("bookings").insert({
    tourist_id: user.id,
    guide_id,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    duration_hours,
    participants,
    meeting_point,
    total_price,
    status: "pending"
  });

  if (error) {
    console.error("Booking error:", error);
    // Handle specific gist exclusion error if possible
    if (error.code === '23P01') {
      return { success: false, message: "The guide is already booked for this time." };
    }
    return { success: false, message: error.message };
  }

  // Send notification to the guide
  try {
    const { data: guideUser } = await client.from("profiles").select("email").eq("id", guide_id).single();
    await sendNotification({
      userId: guide_id,
      title: "New Booking Request 📅",
      body: `You have a new booking request for ${participants} participants.`,
      link: `/en/account`,
      email: guideUser?.email
    });
  } catch (err) {
    console.error("Failed to notify guide:", err);
  }

  revalidatePath("/[locale]/account", "layout");
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const client = await authClient();
  if (!client) return { success: false, message: "Not authenticated" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };

  // Fetch booking to verify ownership and role rules
  const { data: booking, error: fetchError } = await client
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, message: "Booking not found" };
  }

  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  // Authorization and State Machine
  if (role === "guide") {
    if (booking.guide_id !== user.id) return { success: false, message: "Unauthorized" };
    // Guide can only move from pending -> awaiting_payment or pending -> declined
    if (booking.status !== "pending") return { success: false, message: "Invalid state transition" };
    if (status !== "awaiting_payment" && status !== "declined") {
      return { success: false, message: "Guides can only accept or decline pending bookings" };
    }
  } else if (role === "tourist") {
    if (booking.tourist_id !== user.id) return { success: false, message: "Unauthorized" };
    // Tourist can cancel if pending or awaiting_payment
    if (status === "cancelled") {
      if (booking.status !== "pending" && booking.status !== "awaiting_payment") {
        return { success: false, message: "Cannot cancel a confirmed booking" };
      }
    } else {
      return { success: false, message: "Tourists can only cancel bookings right now" };
    }
  } else {
    return { success: false, message: "Invalid role" };
  }

  const { error: updateError } = await client
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  if (role === "guide") {
    // Notify the tourist
    try {
      const { data: touristProfile } = await client.from("profiles").select("email").eq("id", booking.tourist_id).single();
      const title = status === "awaiting_payment" ? "Booking Accepted! 🎉" : "Booking Declined ❌";
      const body = status === "awaiting_payment" 
        ? "Your guide has accepted the request. Please proceed to payment to confirm."
        : "Unfortunately, the guide could not accept your request.";
      await sendNotification({
        userId: booking.tourist_id,
        title,
        body,
        link: `/en/bookings/${bookingId}`,
        email: touristProfile?.email
      });
    } catch (err) {
      console.error("Failed to notify tourist:", err);
    }
  }

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
