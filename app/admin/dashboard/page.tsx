'use client';

import { useEffect, useState } from 'react';

type EventItem = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
};

const AdminDashboardPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', {
          cache: 'no-store',
        });
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [])

  return (
    <section className="px-8 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 >Admin Dashboard</h1>

        <button className="border px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button className="bg-black text-white border px-4 py-2 rounded">
          + Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="border rounded-lg">
        <div className="grid grid-cols-5 font-medium border-b px-4 py-2">
          <span className="col-span-2">Event</span>
          <span>Date</span>
          <span>Time</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <p className="p-4">Loading events...</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="grid grid-cols-5 items-center px-4 py-3 border-b"
            >
              <a
                href={`/events/${event.slug}`}
                className="col-span-2 underline"
                target="_blank"
              >
                {event.title}
              </a>
              <span>{event.date}</span>
              <span>{event.time}</span>

              <div className="flex gap-2">
                <button className="text-sm underline">Edit</button>
                <button className="text-sm text-red-600 underline">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
