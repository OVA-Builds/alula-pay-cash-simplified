import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pure layout — see hustle.tsx for why this needs to exist at all.
export const Route = createFileRoute("/hustle/mine")({ component: () => <Outlet /> });
