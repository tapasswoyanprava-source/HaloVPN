import { VpnClient, VpnConfig, VpnStatus } from './VpnClient';
import { NativeModules } from 'react-native';

export class RealVpnClient implements VpnClient {
  private native: any;

  constructor() {
    // Attempt to bind to a native VPN bridge module if available
    this.native = (NativeModules && (NativeModules as any).RealVpnModule) || null;
  }

  async connect(config: VpnConfig): Promise<void> {
    if (this.native && typeof this.native.connect === 'function') {
      await this.native.connect(config.serverHostname, config.country);
    } else {
      // Fallback path: simulate connection latency for development parity
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  async disconnect(): Promise<void> {
    if (this.native && typeof this.native.disconnect === 'function') {
      await this.native.disconnect();
    }
  }

  async getStatus(): Promise<VpnStatus> {
    if (this.native && typeof this.native.getStatus === 'function') {
      const s = await this.native.getStatus();
      return s as VpnStatus;
    }
    return 'disconnected';
  }
}
