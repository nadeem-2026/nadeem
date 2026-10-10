"use client";

import type { BookingMessages } from "@/lib/bookings/types";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createBrowserClient as createClient } from "@/lib/auth/client";

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

export function LiveLocationTracker({ bookingId, m }: { bookingId: string, m: BookingMessages }) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState("");
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [channel]);

  const toggleBroadcast = async () => {
    if (isBroadcasting) {
      if (channel) await channel.unsubscribe();
      setChannel(null);
      setIsBroadcasting(false);
      return;
    }

    if (!navigator.geolocation) {
      setError(m.geolocation_not_supported || "Geolocation is not supported by your browser");
      return;
    }

    const supabase = createClient();
    const newChannel = supabase.channel(`location:${bookingId}`);

    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsBroadcasting(true);
        
        // Start watching position
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            newChannel.send({
              type: "broadcast",
              event: "location",
              payload: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: position.timestamp
              }
            });
          },
          (err) => {
            setError(err.message);
            setIsBroadcasting(false);
            newChannel.unsubscribe();
          },
          { enableHighAccuracy: true }
        );

        // cleanup function for this specific subscribe
        return () => navigator.geolocation.clearWatch(watchId);
      }
    });

    setChannel(newChannel);
  };

  return (
    <div className="bg-white border rounded-xl p-4 mt-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isBroadcasting ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
          <MapPinIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">
            {isBroadcasting ? (m.broadcasting_location || "Broadcasting Location...") : (m.share_live_location || "Share Live Location")}
          </h4>
          <p className="text-xs text-gray-500">
            {isBroadcasting ? (m.tourist_can_see_location || "The tourist can see your live location") : (m.share_location_desc || "Help the tourist find you easily")}
          </p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
      <button 
        onClick={toggleBroadcast}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isBroadcasting 
            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60' 
            : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--btn-primary-hover-bg)]'
        }`}
      >
        {isBroadcasting ? (m.stop || "Stop") : (m.start || "Start")}
      </button>
    </div>
  );
}

export function LiveLocationViewer({ bookingId, m }: { bookingId: string, m: BookingMessages }) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`location:${bookingId}`);

    channel.on(
      'broadcast',
      { event: 'location' },
      ({ payload }) => {
        setLocation(payload);
      }
    ).subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [bookingId]);

  if (!location) {
    return (
      <div className="bg-[var(--background-alt)] border border-dashed border-[var(--border)] rounded-xl p-4 mt-4 flex items-center justify-center text-sm text-[var(--muted)]">
        <MapPinIcon className="w-5 h-5 mr-2 opacity-50" />
        {m.waiting_for_location || "Waiting for guide's live location..."}
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-full animate-pulse">
          <MapPinIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-blue-900">{m.guide_is_broadcasting || "Guide is broadcasting location"}</h4>
          <p className="text-xs text-blue-700">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
        </div>
      </div>
      <a 
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {m.open_in_maps || "Open in Maps"}
      </a>
    </div>
  );
}
