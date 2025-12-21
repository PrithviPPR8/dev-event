'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import EventForm from '@/components/EventForm';

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

  const handleDeleteEvent = async (event: EventItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/events/${event.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove event from state
      setEvents((prev) => prev.filter((e) => e._id !== event._id));
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
                  onClick={() => handleDeleteEvent(event)}
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
    </section>
  );
};

export default AdminDashboardPage;
