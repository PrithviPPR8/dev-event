'use client';

import { useState } from 'react';

type EventFormProps = {
  initialData?: any; // used later for edit
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

const EventForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: EventFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [overview, setOverview] = useState(initialData?.overview || '');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [mode, setMode] = useState(initialData?.mode || 'online');
  const [audience, setAudience] = useState(initialData?.audience || '');
  const [organizer, setOrganizer] = useState(initialData?.organizer || '');
  const [agenda, setAgenda] = useState(
    initialData?.agenda?.join('\n') || ''
  );
  const [tags, setTags] = useState(
    initialData?.tags?.join('\n') || ''
  );
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('overview', overview);
    formData.append('venue', venue);
    formData.append('location', location);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('mode', mode);
    formData.append('audience', audience);
    formData.append('organizer', organizer);

    // Convert multiline → array
    const agendaArray = agenda
      .split('\n')
      .map((item: string) => item.trim())
      .filter(Boolean);

    const tagsArray = tags
      .split('\n')
      .map((item: string) => item.trim())
      .filter(Boolean);

    formData.append('agenda', JSON.stringify(agendaArray));
    formData.append('tags', JSON.stringify(tagsArray));

    if (image) {
      formData.append('image', image);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-neutral-300">Event Title</label>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-3 py-2 rounded"
        required
      />

      <label className="text-sm text-neutral-300">Event Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border px-3 py-2 rounded"
        rows={3}
        required
      />

      <label className="text-sm text-neutral-300">Overview</label>
      <textarea
        placeholder="Overview"
        value={overview}
        onChange={(e) => setOverview(e.target.value)}
        className="border px-3 py-2 rounded"
        rows={3}
        required
      />

      <label className="text-sm text-neutral-300">Event Venue</label>
      <input
        type="text"
        placeholder="Venue"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        className="border px-3 py-2 rounded"
        required
      />

      <label className="text-sm text-neutral-300">Event Location</label>
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border px-3 py-2 rounded"
        required
      />

      <label className="text-sm text-neutral-300">Event Date</label>
      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />

        <label className="text-sm text-neutral-300">Event Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />
      </div>

      <label className="text-sm text-neutral-300">Mode of Event</label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        <option value="online" className='bg-neutral-900 text-white'>
          Online
        </option>
        <option value="offline" className='bg-neutral-900 text-white'>
          Offline
          </option>
        <option value="hybrid" className='bg-neutral-900 text-white'>
          Hybrid
        </option>
      </select>

      <label className="text-sm text-neutral-300">Type of audience</label>
      <input
        type="text"
        placeholder="Audience"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        className="border px-3 py-2 rounded"
        required
      />

      <label className="text-sm text-neutral-300">Event Agenda</label>
      <textarea
        placeholder="Agenda (one item per line). Example - 08:45 AM - 09:45 AM | Keynote: AI in Cyber Defense"
        value={agenda}
        onChange={(e) => setAgenda(e.target.value)}
        className="border px-3 py-2 rounded"
        rows={4}
        required
      />

      <label className="text-sm text-neutral-300">Tags</label>
      <textarea
        placeholder="Tags (one per line). Exmplae - React, Next.js, Frontend, Cloud, Security, etc"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="border px-3 py-2 rounded"
        rows={3}
        required
      />

      <label className="text-sm text-neutral-300">Event Organizer</label>
      <textarea
        placeholder="Organizer info"
        value={organizer}
        onChange={(e) => setOrganizer(e.target.value)}
        className="border px-3 py-2 rounded"
        rows={3}
        required
      />

      <label className="text-sm text-neutral-300">Event Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        required={!initialData}
        className="
          file:mr-4 
          file:py-2 
          file:px-4 
          file:rounded 
          file:border-0 
          file:bg-neutral-800 
          file:text-white 
          file:cursor-pointer
          file:hover:bg-neutral-700
          text-neutral-400
          cursor-pointer
        "
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
        >
          {loading ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
