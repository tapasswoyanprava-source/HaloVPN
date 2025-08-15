export type UsageSummary = {
  durationMs: number;
  bytesSent: number;
  bytesReceived: number;
  startTime?: number;
  endTime?: number;
};

export class DataUsageTracker {
  private intervalId: any = null;
  private startTime: number = 0;
  private bytesSent: number = 0;
  private bytesReceived: number = 0;

  start(): void {
    if (this.intervalId) return;
    this.startTime = Date.now();
    this.bytesSent = 0;
    this.bytesReceived = 0;
    // In a real implementation, hook into native/network metrics.
    // Here, we simulate traffic to provide a useful UI during development.
    this.intervalId = setInterval(() => {
      this.bytesSent += Math.floor(Math.random() * 1500);
      this.bytesReceived += Math.floor(Math.random() * 1500);
    }, 1000);
  }

  stop(): UsageSummary {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const endTime = Date.now();
    const durationMs = endTime - this.startTime;
    const summary: UsageSummary = {
      durationMs,
      bytesSent: this.bytesSent,
      bytesReceived: this.bytesReceived,
      startTime: this.startTime,
      endTime
    };
    // Reset counters for next usage session
    this.startTime = 0;
    this.bytesSent = 0;
    this.bytesReceived = 0;
    return summary;
  }

  getCurrent(): { bytesSent: number; bytesReceived: number } {
    return { bytesSent: this.bytesSent, bytesReceived: this.bytesReceived };
  }
}
