import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pure layout: pay-bills.index.tsx (the search list) and pay-bills.$id.tsx
// (the voucher/confirm flow) are each fully self-contained screens with
// their own AppShell, so this just hands off to whichever one matched —
// same pattern as hustle.tsx.
export const Route = createFileRoute("/pay-bills")({ component: () => <Outlet /> });
