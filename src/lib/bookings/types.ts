import type { bookingsMessages } from "@/content/bookings";
export type BookingMessages = ReturnType<typeof bookingsMessages>;
export type Booking = {
  id: string; status: keyof BookingMessages["status"]; start_time: string;
  duration_hours: number; participants: number; meeting_point: string; total_price: number;
  tourist?: { display_name: string } | null; guide?: { display_name: string } | null;
};
export type Earning = { id: string; booking_id: string; guide_amount: number; platform_fee: number; status: string };
export type Review = { rating: number; comment: string | null };
export type Complaint = { id: string; reason: string; status: string; tourist?: { display_name: string } | null; guide?: { display_name: string } | null; bookings: { start_time: string } | null };
