import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

import Loading from './src/components/Loading';
import Welcome from './src/components/Welcome';
import Login from './src/components/Login';
import Onboarding from './src/components/Onboarding';
import Chat from './src/components/Chat';
import Progress from './src/components/Progress';
import Rewards from './src/components/Rewards';
import Shop from './src/components/Shop';
import Settings from './src/components/Settings';
import ProfileEdit from './src/components/ProfileEdit';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Progress" component={Progress} />
      <Tab.Screen name="Rewards" component={Rewards} />
      <Tab.Screen name="Shop" component={Shop} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Loading" component={Loading} />
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}