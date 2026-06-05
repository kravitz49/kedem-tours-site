import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

export default function OrdersScreen() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteOrder = (id) => {
    Alert.alert('Удалить заказ?', 'Это действие необратимо', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteOrder(id);
            setOrders(prev => prev.filter(o => o.id !== id));
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить заказ');
          }
        },
      },
    ]);
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${o.firstName} ${o.lastName} ${o.phone} ${o.excursion}`.toLowerCase().includes(q);
  });

  const totalSeats = orders.reduce((s, o) => s + (o.seats || 0), 0);

  const renderOrder = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.numBadge}>
          <Text style={styles.numText}>{filtered.length - index}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.excName} numberOfLines={1}>{item.excursion}</Text>
          <Text style={styles.dateText}>
            {item.date ? new Date(item.date).toLocaleString('ru-RU', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }) : '—'}
          </Text>
        </View>
        <TouchableOpacity style={styles.delBtn} onPress={() => deleteOrder(item.id)}>
          <Text style={styles.delBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <InfoRow icon="👤" label={`${item.firstName} ${item.lastName}`} />
        <InfoRow icon="📞" label={item.phone} />
        <InfoRow icon="💺" label={`${item.seats} ${item.seats === 1 ? 'место' : 'мест'}`} />
        <InfoRow icon="📍" label={item.pickup} />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Stats */}
      <View style={styles.statsBar}>
        <StatPill icon="📋" value={orders.length} label="заказов" />
        <StatPill icon="💺" value={totalSeats} label="мест" />
        <StatPill icon="🗺️" value={new Set(orders.map(o => o.excursion)).size} label="экскурсий" />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по имени, телефону..."
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
              <Text style={styles.empty}>📭 Заказов нет</Text>
            </View>
          : <FlatList
              data={filtered}
              keyExtractor={item => String(item.id)}
              renderItem={renderOrder}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.gold} />
              }
            />
      }
    </View>
  );
}

function InfoRow({ icon, label }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textLight, fontSize: 15, marginTop: 20 },

  statsBar: {
    backgroundColor: Colors.accent, flexDirection: 'row',
    justifyContent: 'space-around', paddingVertical: 12, paddingHorizontal: 8,
  },
  statPill:  { alignItems: 'center' },
  statIcon:  { fontSize: 18, marginBottom: 2 },
  statVal:   { color: Colors.gold, fontWeight: '800', fontSize: 18, lineHeight: 22 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },

  searchWrap:  { backgroundColor: Colors.white, padding: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: {
    backgroundColor: Colors.bg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: Colors.text,
  },

  list: { padding: 12, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8faff', padding: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  numBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  numText:  { fontSize: 12, fontWeight: '700', color: Colors.textLight },
  excName:  { fontSize: 14, fontWeight: '700', color: Colors.accent, marginBottom: 2 },
  dateText: { fontSize: 11, color: Colors.textLight },
  delBtn:   { padding: 6 },
  delBtnText:{ fontSize: 18 },

  cardBody: { padding: 12, gap: 6 },
  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 14 },
  infoLabel:{ fontSize: 13, color: Colors.text },
});
