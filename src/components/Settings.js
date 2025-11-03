import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const Settings = ({ navigation }) => {
  const theme = useTheme();
  const [user, setUser] = useState({});
  const [userPoints, setUserPoints] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    fitnessTrack: 'Fat loss',
    gender: 'male',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userProfile');
      const userName = await AsyncStorage.getItem('userName');
      const points = await AsyncStorage.getItem('userPoints');
      const purchased = await AsyncStorage.getItem('purchasedItems');
      const notifSettings = await AsyncStorage.getItem('notifications');

      if (userData) {
        const profile = JSON.parse(userData);
        setUser({ ...profile, name: userName || profile.name || 'User' });
        setProfileForm({
          name: userName || profile.name || '',
          age: profile.age?.toString() || '',
          height: profile.height?.toString() || '',
          weight: profile.weight?.toString() || '',
          fitnessTrack: profile.fitnessTrack || 'Fat loss',
          gender: profile.gender || 'male',
        });
      }

      if (points) setUserPoints(parseInt(points));
      if (purchased) setPurchasedItems(JSON.parse(purchased));
      if (notifSettings) setNotifications(notifSettings === 'true');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const saveProfile = async () => {
    try {
      const updatedProfile = {
        ...profileForm,
        age: parseInt(profileForm.age) || 0,
        height: parseInt(profileForm.height) || 0,
        weight: parseInt(profileForm.weight) || 0,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      await AsyncStorage.setItem('userName', profileForm.name);

      setUser({ ...updatedProfile, name: profileForm.name });
      setShowProfileModal(false);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    theme.toggleTheme();
  };

  const toggleNotifications = async (value) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications', value.toString());
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your data including chat history, progress photos, and points. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userProfile',
                'userName',
                'chatHistory',
                'progressHistory',
                'userPoints',
                'purchasedItems',
                'userAchievements',
                'unlockedRewards',
              ]);
              
              Alert.alert('Data Cleared', 'All data has been cleared successfully.', [
                { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Loading' }] }) }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const exportData = async () => {
    try {
      const allData = {
        profile: user,
        points: userPoints,
        purchasedItems,
        exportDate: new Date().toISOString(),
      };

      Alert.alert(
        'Export Data',
        `Your data export is ready:\n\nProfile: ${user.name || 'Not set'}\nPoints: ${userPoints}\nPurchased Items: ${purchasedItems.length}\n\nThis feature would normally save to your device or cloud storage.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const settingsOptions = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      onPress: () => setShowProfileModal(true),
    },
    {
      title: 'Dark Mode',
      subtitle: 'Toggle dark/light theme',
      icon: 'moon-outline',
      rightComponent: (
        <Switch
          value={theme.isDark}
          onValueChange={toggleDarkMode}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.isDark ? '#FFFFFF' : '#F3F4F6'}
        />
      ),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage push notifications',
      icon: 'notifications-outline',
      rightComponent: (
        <Switch
          value={notifications}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={notifications ? '#FFFFFF' : '#F3F4F6'}
        />
      ),
    },
    {
      title: 'My Purchases',
      subtitle: `${purchasedItems.length} items owned`,
      icon: 'bag-outline',
      onPress: () => {
        if (purchasedItems.length === 0) {
          Alert.alert('No Purchases', 'You haven\'t purchased any items yet. Visit the Shop to unlock premium content!');
        } else {
          const itemsList = purchasedItems.map(item => `• ${item.title}`).join('\n');
          Alert.alert('Your Purchases', itemsList);
        }
      },
    },
    {
      title: 'Export Data',
      subtitle: 'Download your fitness data',
      icon: 'download-outline',
      onPress: exportData,
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: 'shield-checkmark-outline',
      onPress: () => Alert.alert('Privacy Policy', 'Your privacy is important to us. We only store data locally on your device and use it to provide personalized fitness coaching.'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help & Support', 'Need help?\n\n• Check the Chat tab for AI assistance\n• Visit our FAQ section\n• Contact: support@fitcoach-ai.app'),
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About FitCoach AI', 'Version: 1.0.0\n\nYour personal AI fitness coach, designed to help you achieve your fitness goals through personalized guidance, progress tracking, and motivation.\n\nMade with ❤️ for your fitness journey.'),
    },
  ];

  const fitnessOptions = ['Fat loss', 'Muscle gain', 'General fitness', 'Strength training', 'Endurance'];

  const currentBMI = calculateBMI(user.weight, user.height);

  const styles = createStyles(theme);

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons
                name={user.gender === 'female' ? 'woman' : 'man'}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'Set up your profile'}</Text>
              <Text style={styles.userDetails}>
                {user.age ? `${user.age} years` : 'Age not set'}
                {user.fitnessTrack ? ` • ${user.fitnessTrack}` : ''}
              </Text>
              {currentBMI && (
                <Text style={styles.userBMI}>BMI: {currentBMI}</Text>
              )}
            </View>
          </View>
          <View style={styles.profileStats}>
            <Text style={styles.profilePointsText}>{userPoints}</Text>
            <Text style={styles.profilePointsLabel}>points</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                index === settingsOptions.length - 1 && styles.lastSettingItem
              ]}
              onPress={option.onPress}
              disabled={!option.onPress && !option.rightComponent}
            >
              <View style={styles.settingIcon}>
                <Ionicons name={option.icon} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              {option.rightComponent || (
                option.onPress && (
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                )
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text style={styles.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FitCoach AI v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for your fitness journey</Text>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.name}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.age}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, age: text }))}
                placeholder="Enter your age"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Height (cm)</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.height}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, height: text }))}
                placeholder="Enter your height"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.weight}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, weight: text }))}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {['male', 'female'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      profileForm.gender === gender && styles.selectedGender,
                    ]}
                    onPress={() => setProfileForm(prev => ({ ...prev, gender }))}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        profileForm.gender === gender && styles.selectedGenderText,
                      ]}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fitness Goal</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.fitnessOptions}>
                  {fitnessOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.fitnessOption,
                        profileForm.fitnessTrack === option && styles.selectedFitness,
                      ]}
                      onPress={() => setProfileForm(prev => ({ ...prev, fitnessTrack: option }))}
                    >
                      <Text
                        style={[
                          styles.fitnessText,
                          profileForm.fitnessTrack === option && styles.selectedFitnessText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {profileForm.height && profileForm.weight && (
              <View style={styles.bmiPreview}>
                <Text style={styles.bmiLabel}>Your BMI</Text>
                <Text style={styles.bmiValue}>
                  {calculateBMI(parseInt(profileForm.weight), parseInt(profileForm.height))}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  userBMI: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  profileStats: {
    alignItems: 'center',
  },
  profilePointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  profilePointsLabel: {
    fontSize: 12,
    color: theme.isDark ? theme.colors.accent : '#92400E',
  },
  settingsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dangerZone: {
    marginBottom: 24,
  },
  dangerButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? '#7F1D1D' : '#FEE2E2',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedGenderText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fitnessOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  fitnessOption: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedFitness: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  fitnessText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedFitnessText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bmiPreview: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default Settings;