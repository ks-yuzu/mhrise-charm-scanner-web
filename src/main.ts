import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://ae96a41629e040f59f30ad89eb99d4f2@o1178530.ingest.sentry.io/6290379",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0, // 1.0 -> 100%
})


import App from './App.svelte';
const app = new App({
	target: document.body,
	props: {
		// name: 'world'
	}
});

export default app;
