# OnGround.ai Call Centre

A sales call-centre workspace for a field sales rep. It covers the dashboard, lead management, a prioritised call queue, incoming and recent call logs, a simulated calling console, a shared calendar, and the Pulse team chat.

## Technology stack

- React 18 and TypeScript
- Vite 5 build tool
- Tailwind CSS 3 for styling and lucide-react for icons
- react-router-dom 7 for navigation
- recharts for dashboard charts
- Browser LocalStorage for saved records (see Data storage)

## Install and run

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev        # start the app locally
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run build      # production build into dist/
```

## Data storage

All records (leads, calls, incoming calls, calendar events) live in one shared store saved in the browser's LocalStorage under the key `ongroundai_store_v1`. Every page reads from the same store, so a change on one page shows up on the others. Changes survive a page refresh, and other open tabs of the app update automatically.

Pulse chat messages are saved separately under `pulse_messages_v1`.

The project does not run a backend or database server, as requested. Supabase is provisioned for this project but is not used by the app yet. Clearing browser site data resets the app to its sample records.

## Calling and telephony

The calling console is a simulation. Clicking Call opens the call window, requests microphone access for a level check, and runs a timer. No phone connection is made, and the call works even if the microphone is denied. Every call logged this way is marked "Simulated" in the call window, in Recent Calls, and in the dashboard. Simulated calls are counted in call totals but are excluded from connected, conversion, and commission figures.

To connect real calling, a telephony provider such as Twilio or Vonage is needed:

1. Create an account with the provider and buy a phone number that can make outbound calls.
2. Store the provider's account ID, auth token, and phone number as secrets. Do not put them in the front-end code.
3. Build a small server-side endpoint that places the call and returns a call status. The browser cannot hold provider secrets safely.
4. Replace the simulated call logic in the call window with calls to that endpoint and log the real call status and duration.

None of these steps are implemented yet, and no provider credentials are configured.

## Completed functionality

- Dashboard: KPIs (calls today, connected, pipeline, conversion) computed from the store; daily calling progress against a target of 50; waiting leads; earnings and deals for the last seven days; two 7-day charts; tasks that open their leads; recent incoming calls.
- Leads: add, view, edit, and delete leads with validation; search by name, phone, or company; status filter; pagination; ICP, intent, value, and follow-up date. Delete asks for confirmation and unlinks related calls and events.
- Calls to Make: prioritised list, expandable rows, search, status filter, pagination, and call buttons. Logging a call updates the lead's last-touch date and moves New leads to Contacted.
- Incoming Calls: missed, waiting, and queued calls with filters, search, and callback (which queues the call).
- Recent Calls: automatic history with type, customer, date, duration, outcome, and simulated labels; detail view; link to the lead.
- Calendar: month grid, previous and next month, Today, add, edit, and delete events with validation, lead links, colour indicators, and an event detail view.
- Pulse: AvaniBot, agents, channels, and Kudos on the home page; channel messages with timestamps saved locally; the "Needs Your Input" card resolves when a response is chosen.
- Leads modal: opened from tasks, the leads list, search, and calls; ICP and intent scores; expandable buying signals; previous and next navigation with a position counter.
- Global: search across leads, companies, and calls; notification bell listing follow-ups due, missed or waiting incoming calls, and open tasks; toast confirmations and error messages.

## Incomplete functionality and limitations

- Real phone calls are not available (see Calling and telephony).
- Profile, Settings, and Sign out show a notice only. There is no login system.
- Kudos and agent cards on Pulse are display-only sample content.
- Pulse channels are sample channels. You cannot create new ones.
- Data is stored per browser. Records are not shared between users or devices.
- Calls to Make and Incoming Calls use sample data until you add or log real activity.
- Sidebar daily target counts only calls logged today.
- Browser testing could not be performed in this environment. Type checking, lint, and the production build were run; the interface was not exercised in a browser.

## AI tools used

- Bolt (bolt.new) generated and edited the project in this workspace.
- Claude was used to assist with code changes and reviews.

## Checklist

Fully working
- Dashboard KPIs, progress, charts, waiting leads, tasks, earnings
- Lead add, edit, delete, search, status filter, pagination
- Calls to Make list, search, filter, pagination, call logging
- Incoming calls filters, search, callback
- Recent calls history, detail view, lead link
- Calendar navigation, Today, add, edit, delete, indicators, details, lead links
- Leads modal navigation and counter
- Global search and notifications
- Data persistence across refresh

Partially working
- Calling: simulated console with microphone check; no real phone connection
- Pulse: messages and pinned card work; agents, Kudos, and channel creation are display-only
- Profile menu: placeholder notices only

Not implemented
- Real telephony (needs provider account and server endpoint)
- Authentication and per-user data
- Cloud storage through Supabase
