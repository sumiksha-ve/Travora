# Travora Phase 14 Security Audit and Hardening Report

**Project:** Travora

**Repository:** `sumiksha-ve/Travora`

**Audit scope:** React/Vite frontend and Spring Boot/PostgreSQL backend security configuration, authentication flow, authorization boundaries, credential handling, cross-origin policy, logging, and booking access controls.

**Conclusion:** The audit identified and remediated five concrete backend security weaknesses without replacing the existing backend architecture or changing the database model. The frontend authentication flow remains JWT-based and unified across roles. The live Spring Boot service was not running during validation, so live HTTP behavior could not be exercised in this sandbox; compile-time and source-level checks passed.

## Findings and disposition

| ID | Finding | Risk | Disposition |
|---|---|---:|---|
| F-01 | Database username and password were committed in `application.properties`. | High | Remediated by environment-based configuration. |
| F-02 | JWT signing key was hardcoded in `JwtService`. | High | Remediated by `TRAVORA_JWT_SECRET`; a non-persistent random key is used only when no secret is configured for local development. |
| F-03 | `DataInitializer` created or reset a known `secureadmin / admin123` account on every startup. | Critical | Remediated. Bootstrap now requires `TRAVORA_ADMIN_USERNAME` and `TRAVORA_ADMIN_PASSWORD`; no default credential is created or reset. |
| F-04 | Debug, SQL, bind-parameter, and request trace logging were enabled by default. | Medium | Remediated by production-safe INFO defaults with opt-in environment overrides. |
| F-05 | `BookingController` allowed wildcard CORS and did not define method-level role restrictions. | High | Remediated. Global explicit-origin CORS is now authoritative, and booking operations have role-level restrictions. |

## Authentication and session review

The application uses a single login page and sends credentials to the existing `/api/auth/login` endpoint. The frontend accepts a session only when the backend returns a token, user ID, username, and one of the supported roles: `EMPLOYEE`, `APPROVER`, `TRAVEL_DESK`, or `ADMIN`. Authenticated API requests attach the JWT as a Bearer token. A `401` response clears the stored session and redirects the user to login, while `403` responses are surfaced as permission errors.

The backend remains stateless and uses Spring Security's `SessionCreationPolicy.STATELESS`. JWT validation is performed by the existing authentication filter. The signing key is now supplied through `TRAVORA_JWT_SECRET` and must be at least 32 bytes. If it is omitted, the backend generates an in-memory key for local development; tokens consequently become invalid after restart. Production deployments must set a stable, high-entropy secret through the environment or secret manager.

The frontend still stores the JWT in browser local storage to preserve the existing persistent-session behavior. This is an accepted residual risk because local storage is readable by JavaScript if an XSS vulnerability is introduced. No unsafe HTML rendering path was found in the application code; the only `dangerouslySetInnerHTML` usage is inside the existing chart library component. A future security phase should consider an HttpOnly, Secure, SameSite cookie session if the backend contract is extended to support it.

## Authorization review

Travel-request ownership is enforced in `TravelRequestService`. Employee reads are restricted to the employee linked to the authenticated user. Non-employee operational roles may access the organization-level request list, and approval decisions use the authenticated username rather than trusting an approver name supplied by the client.

Booking access was tightened as follows:

- `ADMIN`, `APPROVER`, and `TRAVEL_DESK` may read booking records.
- `ADMIN` and `TRAVEL_DESK` may create, update, or cancel bookings.
- Only `ADMIN` may delete bookings.
- The existing service validation still requires a booking to reference an existing approved travel request.

These restrictions are enforced with `@PreAuthorize` in addition to the existing authenticated-request requirement. The frontend role routing remains unchanged and is not treated as the sole security boundary.

## CORS and configuration review

The controller-level `@CrossOrigin(origins = "*")` annotation was removed from `BookingController`. The application now uses the central Spring Security CORS configuration, with origins read from `TRAVORA_CORS_ALLOWED_ORIGINS` and a default of `http://localhost:3000`. Credentials remain enabled only for explicitly configured origins. The production deployment should set this variable to the exact deployed frontend origin or comma-separated list of trusted origins; wildcard origins must not be used with authenticated requests.

Database configuration now uses `TRAVORA_DB_URL`, `TRAVORA_DB_USERNAME`, and `TRAVORA_DB_PASSWORD`. The repository no longer contains the previously committed database credential values. The default schema behavior remains `update` because changing database lifecycle behavior was outside this hardening pass; production database migration policy should be addressed separately.

## Logging and information disclosure review

Spring Security, Spring Web, Hibernate SQL, bind-parameter, and application debug logging were previously enabled in the committed configuration. These settings could expose request details and database values in logs. They now default to INFO, with explicit environment variables available for controlled troubleshooting. SQL logging should remain disabled in production unless a time-bounded incident response requires it.

The application does not log the JWT secret or admin password. The new bootstrap log includes only the configured admin username and never prints credential material.

## Validation evidence

The following checks completed successfully:

- `pnpm check`
- `pnpm build`
- `./mvnw -q -DskipTests package`
- `git diff --check`
- Repository scan for the former database credentials, `admin123`, the former JWT secret, and wildcard booking CORS returned no matches.

The following live checks could not be completed because no process was listening on `localhost:8080` during the audit:

- Live login and JWT issuance.
- Authenticated role-by-role endpoint calls.
- CORS preflight responses.
- Booking create/update/delete calls against PostgreSQL.

The absence of a running backend is a validation limitation, not evidence that those live flows are broken. The compiled backend and frontend source checks passed.

## Deployment requirements after this change

Before starting the backend in a shared or production environment, configure `TRAVORA_DB_URL`, `TRAVORA_DB_USERNAME`, `TRAVORA_DB_PASSWORD`, `TRAVORA_JWT_SECRET`, `TRAVORA_ADMIN_USERNAME`, `TRAVORA_ADMIN_PASSWORD`, and `TRAVORA_CORS_ALLOWED_ORIGINS` through a secret manager or protected environment configuration. The JWT secret and admin password must be rotated independently of source control. Do not place these values in committed properties files, frontend environment variables, browser storage, or logs.

## Changed files

The hardening change modified the following files:

- `backend/src/main/java/com/traveldesk/backend/auth/JwtService.java`
- `backend/src/main/java/com/traveldesk/backend/booking/BookingController.java`
- `backend/src/main/java/com/traveldesk/backend/config/DataInitializer.java`
- `backend/src/main/java/com/traveldesk/backend/config/SecurityConfig.java`
- `backend/src/main/resources/application.properties`
- `SECURITY_AUDIT_PHASE14.md`

## References

[1]: https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html "Spring Security method authorization"

[2]: https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html "Spring Framework CORS configuration"

[3]: https://owasp.org/www-project-top-ten/ "OWASP Top 10 web application security risks"

[4]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html "OWASP Secrets Management Cheat Sheet"

[5]: https://github.com/jwtk/jjwt "JJWT implementation and API documentation"

**Author:** Manus AI

**Audit date:** 2026-09-22

**Status:** Hardening implemented; ready for GitHub synchronization.

[1] [2] [3] [4] [5]

_This report is a source-code audit and build-validation record. It is not a substitute for a production penetration test or infrastructure review._
