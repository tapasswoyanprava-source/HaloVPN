import { VpnClient, VpnConfig, VpnStatus } from './VpnClient';

export class MockVpnClient implements VpnClient {
  private status: VpnStatus = 'disconnected';
  private timer?: ReturnType<typeof setTimeout>;

  async connect(config: VpnConfig): Promise<void> {
    this.status = 'connecting';
    await new Promise<void>((resolve) => {
      this.timer = setTimeout(() => {
        this.status = 'connected';
        resolve();
      }, 800);
    });
  }

  async disconnect(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.status = 'disconnected';
  }

  async getStatus(): Promise<VpnStatus> {
    return this.status;
  }
}
