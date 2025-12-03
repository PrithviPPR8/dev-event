import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {

  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { event } = await request.json();

  if(!event) return notFound();

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>
    </section>
  )
}

export default EventDetailsPage