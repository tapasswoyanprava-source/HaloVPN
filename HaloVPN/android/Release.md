HaloVPN Android Release Readiness

Overview
This document outlines the production readiness plan for the HaloVPN Android app. It focuses on release engineering, VPN integration compliance, security, observability, testing, and deployment readiness. The plan targets a standard Android Gradle build (not Expo) and a conventional Android app structure under android/.

Prerequisites
- Android Gradle project present at android/
- Release signing credentials prepared (keystore) or a keystore.properties file with secure storage
- Access to signing keys and keystore passwords stored securely (e.g., environment variables, CI secrets)

Phase 1 — Stabilize core Release Infrastructure (1–2 weeks)
Objectives
- Create a production-ready Android build configuration.
- Ensure signing is production-ready via keystore.properties or secure env variables.
- Verify AndroidManifest and VPN service declarations are correct.
- Introduce production logging and a minimal observability surface.

Key tasks
- Build configuration
  - Ensure minSdkVersion and targetSdkVersion are aligned with policy requirements (e.g., minSdkVersion 21, targetSdkVersion 33 or higher)
  - Set up signingConfigs.release to read from keystore.properties if available, with a safe fallback for local development
  - Enable ProGuard/R8 for release builds
- VPN service declarations
  - Verify AndroidManifest entries for HaloVpnService and HaloVpnForegroundService are correct and aligned with BIND_VPN_SERVICE requirements
- Observability and logging
  - Introduce a production logging toggle (log less in release builds; use a lightweight logger abstraction such as ProdLogger)
  - Prepare a simple telemetry/SDK-agnostic hook for future Crashlytics or analytics integration
- Release tooling
  - Provide a Release.md with signing steps and build commands
  - Document CI steps for signing and artifact generation

Deliverables
- Updated android/app/build.gradle with robust release signing config loading
- AndroidManifest.xml entries verified (and updated if needed)
- Release.md with explicit build, signing, and release steps

Phase 2 — Security, Observability, and UX polish (2–4 weeks)
Objectives
- Harden data handling and privacy
- Add crash reporting and basic analytics hooks
- Improve production UX (error banners, loading states, user feedback)
- Establish basic CI/CD gates

Key tasks
- Crash reporting and telemetry
  - Integrate a crash reporter (e.g., Firebase Crashlytics) and ensure PII is not logged
  - Add minimal telemetry for VPN connect attempts and failures without exposing sensitive data
- UX polish
  - Add user-friendly error banners and retry flows
  - Improve loading indicators and state transitions during VPN operations
- Testing
  - Add unit tests for critical logic (e.g., CSV parsing, server mapping)
  - Add UI tests for VPN flows (connect/disconnect)
- CI/CD
  - Create GitHub Actions workflow to build release artifacts (APK/AAB), run lint/tests, and publish to a staging store if applicable

Phase 3 — Compliance, QA, and Release Readiness (2–6 weeks)
Objectives
- Ensure compliance with Play policies
- Complete QA across devices
- Prepare release artifacts and submission readiness

Key tasks
- Privacy and disclosures
- Foreground service UX (notifications), per policy
- ProGuard/R8 finalization and obfuscation
- Release notes, rollback plan, and submission checklist

Cross-cutting considerations
- Data handling: Avoid logging VPN credentials or config data
- Observability: Keep telemetry lightweight and privacy-conscious
- Accessibility and UX: Ensure accessible labels and contrast
- Security: Use secure storage for signing credentials and sensitive keys

Next steps
- Confirm to proceed with Phase 1 scaffolding (Android release structure and manifest enhancements) or request adjustments
- If approved, I will implement the Phase 1 edits (Release.md scaffolding and signing guidance) and push incremental diffs
- See Release_Phase1.md for Phase 1 plan, deliverables, and validation criteria.
- See Release_Phase1.md for Phase 1 plan, deliverables, and validation criteria.
