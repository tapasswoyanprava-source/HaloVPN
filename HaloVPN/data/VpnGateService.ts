// VPN Gate service with lightweight production-friendly enhancements.
// - Adds in-memory caching with TTL to reduce repeated network calls.
// - Integrates minimal production logging via ProdLogger.ts.
// - Keeps existing CSV parsing and server shaping logic.

import { info, error } from '../src/utils/ProdLogger';

export interface Server {
  country: string;
  hostname: string;
  speed: number;
  configData?: string;
  ping: number;
  score: number;
  flag?: string;
  servers?: number;
  latencyMs?: number;
}

function parseCsv(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
    return obj;
  });
}
let _cachedServers: Server[] | null = null;
let _lastFetched = 0;
const _TTL_MS = 5 * 60 * 1000;

export class VpnGateService {
  async fetchServers(): Promise<Server[]> {
    const now = Date.now();
    if (_cachedServers && ((now - _lastFetched) < _TTL_MS)) {
      info('VPN Gate: returning cached server list');
      return _cachedServers;
    }

    info('VPN Gate: fetching server list from API');
    let response: Response;
    try {
      response = await fetch('https://www.vpngate.net/api/iphone/');
    } catch (err) {
      error(`Network error fetching VPN Gate data: ${err}`);
      const fallback: Server[] = [
        { country: 'US', hostname: 'fallback.vpn.halo', speed: 1, configData: '', ping: 100, score: 1, latencyMs: 100 }
      ];
      _cachedServers = fallback;
      _lastFetched = Date.now();
      return fallback;
    }
    if (!response.ok) {
      error(`VPN Gate API responded with status ${response.status}`);
      const fallback: Server[] = [
        { country: 'US', hostname: 'fallback.vpn.halo', speed: 1, configData: '', ping: 100, score: 1, latencyMs: 100 }
      ];
      _cachedServers = fallback;
      _lastFetched = Date.now();
      return fallback;
    }
    const text = await response.text();

    // Parse CSV with header row. Use local parseCsv function instead of Papaparse.
    const rows = parseCsv(text);

    const servers: Server[] = rows.map((row: any) => {
      const country = (row.Country ?? row.CountryName ?? '').toString();
      const hostname = (row.HostName ?? row['Hostname/IP'] ?? row['IP/Hostname'] ?? '').toString();
      const speed = parseFloat((row.Speed ?? row.SpeedMbps ?? '0') as any) || 0;
      const configData = row.OpenVPN_Config_Data ?? row.OpenVPN_Config_Data_Base64 ?? '';
      const ping = parseInt((row.Ping ?? row['Ping(ms)'] ?? '0') as any) || 0;
      const score = parseFloat((row.Score ?? '0') as any) || 0;

      // Enrich with UI-friendly fields (optional in CSV)
      return { country, hostname, speed, configData, ping, score, flag: '', latencyMs: ping };
    }).filter((s) => s.country && s.hostname);

    // Sort by speed descending
    servers.sort((a, b) => b.speed - a.speed);

    _cachedServers = servers;
    _lastFetched = now;

    return servers;
  }
}

export async function getServers(): Promise<Server[]> {
  const svc = new VpnGateService();
  return svc.fetchServers();
}
