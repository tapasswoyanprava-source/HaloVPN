import { DataUsageTracker, UsageSummary } from './DataUsage';
import { VpnClient, VpnConfig, VpnStatus } from './VpnClient';
import { getServers, Server } from '../../data/VpnGateService';
import { track } from '../utils/ProdTelemetry';

export class VpnOrchestrator {
  private vpnClient: VpnClient;
  private dataUsage: DataUsageTracker;
  private currentServer?: Server;
  private _status: VpnStatus = 'disconnected';

  constructor(vpnClient?: VpnClient) {
    // If no client provided, fall back to a real VPN client when available.
    // This keeps the flow production-friendly while allowing easy mocking.
    this.vpnClient = vpnClient ?? new (require('./RealVpnClient').RealVpnClient)();
    this.dataUsage = new DataUsageTracker();
  }

  // Returns a list of available countries from the current real-time server list.
  async listCountries(): Promise<string[]> {
    const servers = await getServers();
    const countries = Array.from(new Set(servers.map(s => s.country).filter(Boolean)));
    const sorted = countries.sort();
    track('vpn_list_countries', { count: sorted.length });
    return sorted;
  }

  // Connect to the fastest server in the requested country.
  // Returns the chosen server hostname.
  async connectToCountry(country: string): Promise<string> {
    const servers = await getServers();
    const candidates = servers.filter(s => s.country === country && !!s.hostname);
    if (candidates.length === 0) throw new Error(`No VPN servers available for country: ${country}`);

    // Choose the fastest server (highest speed value)
    candidates.sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0));
    const server = candidates[0];

    const config: VpnConfig = {
      serverHostname: server.hostname,
      country
    };

    try {
      await this.vpnClient.connect(config);
      this.currentServer = server;
      track('vpn_connect', { country, serverHostname: server.hostname });
      this._status = 'connecting';
    } catch (err) {
      track('vpn_error', { country, error: String(err) });
      throw err;
    }

    // In a real implementation, status would be updated by the native module.
    // Here we optimistically transition to connected for UX purposes and start usage tracking.
    this._status = 'connected';
    this.dataUsage.start();

    return server.hostname;
  }

  // Disconnect the VPN and return a usage summary for the session.
  async disconnect(): Promise<UsageSummary> {
    await this.vpnClient.disconnect();
    track('vpn_disconnect', { country: this.currentServer?.country, serverHostname: this.currentServer?.hostname });
    this._status = 'disconnected';
    const summary = this.dataUsage.stop();
    this.currentServer = undefined;
    return summary;
  }

  // Query the current VPN status from the underlying client.
  async getStatus(): Promise<VpnStatus> {
    this._status = await this.vpnClient.getStatus();
    return this._status;
  }

  // Optional: expose the currently connected server (if any)
  getCurrentServer(): Server | undefined {
    return this.currentServer;
  }
}

export default VpnOrchestrator;
