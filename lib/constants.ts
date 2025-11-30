export interface Event {
  id: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    id: "1",
    title: "React Summit 2025",
    image: "/images/event1.png",
    slug: "react-summit-2025",
    location: "Amsterdam, Netherlands",
    date: "June 3-4, 2025",
    time: "09:00 AM",
  },
  {
    id: "2",
    title: "Next.js Conf 2025",
    image: "/images/event2.png",
    slug: "nextjs-conf-2025",
    location: "San Francisco, CA",
    date: "September 23-24, 2025",
    time: "08:30 AM",
  },
  {
    id: "3",
    title: "Web3 Developer Summit",
    image: "/images/event3.png",
    slug: "web3-dev-summit",
    location: "Singapore",
    date: "July 15-17, 2025",
    time: "10:00 AM",
  },
  {
    id: "4",
    title: "JavaScript Annual Hackathon",
    image: "/images/event4.png",
    slug: "js-hackathon-2025",
    location: "Berlin, Germany",
    date: "August 10-11, 2025",
    time: "09:00 AM",
  },
  {
    id: "5",
    title: "TypeScript Advanced Workshop",
    image: "/images/event5.png",
    slug: "typescript-workshop",
    location: "London, UK",
    date: "May 20-21, 2025",
    time: "02:00 PM",
  },
  {
    id: "6",
    title: "Full Stack Development Summit",
    image: "/images/event6.png",
    slug: "fullstack-summit",
    location: "Austin, TX",
    date: "October 8-9, 2025",
    time: "09:00 AM",
  },
];
