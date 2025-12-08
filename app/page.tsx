import { Suspense } from "react";
import EventsList from "@/components/EventsList";
import ExploreBtn from "@/components/ExploreBtn";

export default function Page() {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br/> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <Suspense fallback={<div>Loading events...</div>}>
        <EventsList />
      </Suspense>
    </section>
  );
}
