Phase 2 — Security, Observability, UX polish, and CI/CD gates

Objectives
- Harden data handling and privacy across JS/TS and native layers.
- Expand production observability with cautious telemetry hooks (no PII) and optional crash telemetry scaffolding.
- Polish the user experience for VPN flows (clear error banners, retry mechanisms, and consistent loading indicators).
- Strengthen CI/CD with type-checks, linting, unit/UI tests, and gatekeeping for release readiness.

Scope
- Applies to the Android release path (Gradle, signing, manifest, foreground service lifecycle) and the React Native UI flow.
- Integrates telemetry scaffolding and a safe, extensible observability model.
- Introduces CI gates to run type checks and tests prior to APK build.

Deliverables
- Release_Phase2.md documenting Phase 2 goals, milestones, acceptance criteria, and dependencies.
- Expanded telemetry hooks and a small telemetry consumer to emit non-PII VPN events.
- UI changes to support error banners and loading indicators for VPN actions.
- CI workflow updates to run TypeScript checks and unit/UI tests, in addition to the signing/build steps.

Proposed tasks

1) Telemetry expansion and non-PII observability (Phase 2)
- Extend the telemetry surface with events such as vpn_connect, vpn_disconnect, vpn_error, vpn_list_countries.
- Use ProdTelemetry.ts (or enhanced Telemetry module) to record events in key orchestrator paths (listCountries, connectToCountry, disconnect).
- Ensure telemetry is a no-op in non-production builds or gated behind a feature flag.

Files to modify/add
- Modify src/vpn/VpnOrchestrator.ts to emit telemetry events where appropriate (vpn_list_countries, vpn_connect) using track from ProdTelemetry.
- Extend src/utils/ProdTelemetry.ts to expose additional event shapes, if needed.
- Optionally add a new ProdTelemetry_Extended.ts for future analytics integrations.

2) UX polish (App and native)
- Add user-facing error banners with retry options for VPN failures and timeouts.
- Improve loading indicators around connect/disconnect actions to reflect progress.
- Ensure foreground notification remains informative and stable across OS versions.

Files to modify
- App.tsx: render conditional error banners with a Retry button; show a spinner or progress indicator during connect/disconnect.
- HaloVpnForegroundService.java: adjust notification text/description only if needed for clarity, keeping CATEGORY_SERVICE.

3) Testing (Phase 2)
- Add unit tests for VpnOrchestrator flows using a mocked VPN client.
- Add basic UI tests scaffolding to cover connect/disconnect and country list rendering.
- Ensure TypeScript type-check runs cleanly in CI.

Files to modify/add
- src/__tests__/VpnOrchestrator.test.ts (or similar)
- Update/package.json: ensure npm test runs a type-check (if not already present)

4) CI/CD gates (Phase 2)
- Extend android/.github/workflows/android-release.yml to include a TypeScript type-check step before the Android build.
- Optionally run lint steps if a linter exists.
- Keep signing/build steps intact and ensure artifacts are published only after tests pass.

5) Documentation (Phase 2)
- Create android/Release_Phase2.md detailing Phase 2 goals, milestones, acceptance criteria, and how to verify.
- Update android/Release.md with Phase 2 summary and any gating requirements.

Phase 2 acceptance criteria
- TypeScript type-check passes in CI (no compilation errors in TS/JS files).
- VPN telemetry hooks compile and are guarded (no data leakage; safe to enable later).
- UX improvements render correctly without regressions.
- CI workflow runs TS checks and tests, in addition to signing and APK build.
- ProdLogger remains the primary production log path; no PII exposures in logs.

Next steps
- I will implement Phase 2 edits once you confirm. This includes adding Release_Phase2.md, implementing telemetry expansions in VpnOrchestrator, adding UI polish, and updating the CI workflow to include type-check/tests.
