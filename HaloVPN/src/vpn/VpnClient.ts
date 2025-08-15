export type VpnStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type VpnConfig = {
  serverHostname: string;
  country?: string;
};

export interface VpnClient {
  connect(config: VpnConfig): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<VpnStatus>;
}
