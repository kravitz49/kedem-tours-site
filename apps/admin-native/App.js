import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StatusBar } from 'react-native';

import LoginScreen      from './src/screens/LoginScreen';
import OrdersScreen     from './src/screens/OrdersScreen';
import ExcursionsScreen from './src/screens/ExcursionsScreen';
import ReviewsScreen    from './src/screens/ReviewsScreen';
import SettingsScreen   from './src/screens/SettingsScreen';
import { Colors }       from './src/theme/colors';
import { setToken }     from './src/services/api';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Заказы:     '📋',
    Экскурсии:  '🗺️',
    Отзывы:     '⭐',
    Настройки:  '⚙️',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[label] || '•'}</Text>;
}

export default function App() {
  const [token, setAuthToken] = useState('');

  const handleLogin = (t) => {
    setToken(t);
    setAuthToken(t);
  };

  if (!token) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 10, color: focused ? Colors.gold : Colors.textLight, fontWeight: focused ? '700' : '400' }}>
              {route.name}
            </Text>
          ),
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopColor: Colors.border,
            height: 60,
            paddingBottom: 8,
          },
          headerStyle:      { backgroundColor: Colors.dark },
          headerTintColor:  Colors.goldLight,
          headerTitleStyle: { fontWeight: '700', color: Colors.white, fontSize: 16 },
        })}
      >
        <Tab.Screen name="Заказы"     component={OrdersScreen}     options={{ title: 'Заказы' }} />
        <Tab.Screen name="Экскурсии"  component={ExcursionsScreen} options={{ title: 'Экскурсии' }} />
        <Tab.Screen name="Отзывы"     component={ReviewsScreen}    options={{ title: 'Отзывы' }} />
        <Tab.Screen name="Настройки"  component={SettingsScreen}   options={{ title: 'Настройки' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
