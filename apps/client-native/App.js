import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen      from './src/screens/HomeScreen';
import ExcursionScreen from './src/screens/ExcursionScreen';
import ReviewsScreen   from './src/screens/ReviewsScreen';
import { Colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle:      { backgroundColor: Colors.dark },
          headerTintColor:  Colors.goldLight,
          headerTitleStyle: { fontWeight: '700', color: Colors.white },
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Excursion"
          component={ExcursionScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Reviews"
          component={ReviewsScreen}
          options={{ title: 'Отзывы' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
