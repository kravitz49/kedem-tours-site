import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

export default function SettingsScreen() {
  const [loading, setSaving]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    logo_name:    '',
    logo_sub:     '',
    logo_icon:    '',
    hero_image:   '',
    pickup_points: [],
  });
  const [newPickup, setNewPickup] = useState('');

  useEffect(() => {
    api.getSettings()
      .then(s => {
        setForm({
          logo_name:     s.logo_name    || '',
          logo_sub:      s.logo_sub     || '',
          logo_icon:     s.logo_icon    || '',
          hero_image:    s.hero_image   || '',
          pickup_points: Array.isArray(s.pickup_points) ? s.pickup_points : [],
        });
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить настройки'))
      .finally(() => setFetching(false));
  }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addPickup = () => {
    const pt = newPickup.trim();
    if (!pt) return;
    if (form.pickup_points.includes(pt)) { Alert.alert('', 'Такая остановка уже есть'); return; }
    setForm(f => ({ ...f, pickup_points: [...f.pickup_points, pt] }));
    setNewPickup('');
  };

  const removePickup = (pt) => {
    setForm(f => ({ ...f, pickup_points: f.pickup_points.filter(p => p !== pt) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSettings(form);
      Alert.alert('Сохранено', 'Настройки успешно обновлены');
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.gold} /></View>;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Text style={styles.sectionTitle}>Логотип</Text>
      <EF label="Иконка (эмодзи)" value={form.logo_icon} onChangeText={v => setField('logo_icon', v)} placeholder="🧭" />
      <EF label="Название" value={form.logo_name} onChangeText={v => setField('logo_name', v)} placeholder="KEDEM TOURS" />
      <EF label="Подпись" value={form.logo_sub} onChangeText={v => setField('logo_sub', v)} placeholder="Экскурсии по Израилю" />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Главная страница</Text>
      <EF label="URL фото для шапки" value={form.hero_image} onChangeText={v => setField('hero_image', v)} placeholder="https://..." />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Места посадки</Text>
      {form.pickup_points.length === 0
        ? <Text style={styles.empty}>Остановок нет</Text>
        : form.pickup_points.map((pt) => (
            <View key={pt} style={styles.pickupRow}>
              <Text style={styles.pickupText}>📍 {pt}</Text>
              <TouchableOpacity onPress={() => removePickup(pt)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
      }
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Новая остановка..."
          value={newPickup}
          onChangeText={setNewPickup}
          onSubmitEditing={addPickup}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addPickup}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={save} disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={Colors.dark} />
          : <Text style={styles.saveBtnText}>💾  Сохранить настройки</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

function EF({ label, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.fieldInput} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:   { color: Colors.textLight, fontSize: 13, marginBottom: 10 },

  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
    paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: Colors.gold,
  },

  fieldWrap:  { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.textLight, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text,
  },

  pickupRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  pickupText: { fontSize: 14, color: Colors.text, flex: 1 },
  removeBtn:  { fontSize: 16, color: Colors.error, paddingLeft: 12 },

  addRow:    { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 24 },
  addInput: {
    flex: 1, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text,
  },
  addBtn:    { backgroundColor: Colors.gold, width: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText:{ color: Colors.dark, fontSize: 24, fontWeight: '300', lineHeight: 30 },

  saveBtn:     { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 4, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  saveBtnText: { color: Colors.dark, fontWeight: '800', fontSize: 16 },
});
