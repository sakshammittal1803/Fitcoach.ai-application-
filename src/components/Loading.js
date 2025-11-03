import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Loading = ({ navigation }) => {
  const theme = useTheme();
  const { isLoading, isOnboarded, user } = useAuth();

  useEffect(() => {
    // Wait for auth context to load, then navigate based on auth state
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isOnboarded && user) {
          // User is fully onboarded, go to main app
          navigation.replace('Main');
        } else {
          // User needs onboarding, go to welcome
          navigation.replace('Welcome');
        }
      }, 1500); // Show loading screen for at least 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, isOnboarded, user, navigation]);

  const styles = createStyles(theme);

  return (
    <LinearGradient colors={theme.colors.gradientDark} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.emoji}>💪</Text>
          <Text style={styles.title}>FitCoach AI</Text>
          <Text style={styles.subtitle}>Your Personal AI Fitness Coach</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            {isLoading ? 'Loading your profile...' : 'Getting ready...'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  version: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});

export default Loading;