import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";


export async function POST(req: NextRequest) {
    try {
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

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 });
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: "Image file is required" }, { status: 400 });

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) return reject(error);
                resolve(results);
            }).end(buffer);
        })

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        // Log full error server-side; return generic message to client
        console.error('Event creation error:', e);
        return NextResponse.json({ message: "Event creation failed" }, { status: 500 });
    }}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { audience: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      };
    }

    const events = await Event.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      { message: 'Events fetched successfully', events },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Event fetching failed', error },
      { status: 500 }
    );
  }
}
