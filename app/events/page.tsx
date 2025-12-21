'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

type EventItem = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  audience: string;
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `/api/events?search=${encodeURIComponent(debouncedSearch)}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearch]);



  return (
    <section className="px-8 py-6">
      <h1 className="mb-8">All Events</h1>

      <div className="relative mb-6 w-full max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          placeholder="Search events by title, audience, or tags"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded pl-12 pr-3 py-2"
        />
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-6 font-medium border-b px-4 py-2">
          <span className="col-span-2">Event</span>
          <span>Date</span>
          <span>Time</span>
          <span className="col-span-2">Audience</span>
        </div>

        {loading ? (
          <p className="p-4">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="p-4">No events found.</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="grid grid-cols-6 items-center px-4 py-3 border-b"
            >
              <a
                href={`/events/${event.slug}`}
                className="col-span-2 underline"
              >
                {event.title}
              </a>

              <span>{event.date}</span>
              <span>{event.time}</span>

              <span className="col-span-2 text-sm text-neutral-400">
                {event.audience}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default EventsPage;
