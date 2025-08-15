// Prod logging utility for HaloVPN React Native app
// Logs are suppressed in development to minimize noise.

declare const __DEV__: boolean;

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR"
}

export function prodLog(message: string, level: LogLevel = LogLevel.INFO): void {
  const isDev = typeof __DEV__ !== "undefined" && __DEV__;
  // In development, suppress prod-like logs to reduce noise
  if (isDev) {
    return;
  }
  // In production, route logs to console (can be replaced with a remote logger later)
  console.log(`[HaloVPN][${level}] ${message}`);
}

export function info(message: string): void {
  prodLog(message, LogLevel.INFO);
}

export function warn(message: string): void {
  prodLog(message, LogLevel.WARN);
}

export function error(message: string): void {
  prodLog(message, LogLevel.ERROR);
}
