# Travora inspection notes

## Specifications

File 2 (`/home/ubuntu/upload/pasted_content_2.txt`) and the newly attached File 2 copy (`/home/ubuntu/upload/Pastedtext(4).txt`) contain the same primary/current implementation specification. File 1 (`/home/ubuntu/upload/pasted_content.txt`) remains the broader product/UI specification. Reconcile them by preserving the existing Travora visual system and adding incremental auth, protected routes, role access, and persistent light/dark theme.

## GitHub source inspected

Repository requested by user: https://github.com/sumiksha-ve/Travora.git
Latest `main` commit inspected: `dda720c4ce4edc80b59145c11bd4cb1acbb9de37`.
It contains `frontend/` and `backend/`.

## Backend contract observed

- Auth endpoint: `POST /api/auth/login`; request body `{ username, password }`.
- Login response: `{ token, id, username, role, employeeId }`.
- Roles: `ADMIN`, `EMPLOYEE`, `APPROVER`, `TRAVEL_DESK`.
- Existing backend uses Spring Security, stateless JWT, BCrypt, and `Authorization: Bearer <token>`.
- Travel requests: `GET/POST /api/travel-requests`, `GET /api/travel-requests/{id}`.
- Create request body uses `tripType`, `fromLocation`, `toLocation`, `travelDate`, `returnDate`, `projectName`, `reason`; for `EMPLOYEE`, the backend derives employee from authenticated user and ignores any employee ID in the body.
- Approvals: `PATCH /api/travel-requests/{id}/approve` or `/reject`, body `{ approverName, comment }`; service derives approver from authenticated username.
- Booking endpoints: `/api/bookings`, `/api/bookings/{id}`, `/api/bookings/travel-request/{travelRequestId}`, `/api/bookings/{id}/cancel`.
- Travel request statuses in backend: `PENDING`, `APPROVED`, `REJECTED`, `BOOKED`, `CANCELLED`.
- Backend CORS currently allows `http://localhost:5173`; managed preview is separate and should be configured in deployment/backend separately, not by modifying backend here.

## Frontend changes implemented so far

- `client/src/contexts/ThemeContext.tsx`: persistent `travora_theme`, system preference fallback, document class/color scheme, toggle hook.
- `client/index.html`: no-flash theme bootstrap script and Travora fonts/metadata.
- `client/src/lib/api.ts`: centralized API/auth layer aligned to inspected backend contract, friendly 401/403/network/server handling, `travora_token` and `travora_user` persistence.
- `client/src/App.tsx`: one login page with backend auth, password visibility toggle, protected route redirects, role derived from authenticated user, no login role selector, authenticated logout, theme toggle in topbar/login, Plan a Trip posts to real backend, employee dashboard/journeys use live `/api/travel-requests` data and empty/loading/error states.
- `client/src/index.css`: dark theme tokens and component overrides added without changing the existing layout/typography/animation system.

## Verification so far

- `pnpm check` passes.
- `pnpm build` passes; Vite emits only the existing chunk-size warning.
- Visual preview verified logged-out `/` redirects to `/login`.
- Browser verified light/dark toggle on login page, show/hide password, and friendly network error when backend is unavailable.
