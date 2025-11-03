import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Welcome = ({ navigation }) => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const styles = createStyles(theme);

  const slides = [
    {
      icon: 'fitness',
      title: 'AI-Powered Coaching',
      subtitle: 'Get personalized fitness guidance from your AI coach',
      description: 'Chat with your personal AI trainer for customized workouts, nutrition advice, and motivation.',
    },
    {
      icon: 'trending-up',
      title: 'Track Your Progress',
      subtitle: 'Monitor your fitness journey with photos and metrics',
      description: 'Upload progress photos, track your measurements, and see your transformation over time.',
    },
    {
      icon: 'trophy',
      title: 'Earn Rewards',
      subtitle: 'Stay motivated with achievements and points',
      description: 'Complete workouts, hit milestones, and unlock rewards to keep you motivated on your journey.',
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Onboarding');
    }
  };

  const skipToOnboarding = () => {
    navigation.navigate('Onboarding');
  };

  const currentSlideData = slides[currentSlide];

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.skipButton} onPress={skipToOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={currentSlideData.icon}
              size={80}
              color={theme.colors.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentSlideData.title}</Text>
          <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
          <Text style={styles.description}>{currentSlideData.description}</Text>

          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentSlide && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.nextButtonIcon}
            />
          </TouchableOpacity>

          {currentSlide === slides.length - 1 && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          )}

          {currentSlide > 0 && currentSlide < slides.length - 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentSlide(currentSlide - 1)}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appTitle}>FitCoach AI</Text>
          <Text style={styles.appSubtitle}>Your Personal AI Fitness Coach</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 160,
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonIcon: {
    marginLeft: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default Welcome;