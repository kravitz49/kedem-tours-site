import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Pressable, RefreshControl,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

function Stars({ rating, size = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? Colors.gold : Colors.border }}>★</Text>
      ))}
    </View>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: 32, color: i <= value ? Colors.gold : Colors.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [sending, setSending]       = useState(false);
  const [success, setSuccess]       = useState(false);

  const [form, setForm] = useState({ name: '', rating: 5, excursion: '', text: '' });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  const submit = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      Alert.alert('Ошибка', 'Заполните имя и текст отзыва'); return;
    }
    setSending(true);
    try {
      const res = await api.submitReview({
        name:      form.name.trim(),
        rating:    form.rating,
        excursion: form.excursion.trim(),
        text:      form.text.trim(),
      });
      if (res.success) {
        setSuccess(true);
        setForm({ name: '', rating: 5, excursion: '', text: '' });
      } else {
        Alert.alert('Ошибка', res.error || 'Попробуйте ещё раз');
      }
    } catch {
      Alert.alert('Ошибка соединения', 'Проверьте интернет');
    } finally {
      setSending(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{item.name}</Text>
          <Stars rating={item.rating || 5} size={14} />
        </View>
        <Text style={styles.date}>
          {item.date ? new Date(item.date).toLocaleDateString('ru-RU') : ''}
        </Text>
      </View>
      {item.excursion ? (
        <Text style={styles.excLabel}>📍 {item.excursion}</Text>
      ) : null}
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{reviews.length}</Text>
          <Text style={styles.statLabel}>отзывов</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{avgRating}</Text>
          <Text style={styles.statLabel}>средняя оценка</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>⭐</Text>
          <Text style={styles.statLabel}>Kedem Tours</Text>
        </View>
      </View>

      {loading
        ? <View style={styles.center}><ActivityIndicator size="large" color={Colors.gold} /></View>
        : reviews.length === 0
          ? <View style={styles.center}><Text style={styles.empty}>Отзывов пока нет</Text></View>
          : <FlatList
              data={reviews}
              keyExtractor={item => String(item.id)}
              renderItem={renderReview}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.gold} />
              }
            />
      }

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setSuccess(false); setShowForm(true); }}>
        <Text style={styles.fabText}>✍️  Оставить отзыв</Text>
      </TouchableOpacity>

      {/* Review form modal */}
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowForm(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Ваш отзыв</Text>

            {success
              ? <View style={styles.successBox}>
                  <Text style={{ fontSize: 44, marginBottom: 12 }}>🙏</Text>
                  <Text style={styles.successText}>Спасибо за отзыв!</Text>
                  <Text style={styles.successSub}>Отзыв появится после проверки модератором.</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowForm(false)}>
                    <Text style={styles.closeBtnText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              : <FlatList
                  data={[1]}
                  keyExtractor={() => 'form'}
                  showsVerticalScrollIndicator={false}
                  renderItem={() => (
                    <View>
                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Ваше имя *</Text>
                        <TextInput style={styles.fieldInput} placeholder="Например: Мария"
                          value={form.name} onChangeText={v => setField('name', v)} />
                      </View>
                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Оценка *</Text>
                        <StarPicker value={form.rating} onChange={v => setField('rating', v)} />
                      </View>
                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Экскурсия</Text>
                        <TextInput style={styles.fieldInput} placeholder="Название (необязательно)"
                          value={form.excursion} onChangeText={v => setField('excursion', v)} />
                      </View>
                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Текст отзыва *</Text>
                        <TextInput
                          style={[styles.fieldInput, styles.textarea]}
                          placeholder="Расскажите о вашем опыте..."
                          multiline numberOfLines={4}
                          value={form.text} onChangeText={v => setField('text', v)}
                        />
                      </View>
                      <TouchableOpacity
                        style={[styles.submitBtn, sending && { opacity: 0.7 }]}
                        onPress={submit} disabled={sending}
                      >
                        {sending
                          ? <ActivityIndicator color={Colors.dark} />
                          : <Text style={styles.submitBtnText}>Отправить отзыв</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  )}
                />
            }
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textLight, fontSize: 15 },

  statsBar: {
    backgroundColor: Colors.dark, flexDirection: 'row',
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statVal:    { color: Colors.gold, fontWeight: '800', fontSize: 20 },
  statLabel:  { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  statDivider:{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },

  list: { padding: 12, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { color: Colors.gold, fontWeight: '700', fontSize: 16 },
  authorName:  { fontWeight: '700', fontSize: 14, color: Colors.dark, marginBottom: 3 },
  date:        { fontSize: 11, color: Colors.textLight },
  excLabel:    { fontSize: 12, color: Colors.gold, fontWeight: '600', marginBottom: 6 },
  reviewText:  { fontSize: 14, color: Colors.text, lineHeight: 21 },

  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: Colors.gold, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    elevation: 6, shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  fabText: { color: Colors.dark, fontWeight: '800', fontSize: 15 },

  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetWrap:{ justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 16 },

  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: Colors.text,
  },
  textarea: { height: 100, textAlignVertical: 'top' },

  submitBtn:     { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 6, marginBottom: 10 },
  submitBtnText: { color: Colors.dark, fontWeight: '800', fontSize: 16 },

  successBox:  { alignItems: 'center', paddingVertical: 30 },
  successText: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  successSub:  { fontSize: 13, color: Colors.textLight, textAlign: 'center', marginBottom: 24 },
  closeBtn:    { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13 },
  closeBtnText:{ color: Colors.white, fontWeight: '700', fontSize: 15 },
});
