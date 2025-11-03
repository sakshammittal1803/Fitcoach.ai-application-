import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightTheme = {
  isDark: false,
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradient: ['#EBF4FF', '#E0E7FF'],
    gradientDark: ['#1E3A8A', '#1E40AF'],
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme = {
  isDark: true,
  colors: {
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#4B5563',
    borderLight: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    gradient: ['#1F2937', '#111827'],
    gradientDark: ['#0F172A', '#1E293B'],
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'true');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('darkMode', newTheme.toString());
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    ...(isDark ? darkTheme : lightTheme),
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};