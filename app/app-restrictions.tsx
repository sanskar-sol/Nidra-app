import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useStore, StoreState } from '../store/useStore';
import { sleepBlocker } from '../store/sleepBlocker';

interface AppInfo {
  packageName: string;
  appName: string;
}

const SKELETON_DATA = Array.from({ length: 15 }, (_, i) => ({
  packageName: `skeleton-${i}`,
  appName: 'Loading...',
  isSkeleton: true,
}));

export default function AppRestrictionsScreen() {
  const router = useRouter();
  const blockedApps = useStore((state: StoreState) => state.blockedApps);
  const toggleAppBlock = useStore((state: StoreState) => state.toggleAppBlock);
  const [query, setQuery] = useState('');

  const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      try {
        const apps = await sleepBlocker.getInstalledApps();
        apps.sort((a, b) => a.appName.localeCompare(b.appName));
        setInstalledApps(apps);
      } catch (error) {
        console.error('Failed to load apps', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadApps();
  }, []);

  const restrictedAppsList = useMemo(() => {
    return installedApps.filter(app => blockedApps.includes(app.packageName));
  }, [installedApps, blockedApps]);

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return installedApps.filter((app) => 
      !blockedApps.includes(app.packageName) && 
      (!normalized || app.appName.toLowerCase().includes(normalized))
    );
  }, [query, installedApps, blockedApps]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === (isLoading ? SKELETON_DATA.length - 1 : filteredApps.length - 1);
    
    const cardStyle = [
      styles.row,
      styles.cardItem,
      isFirst && styles.cardItemFirst,
      isLast && styles.cardItemLast,
      !isFirst && !isLast && styles.cardItemMiddle,
    ];

    if (item.isSkeleton) {
      return (
        <View style={cardStyle}>
          <View style={styles.leftRow}>
            <View style={[styles.skeletonIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
            <View style={[styles.skeletonText, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>
          <View style={[styles.skeletonSwitch, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
        </View>
      );
    }

    return (
      <View style={cardStyle}>
        <View style={styles.leftRow}>
          <Ionicons name="apps" size={20} color="#E5E7EB" />
          <Text style={styles.itemText}>{item.appName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            toggleAppBlock(item.packageName);
            setQuery('');
            const isBlocked = blockedApps.includes(item.packageName);
            Toast.show({
              type: 'success',
              text1: isBlocked ? 'App Unrestricted' : 'App Restricted',
              text2: isBlocked ? `${item.appName} is now available.` : `${item.appName} will be blocked during sleep mode.`,
              position: 'top',
            });
          }}
          style={[styles.switchContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
        >
          <View style={[styles.switchThumb, { alignSelf: 'flex-start' }]} />
        </TouchableOpacity>
      </View>
    );
  };

  const suggestedApps = useMemo(() => {
    const distractors = ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'snapchat', 'whatsapp'];
    return installedApps.filter(app => 
      !blockedApps.includes(app.packageName) && 
      distractors.some(d => app.appName.toLowerCase().includes(d) || app.packageName.toLowerCase().includes(d))
    );
  }, [installedApps, blockedApps]);

  const ListHeaderComponent = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restricted Apps</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search apps"
          placeholderTextColor="#6B7280"
          style={styles.searchInput}
        />
      </View>

      {restrictedAppsList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Restricted Apps</Text>
          <View style={styles.card}>
            {restrictedAppsList.map((app) => (
              <View key={app.packageName} style={styles.row}>
                <View style={styles.leftRow}>
                  <Ionicons name="apps" size={20} color="#E5E7EB" />
                  <Text style={styles.itemText}>{app.appName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    toggleAppBlock(app.packageName);
                    Toast.show({
                      type: 'success',
                      text1: 'App Unrestricted',
                      text2: `${app.appName} is now available.`,
                      position: 'top',
                    });
                  }}
                  style={[styles.switchContainer, { backgroundColor: '#3b82f6' }]}
                >
                  <View style={[styles.switchThumb, { alignSelf: 'flex-end' }]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {suggestedApps.length > 0 && !query.trim() && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#facc15' }]}>Suggested Blocks</Text>
          <View style={styles.card}>
            {suggestedApps.map((app) => (
              <View key={app.packageName} style={styles.row}>
                <View style={styles.leftRow}>
                  <Ionicons name="flash" size={20} color="#facc15" />
                  <Text style={styles.itemText}>{app.appName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    toggleAppBlock(app.packageName);
                    Toast.show({
                      type: 'success',
                      text1: 'App Restricted',
                      text2: `${app.appName} will be blocked during sleep mode.`,
                      position: 'top',
                    });
                  }}
                  style={[styles.switchContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                >
                  <View style={[styles.switchThumb, { alignSelf: 'flex-start' }]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 12 }]}>
        {query.trim() ? 'Search Results' : 'All Available Apps'}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <FlatList
        data={isLoading ? SKELETON_DATA : filteredApps}
        keyExtractor={(item) => item.packageName}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No apps found</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Lora_500Medium',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontFamily: 'Inter_400Regular',
    paddingVertical: 12,
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cardItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
  },
  cardItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: 18,
  },
  cardItemLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 18,
  },
  cardItemMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  switchContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  skeletonText: {
    width: 120,
    height: 16,
    borderRadius: 8,
  },
  skeletonSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
  },
});
