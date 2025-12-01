import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

// Public shape for creating a Booking.
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

// Booking document type as stored in MongoDB.
export interface BookingDocument extends BookingAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

// Simple email validation using a conservative regex.
function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  // Basic RFC-5322 compliant-enough pattern for typical app usage.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // Index for faster lookup by event.
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    // Automatically manage createdAt and updatedAt.
    timestamps: true,
  },
);

// Pre-save hook to validate email and ensure the referenced event exists.
BookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  try {
    if (!this.email || !isValidEmail(this.email)) {
      throw new Error('A valid email address is required');
    }

    // Ensure the referenced Event exists before creating the booking.
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error('Referenced event does not exist');
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

// Re-use existing model in development to avoid OverwriteModelError.
export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ||
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema);
