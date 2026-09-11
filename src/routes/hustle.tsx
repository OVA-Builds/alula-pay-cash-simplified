import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pure layout: every /hustle/* leaf route (hustle.index.tsx, hustle.goals.tsx,
// etc.) is a fully self-contained screen with its own AppShell, so this just
// needs to hand off to whichever one matched.
export const Route = createFileRoute("/hustle")({ component: () => <Outlet /> });
