'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import EventForm from '@/components/EventForm';
import { useDebounce } from '@/hooks/useDebounce';

type EventItem = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
};

const AdminDashboardPage = () => {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
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


  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: "POST",
      });

      //Force full navigation
      window.location.href = '/admin/login';
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  const handleCreateEvent = async (formData: FormData) => {
    try {
      setFormLoading(true);

      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to create event');
      }

      setIsModalOpen(false);
      window.location.reload(); // simple refresh for now
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditEvent = async (formData: FormData) => {
    if (!selectedEvent) return;

    try {
      setFormLoading(true);

      const res = await fetch(`/api/events/${selectedEvent.slug}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to update event');
      }

      const updated = await res.json();

      // Update dashboard list without reload
      setEvents((prev) =>
        prev.map((e) =>
          e._id === updated.event._id ? updated.event : e
        )
      );

      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const res = await fetch(`/api/events/${eventToDelete.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove from UI
      setEvents((prev) =>
        prev.filter((e) => e._id !== eventToDelete._id)
      );

      setEventToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete event');
    }
  };

  return (
    <section className="px-8 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1>Admin Dashboard</h1>

        <button 
          onClick={handleLogout}
          className="border px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white border px-4 py-2 rounded cursor-pointer"
        >
          + Create Event
        </button>
      </div>

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
                <button 
                  className="text-sm underline cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setMode('edit');
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-600 underline cursor-pointer"
                  onClick={() => setEventToDelete(event)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        title={mode === 'create' ? 'Create Event' : 'Edit Event'}
      >
        <EventForm
          initialData={mode === 'edit' ? selectedEvent : undefined}
          onSubmit={mode === 'create' ? handleCreateEvent : handleEditEvent}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Delete Event"
      >
        <div className="flex flex-col gap-4">
          <p className="text-neutral-300">
            Are you sure you want to delete
            <span className="font-semibold text-white">
              {" "}{eventToDelete?.title}
            </span>
            ?
          </p>

          <p className="text-sm text-neutral-400">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setEventToDelete(null)}
              className="border px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={confirmDeleteEvent}
              className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default AdminDashboardPage;
