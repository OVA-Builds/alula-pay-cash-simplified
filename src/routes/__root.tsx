import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppProvider, STORAGE_KEY } from "@/lib/app-state";

const themeBootScript = `
try {
  var raw = localStorage.getItem('${STORAGE_KEY}');
  var theme = raw ? JSON.parse(raw).theme : null;
  document.documentElement.classList.toggle('dark', theme === 'dark');
} catch (_) {}
`;

// A tab left open across a new deploy is still running the old JS bundle;
// when it then tries to lazy-load a route chunk, that chunk 404s (the old
// build's files are gone) and the dynamic import() rejects. That rejection
// happens outside React's render cycle, so the router's own error boundary
// never sees it — the app just silently stops navigating, stuck wherever it
// was. Catch that specific failure at the window level and hard-reload once
// to pick up the current deploy; sessionStorage stops it from looping if the
// reload doesn't actually fix things (e.g. genuinely offline).
const chunkReloadScript = `
(function () {
  var KEY = 'alula-chunk-reload-once';
  function isChunkLoadError(msg) {
    return typeof msg === 'string' && (
      msg.indexOf('Failed to fetch dynamically imported module') !== -1 ||
      msg.indexOf('error loading dynamically imported module') !== -1 ||
      msg.indexOf('Importing a module script failed') !== -1
    );
  }
  function recover() {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, '1');
    window.location.reload();
  }
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e && e.reason;
    var msg = reason && (reason.message || String(reason));
    if (isChunkLoadError(msg)) recover();
  });
  window.addEventListener('error', function (e) {
    if (isChunkLoadError(e && e.message)) recover();
  }, true);
})();
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alula Pay" },
      { name: "description", content: "Send money, track your side hustle, and grow your savings with Alula Pay." },
      { name: "author", content: "Alula Pay" },
      { property: "og:title", content: "Alula Pay" },
      { property: "og:description", content: "Send money, track your side hustle, and grow your savings with Alula Pay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: chunkReloadScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </QueryClientProvider>
  );
}
