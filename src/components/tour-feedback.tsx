"use client";

import type { BookingMessages, Review, Complaint } from "@/lib/bookings/types";

import { useState } from "react";
import { submitReview, submitComplaint } from "@/lib/bookings/actions";
import type { Locale } from "@/lib/i18n";
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const StarIconSolid = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

export function TourFeedback({ bookingId, m, locale, existingReview, existingComplaint }: {
  bookingId: string;
  m: BookingMessages;
  locale: Locale;
  existingReview?: Review | null;
  existingComplaint?: Complaint | null;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [complaintReason, setComplaintReason] = useState("");

  const [mode, setMode] = useState<"review" | "complaint" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (existingReview) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
        <h3 className="font-semibold text-green-900 mb-2">⭐ {m.review_submitted || "Review Submitted"}</h3>
        <div className="flex gap-1 mb-2">
          {[1,2,3,4,5].map(star => (
            <StarIconSolid key={star} className={`w-5 h-5 ${star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <p className="text-sm text-green-800">{existingReview.comment}</p>
      </div>
    );
  }

  if (existingComplaint) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
        <h3 className="font-semibold text-red-900 mb-2">⚠️ {m.complaint_submitted || "Complaint Submitted"}</h3>
        <p className="text-sm text-red-800">{existingComplaint.reason}</p>
      </div>
    );
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(m.please_select_rating || "Please select a rating");
      return;
    }
    setLoading(true);
    setError("");
    const res = await submitReview(bookingId, rating, comment, locale);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(m.review_success || "Thank you for your feedback!");
      setMode(null);
    }
    setLoading(false);
  };

  const handleComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintReason.trim()) {
      setError(m.please_enter_reason || "Please enter a reason");
      return;
    }
    setLoading(true);
    setError("");
    const res = await submitComplaint(bookingId, complaintReason, locale);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(m.complaint_success || "Complaint submitted. We will review it shortly.");
      setMode(null);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4 text-green-800">
        {success}
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={() => setMode("review")}
          className="flex-1 bg-white border-2 border-primary/20 hover:border-primary text-primary px-4 py-3 rounded-xl font-medium transition-colors"
        >
          ⭐ {m.leave_review || "Leave a Review"}
        </button>
        <button
          onClick={() => setMode("complaint")}
          className="flex-1 bg-white border-2 border-red-200 hover:border-red-500 text-red-600 px-4 py-3 rounded-xl font-medium transition-colors"
        >
          ⚠️ {m.report_issue || "Report an Issue"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-xl p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          {mode === "review" ? (m.leave_review || "Leave a Review") : (m.report_issue || "Report an Issue")}
        </h3>
        <button onClick={() => setMode(null)} className="text-gray-400 hover:text-gray-600 text-sm">
          {m.cancel || "Cancel"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}

      {mode === "review" ? (
        <form onSubmit={handleReview} className="space-y-4">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                {star <= (hoverRating || rating) ? (
                  <StarIconSolid className="w-10 h-10 text-yellow-400" />
                ) : (
                  <StarIcon className="w-10 h-10 text-gray-300 hover:text-yellow-200" />
                )}
              </button>
            ))}
          </div>
          <div>
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
              placeholder={m.review_placeholder || "How was your tour? (Optional)"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "..." : (m.submit || "Submit")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleComplaint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {m.complaint_reason_label || "What went wrong?"}
            </label>
            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:border-red-500 focus:ring-red-500"
              rows={4}
              required
              placeholder={m.complaint_placeholder || "Please describe the issue..."}
              value={complaintReason}
              onChange={(e) => setComplaintReason(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "..." : (m.submit_complaint || "Submit Complaint")}
          </button>
        </form>
      )}
    </div>
  );
}
