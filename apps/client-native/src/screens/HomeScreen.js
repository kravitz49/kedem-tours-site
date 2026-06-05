import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [excursions, setExcursions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getExcursions();
      setExcursions(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = excursions.filter(e =>
    !search || e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('Excursion', { excursion: item })}
    >
      {item.image
        ? <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
        : <View style={[styles.cardImgPlaceholder, { backgroundColor: item.bg || Colors.accent }]}>
            <Text style={styles.cardEmoji}>{item.icon || '🗺️'}</Text>
          </View>
      }
      <View style={styles.cardBody}>
        <View style={styles.tagRow}>
          {item.tag ? <Text style={styles.tag}>{item.tag}</Text> : <View />}
          {item.duration ? <Text style={styles.duration}>⏱ {item.duration}</Text> : null}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.desc ? (
          <Text style={styles.cardDesc} numberOfLines={3}>{item.desc}</Text>
        ) : null}
        <Text style={styles.moreLink}>Подробнее →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🧭</Text>
          </View>
          <View>
            <Text style={styles.logoName}>KEDEM TOURS</Text>
            <Text style={styles.logoSub}>Экскурсии по Израилю</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.reviewsChip}
          onPress={() => navigation.navigate('Reviews')}
        >
          <Text style={styles.reviewsChipText}>⭐ Отзывы</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск экскурсий..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading
        ? <View style={styles.center}><ActivityIndicator size="large" color={Colors.gold} /></View>
        : filtered.length === 0
          ? <View style={styles.center}>
              <Text style={styles.empty}>😔 Экскурсий не найдено</Text>
            </View>
          : <FlatList
              data={filtered}
              keyExtractor={item => String(item.id)}
              renderItem={renderCard}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => load(true)}
                  tintColor={Colors.gold}
                />
              }
            />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 20 },
  logoName: { color: Colors.white, fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  logoSub:  { color: Colors.goldLight, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },

  reviewsChip: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1, borderColor: Colors.gold,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  reviewsChipText: { color: Colors.gold, fontWeight: '700', fontSize: 13 },

  searchWrap: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    color: Colors.white, fontSize: 14,
  },

  list: { padding: 12, gap: 14, paddingBottom: 30 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardImg: { width: '100%', height: 190 },
  cardImgPlaceholder: { width: '100%', height: 190, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 52 },
  cardBody: { padding: 14 },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tag: {
    fontSize: 11, fontWeight: '700', color: Colors.tagText,
    backgroundColor: Colors.tag, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, overflow: 'hidden',
  },
  duration: { fontSize: 11, color: Colors.textLight },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 6, lineHeight: 22 },
  cardDesc:  { fontSize: 13, color: Colors.textLight, lineHeight: 19, marginBottom: 10 },
  moreLink:  { fontSize: 13, fontWeight: '600', color: Colors.gold, textAlign: 'right' },
  empty: { color: Colors.textLight, fontSize: 15, marginTop: 20 },
});
