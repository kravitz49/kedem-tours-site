import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= rating ? Colors.gold : Colors.border }}>★</Text>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]               = useState('pending');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending   = reviews.filter(r => r.status !== 'published');
  const published = reviews.filter(r => r.status === 'published');
  const shown     = tab === 'pending' ? pending : published;

  const approve = async (id) => {
    try {
      await api.updateReview({ id, status: 'published' });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'published' } : r));
    } catch { Alert.alert('Ошибка', 'Не удалось опубликовать'); }
  };

  const reject = async (id) => {
    try {
      await api.updateReview({ id, status: 'pending' });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'pending' } : r));
    } catch { Alert.alert('Ошибка', 'Не удалось изменить статус'); }
  };

  const del = (id, name) => {
    Alert.alert(`Удалить отзыв "${name}"?`, '', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
          } catch { Alert.alert('Ошибка', 'Не удалось удалить'); }
        },
      },
    ]);
  };

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Stars rating={item.rating || 5} />
        </View>
        <Text style={styles.date}>
          {item.date ? new Date(item.date).toLocaleDateString('ru-RU') : ''}
        </Text>
      </View>
      {item.excursion ? <Text style={styles.excLabel}>📍 {item.excursion}</Text> : null}
      <Text style={styles.reviewText}>{item.text}</Text>
      <View style={styles.actions}>
        {item.status !== 'published'
          ? <TouchableOpacity style={styles.approveBtn} onPress={() => approve(item.id)}>
              <Text style={styles.approveBtnText}>✅ Опубликовать</Text>
            </TouchableOpacity>
          : <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(item.id)}>
              <Text style={styles.rejectBtnText}>📥 Скрыть</Text>
            </TouchableOpacity>
        }
        <TouchableOpacity style={styles.delBtn} onPress={() => del(item.id, item.name)}>
          <Text style={styles.delBtnText}>🗑 Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'pending' && styles.tabBtnActive]}
          onPress={() => setTab('pending')}
        >
          <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>
            На проверке {pending.length > 0 ? `(${pending.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'published' && styles.tabBtnActive]}
          onPress={() => setTab('published')}
        >
          <Text style={[styles.tabText, tab === 'published' && styles.tabTextActive]}>
            Опубликованные ({published.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <View style={styles.center}><ActivityIndicator size="large" color={Colors.gold} /></View>
        : shown.length === 0
          ? <View style={styles.center}>
              <Text style={styles.empty}>
                {tab === 'pending' ? '✅ Новых отзывов нет' : '📭 Нет опубликованных отзывов'}
              </Text>
            </View>
          : <FlatList
              data={shown}
              keyExtractor={item => String(item.id)}
              renderItem={renderReview}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.gold} />
              }
            />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textLight, fontSize: 15 },

  tabs: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: Colors.gold },
  tabText:      { fontSize: 13, color: Colors.textLight, fontWeight: '600' },
  tabTextActive:{ color: Colors.accent },

  list: { padding: 12, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { color: Colors.gold, fontWeight: '700', fontSize: 16 },
  name:        { fontWeight: '700', fontSize: 14, color: Colors.dark, marginBottom: 2 },
  date:        { fontSize: 11, color: Colors.textLight },
  excLabel:    { fontSize: 12, color: Colors.gold, fontWeight: '600', marginBottom: 6 },
  reviewText:  { fontSize: 14, color: Colors.text, lineHeight: 21, marginBottom: 12 },

  actions:     { flexDirection: 'row', gap: 8 },
  approveBtn:  { flex: 1, backgroundColor: '#d1fae5', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  approveBtnText:{ fontSize: 13, fontWeight: '700', color: '#065f46' },
  rejectBtn:   { flex: 1, backgroundColor: '#fef3c7', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  delBtn:      { flex: 1, backgroundColor: '#fee2e2', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  delBtnText:  { fontSize: 13, fontWeight: '700', color: '#991b1b' },
});
