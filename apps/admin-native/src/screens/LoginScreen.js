import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';
import { api, setToken } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const login = async () => {
    if (!password.trim()) { setError('Введите пароль'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.login(password.trim());
      if (res.success) {
        setToken(res.token);
        onLogin(res.token);
      } else {
        setError('Неверный пароль');
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🔐</Text>
        </View>
        <Text style={styles.title}>Администратор</Text>
        <Text style={styles.sub}>KEDEM TOURS — панель управления</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Введите пароль"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={v => { setPassword(v); setError(''); }}
          onSubmitEditing={login}
          returnKeyType="done"
          autoCapitalize="none"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={login}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.dark} />
            : <Text style={styles.btnText}>Войти</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: Colors.dark,
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  top:        { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  title:     { color: Colors.white, fontWeight: '800', fontSize: 22, letterSpacing: 1 },
  sub:       { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },

  form:       { width: '100%' },
  label:      { color: Colors.goldLight, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.white, fontSize: 16, marginBottom: 6,
  },
  inputError:  { borderColor: Colors.error },
  errorText:   { color: Colors.error, fontSize: 13, marginBottom: 12 },
  btn: {
    backgroundColor: Colors.gold, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    elevation: 4, shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: Colors.dark, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
