import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Progress = ({ navigation }) => {
  const theme = useTheme();
  const [progressData, setProgressData] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userProfile, setUserProfile] = useState({});
  const [stats, setStats] = useState({
    totalPhotos: 0,
    daysActive: 0,
    currentStreak: 0,
    totalWorkouts: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const progress = await AsyncStorage.getItem('progressHistory');
      const points = await AsyncStorage.getItem('userPoints');
      const profileData = await AsyncStorage.getItem('userProfile');
      
      if (progress) {
        const parsedProgress = JSON.parse(progress);
        setProgressData(parsedProgress);
        calculateStats(parsedProgress);
      }
      
      if (points) {
        setUserPoints(parseInt(points));
      }

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const calculateStats = (progressHistory) => {
    const totalPhotos = progressHistory.length;
    const daysActive = totalPhotos > 0 ? 
      Math.floor((new Date() - new Date(progressHistory[progressHistory.length - 1]?.date)) / (1000 * 60 * 60 * 24)) : 0;
    
    setStats({
      totalPhotos,
      daysActive,
      currentStreak: Math.min(daysActive, 30), // Mock streak calculation
      totalWorkouts: totalPhotos * 3, // Mock workout count
    });
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6' };
    if (bmi < 25) return { category: 'Normal weight', color: '#10B981' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B' };
    return { category: 'Obese', color: '#EF4444' };
  };

  const handleAddProgressPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload progress photos.');
      return;
    }

    Alert.alert(
      'Add Progress Photo',
      'Choose how to add your progress photo:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => takePhoto() },
        { text: 'Gallery', onPress: () => pickFromGallery() },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      saveProgressPhoto(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      saveProgressPhoto(result.assets[0]);
    }
  };

  const saveProgressPhoto = async (photo) => {
    try {
      const progressEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        photo: {
          uri: photo.uri,
          name: photo.fileName || `progress_${Date.now()}.jpg`,
        },
        weight: userProfile.weight,
        height: userProfile.height,
        bmi: calculateBMI(userProfile.weight, userProfile.height),
        daysSinceStart: progressData.length + 1,
      };

      const updatedHistory = [progressEntry, ...progressData];
      setProgressData(updatedHistory);
      await AsyncStorage.setItem('progressHistory', JSON.stringify(updatedHistory));

      // Award points
      const currentPoints = userPoints + 200;
      setUserPoints(currentPoints);
      await AsyncStorage.setItem('userPoints', currentPoints.toString());

      // Update last upload timestamp
      await AsyncStorage.setItem('lastProgressPhotoUpload', new Date().toISOString());

      Alert.alert(
        'Progress Photo Added! 🎉',
        'You earned 200 points for tracking your progress!',
        [{ text: 'Awesome!', onPress: () => loadProgressData() }]
      );
    } catch (error) {
      console.error('Error saving progress photo:', error);
      Alert.alert('Error', 'Failed to save progress photo. Please try again.');
    }
  };

  const deleteProgressPhoto = (photoId) => {
    Alert.alert(
      'Delete Progress Photo',
      'Are you sure you want to delete this progress photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHistory = progressData.filter(item => item.id !== photoId);
              setProgressData(updatedHistory);
              await AsyncStorage.setItem('progressHistory', JSON.stringify(updatedHistory));
              calculateStats(updatedHistory);
            } catch (error) {
              console.error('Error deleting progress photo:', error);
            }
          }
        }
      ]
    );
  };

  const currentBMI = calculateBMI(userProfile.weight, userProfile.height);
  const bmiInfo = currentBMI ? getBMICategory(parseFloat(currentBMI)) : null;

  const styles = createStyles(theme);

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <View style={styles.pointsBadge}>
            <Ionicons name="trophy" size={16} color="#F59E0B" />
            <Text style={styles.pointsText}>{userPoints} points</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="camera" size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{stats.totalPhotos}</Text>
            <Text style={styles.statLabel}>Progress Photos</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#10B981" />
            <Text style={styles.statNumber}>{stats.daysActive}</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* BMI Card */}
        {currentBMI && (
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiTitle}>Current BMI</Text>
              <View style={[styles.bmiCategory, { backgroundColor: bmiInfo.color + '20' }]}>
                <Text style={[styles.bmiCategoryText, { color: bmiInfo.color }]}>
                  {bmiInfo.category}
                </Text>
              </View>
            </View>
            <Text style={styles.bmiValue}>{currentBMI}</Text>
            <Text style={styles.bmiSubtext}>
              {userProfile.height}cm • {userProfile.weight}kg
            </Text>
          </View>
        )}

        {/* Add Progress Photo Button */}
        <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddProgressPhoto}>
          <LinearGradient
            colors={['#3B82F6', '#6366F1']}
            style={styles.addPhotoGradient}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.addPhotoText}>Add Progress Photo</Text>
            <Text style={styles.addPhotoSubtext}>+200 points</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Progress Photos */}
        {progressData.length > 0 ? (
          <View style={styles.progressPhotos}>
            <Text style={styles.sectionTitle}>Progress Timeline</Text>
            {progressData.map((entry, index) => (
              <View key={entry.id} style={styles.photoEntry}>
                <Image source={{ uri: entry.photo.uri }} style={styles.progressImage} />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.photoDetails}>
                    Day {entry.daysSinceStart}
                    {entry.bmi && ` • BMI: ${entry.bmi}`}
                  </Text>
                  {entry.weight && (
                    <Text style={styles.photoWeight}>{entry.weight}kg</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => deleteProgressPhoto(entry.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Progress Photos Yet</Text>
            <Text style={styles.emptyDescription}>
              Start tracking your fitness journey by taking your first progress photo!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddProgressPhoto}>
              <Text style={styles.emptyButtonText}>Take First Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  bmiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  bmiCategory: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bmiSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  addPhotoButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addPhotoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addPhotoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addPhotoSubtext: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressPhotos: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  photoEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  photoInfo: {
    flex: 1,
  },
  photoDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  photoDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  photoWeight: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Progress;