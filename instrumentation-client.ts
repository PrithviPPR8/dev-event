import posthog from "posthog-js"

// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//   api_host: "/ingest",
//   ui_host: "https://us.i.posthog.com",
//   defaults: '2025-05-24',
//   capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
//   debug: process.env.NODE_ENV === "development",
// });

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogKey || !posthogHost) {
    throw new Error("PostHog environment variables are missing.");
}

posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2025-05-24'
});