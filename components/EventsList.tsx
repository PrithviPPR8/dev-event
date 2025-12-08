import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default async function EventsList() {
  const response = await fetch(`${BASE_URL}/api/events`, {
    next: { revalidate: 60 } // caching recommended but optional
  });

  const { events } = await response.json();

  return (
    <div className="mt-20 space-y-7">
      <h3>Featured Events</h3>

      <ul className="events">
        {events?.length > 0 &&
          events.map((event: IEvent) => (
            <li key={event.title} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
      </ul>
    </div>
  );
}
