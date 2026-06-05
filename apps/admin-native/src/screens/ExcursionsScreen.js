import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
  Modal, TextInput, ScrollView, ActivityIndicator,
  Alert, RefreshControl, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

const EMPTY = { title: '', desc: '', desc_full: '', tag: '', duration: '', icon: '🗺️', image: '', bg: '#e8f4f8', price: '' };

export default function ExcursionsScreen() {
  const [list, setList]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getExcursions();
      setList(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowEditor(true); };
  const openEdit = (exc) => { setEditing(exc.id); setForm({ ...EMPTY, ...exc }); setShowEditor(true); };

  const save = async () => {
    if (!form.title.trim()) { Alert.alert('Ошибка', 'Введите название'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.updateExcursion({ ...form, id: editing });
        setList(prev => prev.map(e => e.id === editing ? { ...form, id: editing } : e));
      } else {
        const res = await api.createExcursion(form);
        setList(prev => [...prev, { ...form, id: res.id }]);
      }
      setShowEditor(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  const del = (id, title) => {
    Alert.alert(`Удалить "${title}"?`, 'Это действие необратимо', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteExcursion(id);
            setList(prev => prev.filter(e => e.id !== id));
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
          : <View style={[styles.thumbPlaceholder, { backgroundColor: item.bg || Colors.accent }]}>
              <Text style={{ fontSize: 28 }}>{item.icon || '🗺️'}</Text>
            </View>
        }
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          {item.tag      && <Text style={styles.tag}>{item.tag}</Text>}
          {item.duration && <Text style={styles.dur}>⏱ {item.duration}</Text>}
        </View>
        {item.desc && <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={() => del(item.id, item.title)}>
          <Text style={styles.delBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {loading
        ? <View style={styles.center}><ActivityIndicator size="large" color={Colors.gold} /></View>
        : <FlatList
            data={list}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.center}><Text style={styles.empty}>Экскурсий пока нет</Text></View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.gold} />
            }
          />
      }

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Editor modal */}
      <Modal visible={showEditor} animationType="slide" transparent onRequestClose={() => setShowEditor(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowEditor(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{editing ? 'Редактировать' : 'Новая экскурсия'}</Text>
              <TouchableOpacity onPress={() => setShowEditor(false)}>
                <Text style={{ fontSize: 22, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <EF label="Название *" value={form.title} onChangeText={v => setField('title', v)} />
              <EF label="Краткое описание" value={form.desc} onChangeText={v => setField('desc', v)} multiline />
              <EF label="Полное описание" value={form.desc_full} onChangeText={v => setField('desc_full', v)} multiline tall />
              <EF label="Тег (например: Целый день)" value={form.tag} onChangeText={v => setField('tag', v)} />
              <EF label="Продолжительность" value={form.duration} onChangeText={v => setField('duration', v)} placeholder="Например: 8 часов" />
              <EF label="Иконка (эмодзи)" value={form.icon} onChangeText={v => setField('icon', v)} />
              <EF label="URL изображения" value={form.image} onChangeText={v => setField('image', v)} placeholder="https://..." />
              <EF label="Цвет фона (если нет фото)" value={form.bg} onChangeText={v => setField('bg', v)} placeholder="#e8f4f8" />

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={save} disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={Colors.dark} />
                  : <Text style={styles.saveBtnText}>{editing ? 'Сохранить' : 'Добавить экскурсию'}</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function EF({ label, multiline, tall, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.multiline, tall && styles.tall]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  empty: { color: Colors.textLight, fontSize: 15 },
  list:  { padding: 12, gap: 10, paddingBottom: 90 },

  card: {
    backgroundColor: Colors.white, borderRadius: 12,
    flexDirection: 'row', overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  cardLeft: { width: 90 },
  thumb:    { width: 90, height: '100%' },
  thumbPlaceholder: { width: 90, height: 100, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 10 },
  cardTitle:{ fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 4, lineHeight: 20 },
  metaRow:  { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tag: {
    fontSize: 10, fontWeight: '700', color: Colors.accent,
    backgroundColor: Colors.blueBg, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8, overflow: 'hidden',
  },
  dur:      { fontSize: 10, color: Colors.textLight, alignSelf: 'center' },
  cardDesc: { fontSize: 11, color: Colors.textLight, lineHeight: 16 },
  cardActions:{ flexDirection: 'column', padding: 8, gap: 6, justifyContent: 'center' },
  editBtn:  { padding: 4 },
  editBtnText:{ fontSize: 18 },
  delBtn:   { padding: 4 },
  delBtnText: { fontSize: 18 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { color: Colors.dark, fontSize: 28, lineHeight: 32, fontWeight: '300' },

  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetWrap:{ justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 12,
  },
  sheetHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark },

  fieldWrap:  { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text,
  },
  multiline: { height: 70, textAlignVertical: 'top' },
  tall:      { height: 110 },

  saveBtn:     { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  saveBtnText: { color: Colors.dark, fontWeight: '800', fontSize: 16 },
});
