import mongoose, { Document, Model, Schema } from 'mongoose';

// Public shape of an Event when creating documents in code.
export interface EventAttrs {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Stored as ISO date string (YYYY-MM-DD)
  time: string; // Stored as HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Event document type as stored in MongoDB.
export interface EventDocument extends EventAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Event model type for static helpers if needed.
export type EventModel = Model<EventDocument>;

// Helper to generate a URL-friendly slug from the event title.
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumerics with hyphens.
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens.
}

// Normalize a date-like string to an ISO date (YYYY-MM-DD).
function normalizeDateToISO(dateStr: string): string {
  const parsed = new Date(dateStr);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid event date');
  }

  // Only keep the date component (no time zone offset in stored string).
  return parsed.toISOString().split('T')[0];
}

// Normalize time to HH:MM (24h) and validate.
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  // Accept H:MM, HH:MM, H:MM:SS, HH:MM:SS and normalize to HH:MM.
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) {
    throw new Error('Invalid event time format; expected HH:MM (24h)');
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid event time value');
  }

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}

// Basic non-empty string check for required fields.
function ensureNonEmpty(value: string, fieldName: string): void {
  if (!value || !value.trim()) {
    throw new Error(`Field "${fieldName}" is required and cannot be empty`);
  }
}

const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    // Automatically manage createdAt and updatedAt.
    timestamps: true,
  },
);

// Pre-save hook to generate slug, normalize date/time, and validate required data.
EventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    // Validate required string fields at application level for clearer errors.
    ensureNonEmpty(this.title, 'title');
    ensureNonEmpty(this.description, 'description');
    ensureNonEmpty(this.overview, 'overview');
    ensureNonEmpty(this.image, 'image');
    ensureNonEmpty(this.venue, 'venue');
    ensureNonEmpty(this.location, 'location');
    ensureNonEmpty(this.mode, 'mode');
    ensureNonEmpty(this.audience, 'audience');
    ensureNonEmpty(this.organizer, 'organizer');

    if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
      throw new Error('Field "agenda" is required and cannot be empty');
    }

    if (!Array.isArray(this.tags) || this.tags.length === 0) {
      throw new Error('Field "tags" is required and cannot be empty');
    }

    // Only regenerate slug if the title has changed.
    if (this.isModified('title') || !this.slug) {
      this.slug = generateSlug(this.title);
    }

    // Normalize date and time to consistent formats.
    this.date = normalizeDateToISO(this.date);
    this.time = normalizeTime(this.time);

    next();
  } catch (err) {
    next(err as Error);
  }
});

// Re-use existing model in development to avoid OverwriteModelError.
export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ||
  mongoose.model<EventDocument, EventModel>('Event', EventSchema);
