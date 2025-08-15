import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SpaceColors } from './theme/SpaceTheme';
import { info, error } from './src/utils/ProdLogger';
import { VpnStatus } from './src/vpn/VpnClient';
import { Server, getServers } from './data/VpnGateService';
import { VpnOrchestrator } from './src/vpn/VpnOrchestrator';

type ServerItem = Server;

const App: React.FC = () => {
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [vpnStatus, setVpnStatus] = useState<VpnStatus>('disconnected');
  const [selected, setSelected] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCounts, setCountryCounts] = useState<{ country: string; count: number }[]>([]);

  // Use a single orchestrator instance for the app
  const [orchestrator] = useState<VpnOrchestrator>(new VpnOrchestrator());

  useEffect(() => {
    const init = async () => {
      info('HaloVPN Android production UI initialized via orchestrator');
      try {
        const list = await getServers();
        setServers(list);
        setLastUpdated(Date.now());
        computeCountryCounts(list);
      } catch (err) {
        error(`Error fetching VPN servers: ${err}`);
      }

      try {
        const status = await orchestrator.getStatus();
        setVpnStatus(status);
      } catch (e) {
        // ignore
      }

      // Auto-refresh every 60 seconds
      const interval = setInterval(() => {
        refreshServers();
      }, 60000);

      return () => clearInterval(interval);
    };
    init();
  }, [orchestrator]);

  const computeCountryCounts = (list: ServerItem[]) => {
    const map = new Map<string, number>();
    list.forEach((s) => {
      const country = s.country ?? '';
      if (!country) return;
      const current = map.get(country) ?? 0;
      const additional = s.servers != null ? (typeof s.servers === 'number' ? s.servers : 1) : 1;
      map.set(country, current + additional);
    });
    const arr = Array.from(map.entries()).map(([country, count]) => ({ country, count }));
    arr.sort((a,b)=> a.country.localeCompare(b.country));
    setCountryCounts(arr);
  };

  const connectToServer = async (s: ServerItem) => {
    if (!orchestrator) return;
    setSelected(s.hostname ?? s.country);
    try {
      const hostname = await orchestrator.connectToCountry(s.country ?? '');
      setSelected(hostname ?? s.hostname ?? s.country);
      const status = await orchestrator.getStatus();
      setVpnStatus(status);
    } catch (err) {
      error(`Connection failed: ${err}`);
    }
  };

  const disconnect = async () => {
    try {
      await orchestrator.disconnect();
      const status = await orchestrator.getStatus();
      setVpnStatus(status);
      setSelected(null);
    } catch (err) {
      error(`Disconnect error: ${err}`);
    }
  };

  const refreshServers = async () => {
    setLoading(true);
    try {
      const list = await getServers();
      setServers(list);
      setLastUpdated(Date.now());
      computeCountryCounts(list);
    } catch (err) {
      error(`Error refreshing VPN servers: ${err}`);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ServerItem }) => (
    <View style={styles.countryRow}>
      <Text style={styles.flag}>{item.flag ?? ''}</Text>
      <Text style={styles.countryName}>{item.country}</Text>
      <Text style={styles.serverCount}>{item.servers ?? 0} servers</Text>
      {item.latencyMs != null && (
        <Text style={styles.latency}>{item.latencyMs} ms</Text>
      )}
      <TouchableOpacity onPress={() => connectToServer(item)} style={styles.connectButton}>
        <Text style={styles.connectText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: SpaceColors.background }]}>
      <View style={styles.panel} >
        <Text style={styles.panelTitle}>Countries</Text>
        <FlatList
          data={countryCounts}
          horizontal
          keyExtractor={(item) => item.country}
          renderItem={({ item }) => (
            <View style={styles.countryChip}>
              <Text style={styles.countryChipText}>{item.country}</Text>
              <Text style={styles.countryChipCount}>{item.count}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>HaloVPN</Text>
        <Text style={styles.subtitle}>Space UI Theme • Open-source VPN demo</Text>
        <Text style={styles.status}>VPN status: {vpnStatus}</Text>
        <Text style={styles.status}>Last updated: {typeof lastUpdated === 'number' ? new Date(lastUpdated).toLocaleTimeString() : 'never'}</Text>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refreshServers} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={refreshServers} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        {loading && (
          <>
            <ActivityIndicator size="small" color="#0000ff" style={{ marginLeft: 8 }} />
            <Text style={styles.loading}>Loading VPN servers...</Text>
          </>
        )}
      </View>

      <FlatList
        data={servers}
        keyExtractor={(item) => item.hostname ?? item.country}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <Text style={styles.credit}>© Tapas Khandual</Text>
        {vpnStatus === 'connected' && (
          <TouchableOpacity onPress={disconnect} style={styles.disconnectButton}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  panel: {
    padding: 12,
    paddingTop: 16,
    alignItems: 'center'
  },
  panelTitle: {
    fontSize: 14,
    color: SpaceColors.text,
    marginBottom: 6,
    opacity: 0.9
  },
  countryChip: {
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  countryChipText: {
    color: '#fff',
    fontSize: 12
  },
  countryChipCount: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8
  },
  header: {
    padding: 16,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    color: SpaceColors.text,
    fontWeight: 'bold'
  },
  subtitle: {
    color: SpaceColors.muted || '#888',
    marginTop: 6
  },
  status: {
    marginTop: 6,
    fontSize: 12,
    color: SpaceColors.text
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  countryRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a'
  },
  flag: {
    fontSize: 22,
    width: 40
  },
  countryName: {
    flex: 1,
    color: SpaceColors.text,
    fontSize: 16
  },
  serverCount: {
    color: SpaceColors.text,
    opacity: 0.8,
    fontSize: 14
  },
  latency: {
    color: SpaceColors.text,
    opacity: 0.7,
    fontSize: 12,
    marginLeft: 8
  },
  connectButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginLeft: 8
  },
  connectText: {
    color: '#fff',
    fontSize: 12
  },
  disconnectButton: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#e33',
    borderRadius: 4
  },
  disconnectText: {
    color: '#fff',
    fontSize: 12
  },
  refreshButton: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#007bff',
    borderRadius: 4
  },
  refreshText: {
    color: '#fff',
    fontSize: 12
  },
  loading: {
    color: '#fff',
    marginTop: 6,
    fontSize: 12
  },
  errorBanner: {
    alignItems: 'center',
    marginTop: 6
  },
  errorText: {
    color: 'red',
    marginTop: 0
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#007bff',
    borderRadius: 4
  },
  retryText: {
    color: '#fff',
    fontSize: 12
  },
  footer: {
    padding: 16,
    alignItems: 'center'
  },
  credit: {
    fontSize: 12,
    color: SpaceColors.text,
    fontStyle: 'italic',
    opacity: 0.6
  }
});
export default App;
