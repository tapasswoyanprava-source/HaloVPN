// Lightweight production telemetry scaffold (no PII)
// This module uses the existing ProdLogger for minimal log surface.
// The telemetry surface can be extended to integrate with Crashlytics or analytics later.

import { info } from './ProdLogger';

export function track(event: string, data?: any): void {
  try {
    const payload = data ? ` ${JSON.stringify(data)}` : '';
    info(`Telemetry - ${event}${payload}`);
  } catch {
    // Intentionally swallow telemetry failures in production code paths
  }
}
