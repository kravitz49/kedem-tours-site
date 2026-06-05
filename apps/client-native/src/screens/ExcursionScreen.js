import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Pressable,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';

export default function ExcursionScreen({ route, navigation }) {
  const { excursion } = route.params;
  const [pickupPoints, setPickupPoints] = useState([]);
  const [showBook, setShowBook]         = useState(false);
  const [sending, setSending]           = useState(false);
  const [success, setSuccess]           = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', seats: '1', pickup: '',
  });

  useEffect(() => {
    navigation.setOptions({ title: excursion.title });
    api.getSettings()
      .then(s => {
        const pts = s.pickup_points || [];
        setPickupPoints(pts);
        if (pts.length) setForm(f => ({ ...f, pickup: pts[0] }));
      })
      .catch(() => {});
  }, []);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const submitOrder = async () => {
    const { firstName, lastName, phone, seats, pickup } = form;
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !pickup) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля'); return;
    }
    setSending(true);
    try {
      const res = await api.submitOrder({
        excursion: excursion.title,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone:     phone.trim(),
        seats,
        pickup,
      });
      if (res.success) {
        setSuccess(true);
        setForm({ firstName: '', lastName: '', phone: '', seats: '1', pickup: pickupPoints[0] || '' });
      } else {
        Alert.alert('Ошибка', res.error || 'Попробуйте ещё раз');
      }
    } catch {
      Alert.alert('Ошибка соединения', 'Проверьте интернет и попробуйте снова');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        {excursion.image
          ? <Image source={{ uri: excursion.image }} style={styles.hero} resizeMode="cover" />
          : <View style={[styles.heroPlaceholder, { backgroundColor: excursion.bg || Colors.accent }]}>
              <Text style={styles.heroEmoji}>{excursion.icon || '🗺️'}</Text>
            </View>
        }

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.metaRow}>
            {excursion.tag     && <Text style={styles.tag}>{excursion.tag}</Text>}
            {excursion.duration && <Text style={styles.duration}>⏱ {excursion.duration}</Text>}
          </View>

          {/* Title */}
          <Text style={styles.title}>{excursion.title}</Text>

          {/* Short description */}
          {excursion.desc && (
            <Text style={styles.descShort}>{excursion.desc}</Text>
          )}

          {/* Full description */}
          {excursion.desc_full && (
            <View style={styles.descFullWrap}>
              <Text style={styles.sectionLabel}>Описание</Text>
              <Text style={styles.descFull}>{excursion.desc_full}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setSuccess(false); setShowBook(true); }}>
        <Text style={styles.fabText}>✍️  Записаться</Text>
      </TouchableOpacity>

      {/* Booking Modal */}
      <Modal visible={showBook} animationType="slide" transparent onRequestClose={() => setShowBook(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowBook(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Запись на экскурсию</Text>
            <Text style={styles.sheetExc} numberOfLines={2}>{excursion.title}</Text>

            {success
              ? <View style={styles.successBox}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successText}>Вы успешно записаны!</Text>
                  <Text style={styles.successSub}>Мы свяжемся с вами в ближайшее время.</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowBook(false)}>
                    <Text style={styles.closeBtnText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              : <ScrollView showsVerticalScrollIndicator={false}>
                  <FormField label="Имя *" placeholder="Например: Михаил"
                    value={form.firstName} onChangeText={v => setField('firstName', v)} />
                  <FormField label="Фамилия *" placeholder="Например: Иванов"
                    value={form.lastName} onChangeText={v => setField('lastName', v)} />
                  <FormField label="Телефон *" placeholder="+972 5X XXX XXXX"
                    value={form.phone} onChangeText={v => setField('phone', v)}
                    keyboardType="phone-pad" />
                  <FormField label="Кол-во мест *" placeholder="1"
                    value={form.seats} onChangeText={v => setField('seats', v)}
                    keyboardType="number-pad" />

                  {/* Pickup selector */}
                  {pickupPoints.length > 0 && (
                    <View style={styles.fieldWrap}>
                      <Text style={styles.fieldLabel}>Место посадки *</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickupScroll}>
                        {pickupPoints.map(pt => (
                          <TouchableOpacity
                            key={pt}
                            style={[styles.pickupChip, form.pickup === pt && styles.pickupChipActive]}
                            onPress={() => setField('pickup', pt)}
                          >
                            <Text style={[styles.pickupChipText, form.pickup === pt && styles.pickupChipTextActive]}>
                              {pt}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
                    onPress={submitOrder}
                    disabled={sending}
                  >
                    {sending
                      ? <ActivityIndicator color={Colors.dark} />
                      : <Text style={styles.submitBtnText}>Записаться</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
            }
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function FormField({ label, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.fieldInput} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 100 },

  hero: { width: '100%', height: 260 },
  heroPlaceholder: { width: '100%', height: 260, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 72 },

  content: { padding: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tag: {
    fontSize: 12, fontWeight: '700', color: Colors.tagText,
    backgroundColor: Colors.tag, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, overflow: 'hidden',
  },
  duration: { fontSize: 13, color: Colors.textLight },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.dark, lineHeight: 30, marginBottom: 10 },
  descShort:{ fontSize: 15, color: Colors.textLight, lineHeight: 22, marginBottom: 16 },

  descFullWrap: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  descFull: { fontSize: 14, color: Colors.text, lineHeight: 22 },

  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: Colors.gold,
    paddingVertical: 16, borderRadius: 14,
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: { color: Colors.dark, fontWeight: '800', fontSize: 16 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  sheetExc:   { fontSize: 13, color: Colors.gold, fontWeight: '600', marginBottom: 16 },

  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: Colors.text,
  },

  pickupScroll: { marginTop: 2 },
  pickupChip: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8,
  },
  pickupChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pickupChipText: { fontSize: 13, color: Colors.text },
  pickupChipTextActive: { color: Colors.white, fontWeight: '600' },

  submitBtn: {
    backgroundColor: Colors.gold, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 10,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.dark, fontWeight: '800', fontSize: 16 },

  successBox:  { alignItems: 'center', paddingVertical: 30 },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successText: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  successSub:  { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginBottom: 24 },
  closeBtn:    { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13 },
  closeBtnText:{ color: Colors.white, fontWeight: '700', fontSize: 15 },
});
