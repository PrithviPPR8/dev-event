import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Event, { IEvent } from '@/database/event.model';
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";


// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectToDatabase();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug (remove any potential malicious input)
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query events by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle events not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response with events data
    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching events by slug:', error);
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Handle database connection errors
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { message: 'Database configuration error' },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: 'Failed to fetch events', error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


/**
 * PUT /api/events/[slug]
 * Update an existing event (Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 🔐 Admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    // Get slug
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { message: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const existingEvent = await Event.findOne({ slug });
    if (!existingEvent) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const updates = Object.fromEntries(formData.entries());

    // Parse agenda & tags
    const agenda = JSON.parse(formData.get("agenda") as string);
    const tags = JSON.parse(formData.get("tags") as string);

    // 🖼️ Image upload (optional)
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as { secure_url: string });
            }
          ).end(buffer);
        }
      );

      updates.image = uploadResult.secure_url;
    }

    // Apply updates
    Object.assign(existingEvent, {
      ...updates,
      agenda,
      tags,
    });

    await existingEvent.save();

    return NextResponse.json(
      { message: "Event updated successfully", event: existingEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { message: "Event update failed" },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/events/[slug]
 * Delete an event (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 🔐 Admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    // Get slug
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { message: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const event = await Event.findOne({ slug });
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    await event.deleteOne();

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json(
      { message: "Event deletion failed" },
      { status: 500 }
    );
  }
}

