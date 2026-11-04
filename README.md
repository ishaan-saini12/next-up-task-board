# Next Up

A calm, responsive Kanban workspace built with React, TypeScript, Vite, Supabase, and dnd-kit.

## Run locally

1. Install Node.js 22 or newer.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and add the Supabase Project URL and publishable key (or legacy anon key).
4. In Supabase, enable **Authentication → Sign In / Providers → Anonymous Sign-ins**.
5. Run `supabase/schema.sql` once in the project's SQL Editor.
6. Run `npm run dev`, then open the printed address.

Without environment configuration, the app runs in a clearly labeled browser-local preview. This preview is for design exploration; the assessment's persistence and isolation requirements use Supabase.

## Build and deploy

Run `npm run build`. Deploy the generated `dist` directory to a static host. For Vercel, import the GitHub repository, select Vite, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the project's environment settings before building. Build command: `npm run build`; output: `dist`. These are browser-public values. Never configure a secret/service-role key in the frontend.

## Features

- Four default columns and drag-and-drop status changes.
- Automatic anonymous sign-in, with session reuse across reloads in the same browser.
- Supabase persistence and owner-only RLS policies for every CRUD operation.
- Task creation, editing, and confirmed deletion.
- Descriptions, priority, due dates, and overdue indicators.
- Title search, priority filter, due-today and completed views.
- Summary counts and completion progress, based on the full board.
- Opt-in example tasks, saved to the current guest's board.
- Optimistic updates, rollback on save failure, explicit loading and empty states.
- Responsive horizontally scrollable columns, a touch drag handle, and a status selector as a non-drag alternative.
- Native task dialog, visible keyboard focus, reduced-motion support, drag announcements.

## Code map

- `src/App.tsx`: page layout, filters, board, and drag coordination.
- `src/components/`: task cards, columns, and task editor.
- `src/hooks/useTasks.ts`: loading and serialized optimistic CRUD.
- `src/lib/supabase.ts`: client setup and anonymous session initialization.
- `src/lib/demo.ts`: example data and browser-local preview storage.
- `src/types.ts`: task model and status definitions.
- `supabase/schema.sql`: constraints, indexes, and RLS policies.

## Design decisions

Warm neutral surfaces, a restrained green accent, readable typography, subtle status colors, and compact cards keep attention on the work. Empty columns remain valid drop targets. Task details live in a dialog to keep the board scannable. Optional example data makes evaluation easy without prepopulating every guest's workspace.

The frontend talks directly to Supabase. Database policies enforce ownership independently of frontend filters. Anonymous users have authenticated sessions; the public API key alone does not grant access to anyone's rows.

Writes are serialized while an optimistic update is pending, avoiding rollback races. This favors predictable behavior over concurrent editing. A failed write restores the previous board and displays an actionable error.

## Verification

Run `npm run build` to check TypeScript and the production bundle.

With the project configured, run `node scripts/check-supabase.mjs` for a live integration check. It creates two temporary anonymous sessions and checks CRUD, persistence through a new request, row isolation, ownership transfer rejection, foreign task modification/deletion, and database validation. It removes the test tasks afterward. The temporary anonymous auth users remain in the Supabase Auth dashboard.

Also verify in the browser: drag cards between columns, reload, create/edit/delete a task, search/filter, test a narrow viewport, and open a separate private window to confirm the empty independent workspace. Test offline save recovery after the board has loaded.

## Tradeoffs and next steps

- A guest workspace belongs to one browser session. Clearing browser data or using another device creates a different workspace. An account-upgrade flow could preserve cross-device access.
- Column status persists; custom ordering within a column is intentionally omitted. Tasks display in creation order.
- Updates appear immediately in the current app and persist on drop. Cross-tab/live subscriptions are outside this scope.
- Team members, comments, and activity history would be the next features, with ownership rules on every related table.
- A public production deployment should configure Supabase's recommended anonymous-signup abuse protection and monitor usage. If CAPTCHA is enabled, add its token flow to anonymous sign-in.
- Google Fonts has system-font fallbacks if unavailable.

## AI assistance

AI assisted with planning, implementation, and verification. The candidate should review the code, validate the deployed app, and be able to explain guest authentication, RLS, optimistic state, and the selected tradeoffs.
