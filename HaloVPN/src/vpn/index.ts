import { VpnClient } from './VpnClient';
import { MockVpnClient } from './MockVpnClient';

export function createVpnClient(): VpnClient {
  // In production, switch to a real VPN client implementation
  return new MockVpnClient();
}
