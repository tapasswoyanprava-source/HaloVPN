 // Phase 2 scaffolding tests for VpnOrchestrator

import { VpnOrchestrator } from '../vpn/VpnOrchestrator';
import { VpnClient, VpnConfig, VpnStatus } from '../vpn/VpnClient';

// Lightweight mock VPN client implementing the VpnClient interface
class MockVpnClient implements VpnClient {
  async connect(config: VpnConfig): Promise<void> {
    // no-op for test scaffolding
  }
  async disconnect(): Promise<void> {
    // no-op for test scaffolding
  }
  async getStatus(): Promise<VpnStatus> {
    // simulate a connected status for testing purposes
    return 'connected';
  }
}

describe('VpnOrchestrator Phase 2 scaffolding', () => {
  test('instantiation with mock client creates instance', () => {
    const orchestrator = new VpnOrchestrator(new MockVpnClient() as any);
    expect(orchestrator).toBeTruthy();
  });

  // Additional Phase 2 tests can be added here when server fetch is mockable
});
