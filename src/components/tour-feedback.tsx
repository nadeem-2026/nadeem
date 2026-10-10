"use client";

import type { BookingMessages, Review, Complaint } from "@/lib/bookings/types";

import { useState } from "react";
import { submitReview, submitComplaint } from "@/lib/bookings/actions";
import type { Locale } from "@/lib/i18n";
import { Star, AlertTriangle } from "lucide-react";

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
      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-4 text-[var(--color-text)]">
        <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-1.5">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <span>{m.review_submitted || "Review Submitted"}</span>
        </h3>
        <div className="flex gap-1 mb-2">
          {[1,2,3,4,5].map(star => (
            <Star
              key={star}
              size={18}
              className={star <= existingReview.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}
            />
          ))}
        </div>
        <p className="text-sm text-emerald-800 dark:text-emerald-300">{existingReview.comment}</p>
      </div>
    );
  }

  if (existingComplaint) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900/50 mt-4 text-[var(--color-text)]">
        <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-1.5">
          <AlertTriangle size={16} className="text-red-500" />
          <span>{m.complaint_submitted || "Complaint Submitted"}</span>
        </h3>
        <p className="text-sm text-red-800 dark:text-red-300">{existingComplaint.reason}</p>
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
      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-4 text-emerald-800 dark:text-emerald-200">
        {success}
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={() => setMode("review")}
          className="flex-1 bg-[var(--color-surface)] border-2 border-[var(--border)] hover:border-[var(--color-primary)] hover:bg-[var(--background-alt)] text-[var(--color-primary)] px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Star size={18} className="text-amber-500 fill-amber-500" />
          <span>{m.leave_review || "Leave a Review"}</span>
        </button>
        <button
          onClick={() => setMode("complaint")}
          className="flex-1 bg-[var(--color-surface)] border-2 border-red-200 dark:border-red-900/40 hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-red-600 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle size={18} className="text-red-500" />
          <span>{m.report_issue || "Report an Issue"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-[var(--border)] rounded-xl p-6 bg-[var(--color-surface)] text-[var(--color-text)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-[var(--color-text)]">
          {mode === "review" ? (m.leave_review || "Leave a Review") : (m.report_issue || "Report an Issue")}
        </h3>
        <button onClick={() => setMode(null)} className="text-[var(--muted)] hover:text-[var(--color-text)] text-sm transition-colors">
          {m.cancel || "Cancel"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50">{error}</div>}

      {mode === "review" ? (
        <form onSubmit={handleReview} className="space-y-4">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={36}
                  className={star <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600 hover:text-amber-300 transition-colors"}
                />
              </button>
            ))}
          </div>
          <div>
            <textarea
              className="w-full border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              rows={4}
              placeholder={m.review_placeholder || "How was your tour? (Optional)"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full button button-primary justify-center font-medium disabled:opacity-50"
          >
            {loading ? "..." : (m.submit || "Submit")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleComplaint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {m.complaint_reason_label || "What went wrong?"}
            </label>
            <textarea
              className="w-full border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg p-3 text-sm focus:outline-none focus:border-red-500"
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
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : (m.submit_complaint || "Submit Complaint")}
          </button>
        </form>
      )}
    </div>
  );
}
