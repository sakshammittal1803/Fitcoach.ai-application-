import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has completed onboarding
      const onboardingStatus = await AsyncStorage.getItem('onboardingCompleted');
      const userData = await AsyncStorage.getItem('userProfile');
      const userName = await AsyncStorage.getItem('userName');

      if (onboardingStatus === 'true' && userData) {
        const profile = JSON.parse(userData);
        setUser({
          ...profile,
          name: userName || profile.name || 'User',
        });
        setIsOnboarded(true);
      } else {
        setUser(null);
        setIsOnboarded(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      await AsyncStorage.setItem('userName', userData.name);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userProfile',
        'userName',
        'onboardingCompleted',
        'chatHistory',
        'progressHistory',
        'userPoints',
        'purchasedItems',
        'userAchievements',
        'unlockedRewards',
      ]);
      setUser(null);
      setIsOnboarded(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const completeOnboarding = async (profileData) => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      await AsyncStorage.setItem('userName', profileData.name);
      
      // Initialize user points
      await AsyncStorage.setItem('userPoints', '0');
      
      setUser(profileData);
      setIsOnboarded(true);
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      await AsyncStorage.setItem('userProfile', JSON.stringify(newUserData));
      await AsyncStorage.setItem('userName', newUserData.name);
      setUser(newUserData);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const auth = {
    user,
    isLoading,
    isOnboarded,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    loadUserData,
  };

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};