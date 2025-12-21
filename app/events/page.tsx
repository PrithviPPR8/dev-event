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

      <input
        type="text"
        placeholder="Search events by title, audience, or tags"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-md border px-3 py-2 rounded"
      />

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
