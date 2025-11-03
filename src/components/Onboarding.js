import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Onboarding = ({ navigation }) => {
  const theme = useTheme();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    fitnessGoals: [],
    experience: 'beginner',
  });

  const styles = createStyles(theme);

  const steps = [
    {
      title: 'Welcome!',
      subtitle: "Let's get to know you",
      component: 'personal',
    },
    {
      title: 'Physical Stats',
      subtitle: 'Help us personalize your experience',
      component: 'physical',
    },
    {
      title: 'Fitness Goals',
      subtitle: 'What do you want to achieve?',
      component: 'goals',
    },
    {
      title: 'Activity Level',
      subtitle: 'How active are you currently?',
      component: 'activity',
    },
  ];

  const fitnessGoalOptions = [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: 'fitness' },
    { id: 'strength', label: 'Build Strength', icon: 'barbell' },
    { id: 'endurance', label: 'Improve Endurance', icon: 'bicycle' },
    { id: 'flexibility', label: 'Increase Flexibility', icon: 'body' },
    { id: 'general', label: 'General Fitness', icon: 'heart' },
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { id: 'very', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { id: 'extra', label: 'Extremely Active', description: 'Very hard exercise, physical job' },
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to fitness' },
    { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { id: 'advanced', label: 'Advanced', description: 'Very experienced' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goalId)
        ? prev.fitnessGoals.filter(id => id !== goalId)
        : [...prev.fitnessGoals, goalId]
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0 && formData.age.trim().length > 0;
      case 1:
        return formData.height.trim().length > 0 && formData.weight.trim().length > 0;
      case 2:
        return formData.fitnessGoals.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboardingFlow();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboardingFlow = async () => {
    setIsLoading(true);
    
    const profileData = {
      ...formData,
      age: parseInt(formData.age) || 0,
      height: parseInt(formData.height) || 0,
      weight: parseInt(formData.weight) || 0,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    const success = await completeOnboarding(profileData);
    
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
    
    setIsLoading(false);
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What's your name?</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>How old are you?</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="Enter your age"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderOption,
                formData.gender === gender && styles.selectedOption,
              ]}
              onPress={() => updateFormData('gender', gender)}
            >
              <Text
                style={[
                  styles.genderText,
                  formData.gender === gender && styles.selectedOptionText,
                ]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPhysicalStats = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Height (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.height}
          onChangeText={(text) => updateFormData('height', text)}
          placeholder="Enter your height"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weight (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weight}
          onChangeText={(text) => updateFormData('weight', text)}
          placeholder="Enter your weight"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience Level</Text>
        <View style={styles.optionsContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                formData.experience === level.id && styles.selectedCard,
              ]}
              onPress={() => updateFormData('experience', level.id)}
            >
              <Text
                style={[
                  styles.optionTitle,
                  formData.experience === level.id && styles.selectedCardText,
                ]}
              >
                {level.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  formData.experience === level.id && styles.selectedCardDescription,
                ]}
              >
                {level.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderGoals = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionDescription}>
        Select all that apply (you can change these later)
      </Text>
      <View style={styles.goalsGrid}>
        {fitnessGoalOptions.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              formData.fitnessGoals.includes(goal.id) && styles.selectedGoalCard,
            ]}
            onPress={() => toggleGoal(goal.id)}
          >
            <Ionicons
              name={goal.icon}
              size={32}
              color={
                formData.fitnessGoals.includes(goal.id)
                  ? '#FFFFFF'
                  : theme.colors.primary
              }
            />
            <Text
              style={[
                styles.goalText,
                formData.fitnessGoals.includes(goal.id) && styles.selectedGoalText,
              ]}
            >
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionDescription}>
        This helps us recommend the right intensity for you
      </Text>
      <View style={styles.optionsContainer}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.optionCard,
              formData.activityLevel === level.id && styles.selectedCard,
            ]}
            onPress={() => updateFormData('activityLevel', level.id)}
          >
            <Text
              style={[
                styles.optionTitle,
                formData.activityLevel === level.id && styles.selectedCardText,
              ]}
            >
              {level.label}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                formData.activityLevel === level.id && styles.selectedCardDescription,
              ]}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderPhysicalStats();
      case 2:
        return renderGoals();
      case 3:
        return renderActivity();
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / steps.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {steps.length}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
            
            {renderStepContent()}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !validateStep() && styles.disabledButton,
              ]}
              onPress={nextStep}
              disabled={!validateStep() || isLoading}
            >
              {isLoading ? (
                <Text style={styles.nextButtonText}>Setting up...</Text>
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  selectedGoalCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  goalText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  selectedCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedCardText: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectedCardDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Onboarding;