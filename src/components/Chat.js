import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_CONFIG } from './config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const {
  appName,
  aiName,
  avatars,
  messages: configMessages,
} = APP_CONFIG;

const API_KEY = "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";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";
const SITE_URL = "https://fitcoach-ai.app";
const SITE_NAME = "FitCoach AI";

const Chat = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const scrollViewRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Load user data and chat history
  useEffect(() => {
    loadData();
  }, [user]); // Reload when user profile changes

  const loadData = async () => {
    try {
      // Use user from AuthContext if available, otherwise load from AsyncStorage
      let profile = user || {};
      let name = user?.name || 'there';

      if (!user) {
        // Fallback to AsyncStorage if user not available from context
        const storedName = await AsyncStorage.getItem('userName');
        const profileData = await AsyncStorage.getItem('userProfile');
        name = storedName || 'there';
        profile = profileData ? JSON.parse(profileData) : {};
      }

      // Load saved chat history
      const savedChatHistory = await AsyncStorage.getItem('chatHistory');

      if (savedChatHistory) {
        try {
          const parsedHistory = JSON.parse(savedChatHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setMessages(parsedHistory);
            setTimeout(() => scrollToBottom(), 100);
            return;
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
          await AsyncStorage.removeItem('chatHistory');
        }
      }

      // If no valid chat history, show welcome message
      const welcomeMessage = buildWelcomeMessage(profile, name);
      setMessages([welcomeMessage]);
      await AsyncStorage.setItem('chatHistory', JSON.stringify([welcomeMessage]));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const buildWelcomeMessage = (profile, name) => {
    let text = `Hey **${name}**! I'm **${aiName}**, your AI fitness coach! 💪\n\n`;

    if (Object.keys(profile).length > 0) {
      const bmi = profile.weight && profile.height
        ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
        : null;

      text += `**Your Profile:**\n`;
      if (profile.age) text += `• Age: ${profile.age} years\n`;
      if (profile.gender) text += `• Gender: ${profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}\n`;
      if (profile.height && profile.weight) {
        text += `• ${profile.height}cm, ${profile.weight}kg`;
        if (bmi) text += ` (BMI: ${bmi})`;
        text += `\n`;
      }
      if (profile.experience) text += `• Experience: ${profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}\n`;
      if (profile.activityLevel) text += `• Activity Level: ${profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1)}\n`;

      if (profile.fitnessGoals && profile.fitnessGoals.length > 0) {
        const goalLabels = {
          'weight_loss': 'Weight Loss',
          'muscle_gain': 'Muscle Gain',
          'strength': 'Build Strength',
          'endurance': 'Improve Endurance',
          'flexibility': 'Increase Flexibility',
          'general': 'General Fitness'
        };
        const goals = profile.fitnessGoals.map(goal => goalLabels[goal] || goal).join(', ');
        text += `• Goals: ${goals}\n`;
      }

      text += `\n**Personalized Recommendations Ready!**\n`;
      text += `Based on your profile, I can create custom workout and diet plans just for you.\n\n`;
    }

    text += `**I can help with:**\n• 🏋️ Custom workout plans based on your goals\n• 🥗 Personalized meal plans & nutrition advice\n• 📸 Form analysis (upload workout photos!)\n• 📊 Progress tracking & motivation\n• 💡 Exercise modifications for your level\n\n`;

    if (profile.fitnessGoals && profile.fitnessGoals.length > 0) {
      text += `**Quick Start Ideas:**\n`;
      if (profile.fitnessGoals.includes('weight_loss')) {
        text += `• "Create a weight loss workout plan for me"\n`;
        text += `• "What should I eat for fat loss?"\n`;
      }
      if (profile.fitnessGoals.includes('muscle_gain')) {
        text += `• "Design a muscle building routine"\n`;
        text += `• "What foods help build muscle?"\n`;
      }
      if (profile.fitnessGoals.includes('strength')) {
        text += `• "Create a strength training program"\n`;
      }
      text += `\n`;
    }

    text += `What would you like to work on today? 🚀`;

    return {
      id: Date.now(),
      role: 'assistant',
      content: text,
      avatar: avatars.ai,
      timestamp: new Date().toISOString()
    };
  };

  const generateAIResponse = async (history) => {
    if (!API_KEY) {
      const errorMsg = {
        id: Date.now(),
        role: 'assistant',
        content: `**API Key Required**\n\nTo chat with me, you need to add your OpenRouter API key to the Chat.js file.\n\n**Quick Setup:**\n1. Visit [OpenRouter.ai](https://openrouter.ai/keys)\n2. Create a free API key\n3. Add it to the API_KEY variable in Chat.js\n\nThen I'll be able to give you personalized fitness advice! 💪`,
        avatar: avatars.ai,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use user from AuthContext if available, otherwise load from AsyncStorage
      let profile = user || {};

      if (!user) {
        // Fallback to AsyncStorage if user not available from context
        const profileData = await AsyncStorage.getItem('userProfile');
        profile = profileData ? JSON.parse(profileData) : {};
      }

      // Build comprehensive user profile context
      const bmi = profile.weight && profile.height
        ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
        : null;

      const goalLabels = {
        'weight_loss': 'Weight Loss',
        'muscle_gain': 'Muscle Gain',
        'strength': 'Build Strength',
        'endurance': 'Improve Endurance',
        'flexibility': 'Increase Flexibility',
        'general': 'General Fitness'
      };

      const goals = profile.fitnessGoals && profile.fitnessGoals.length > 0
        ? profile.fitnessGoals.map(goal => goalLabels[goal] || goal).join(', ')
        : 'General fitness';

      let SYSTEM_PROMPT = `You are ${aiName}, a friendly, expert personal trainer and nutritionist for the app ${appName}.

CLIENT PROFILE:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 'Unknown'} years
- Gender: ${profile.gender || 'Unknown'}
- Height: ${profile.height || 'Unknown'}cm
- Weight: ${profile.weight || 'Unknown'}kg
${bmi ? `- BMI: ${bmi}` : ''}
- Experience Level: ${profile.experience || 'Unknown'}
- Activity Level: ${profile.activityLevel || 'Unknown'}
- Primary Goals: ${goals}

PERSONALIZATION INSTRUCTIONS:
- Create workout plans specifically tailored to their goals, experience level, and activity level
- Provide meal plans and nutrition advice based on their goals (weight loss, muscle gain, etc.)
- Consider their BMI and physical stats when making recommendations
- Adjust exercise intensity based on their experience level (${profile.experience || 'beginner'})
- Account for their current activity level (${profile.activityLevel || 'moderate'}) when suggesting frequency
- Use their specific goals (${goals}) to focus recommendations

RESPONSE GUIDELINES:
- Always provide personalized advice based on their profile data above
- Keep responses conversational, helpful, and under 250 words
- Use emojis naturally and be encouraging
- Never mention you're an AI - you're their dedicated personal trainer
- When creating workout plans, specify sets, reps, and rest periods
- When suggesting meals, include portion sizes and timing
- Always consider their safety and current fitness level
- Be motivating and supportive while being realistic about their goals

Remember: This client has taken the time to set up their profile, so use that information to give them truly personalized fitness and nutrition guidance!`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "API error");
      }

      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content || "(No response)";

      const aiMessage = {
        id: Date.now(),
        role: "assistant",
        content: reply,
        avatar: avatars.ai,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save updated chat history
      const updatedMessages = [...messages, aiMessage];
      await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedMessages));

    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
      const errorMessage = {
        id: Date.now(),
        role: "system",
        content: `**AI Error**\n\n❌ ${err.message}`,
        avatar: avatars.ai,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input || "Sent attachments",
      avatar: userGender === 'female' ? avatars.female : avatars.male,
      timestamp: new Date().toISOString(),
      attachments: [...attachedFiles],
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Save to storage
    await AsyncStorage.setItem('chatHistory', JSON.stringify(newMessages));

    const newHistory = newMessages.filter(m => m.role === 'user' || m.role === 'assistant');
    setInput('');
    setAttachedFiles([]);

    setTimeout(() => {
      generateAIResponse(newHistory);
      scrollToBottom();
    }, 500);
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newFile = {
        id: Date.now() + Math.random(),
        name: asset.fileName || 'image.jpg',
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
        uri: asset.uri,
        isImage: true
      };

      setAttachedFiles(prev => [...prev, newFile]);
    }
  };

  const removeAttachment = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearChatHistory = async () => {
    Alert.alert(
      'Clear Chat History',
      `Are you sure you want to clear all chat history?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('chatHistory');
              const name = await AsyncStorage.getItem('userName') || 'there';
              const profileData = await AsyncStorage.getItem('userProfile');
              const profile = profileData ? JSON.parse(profileData) : {};
              const welcomeMessage = buildWelcomeMessage(profile, name);
              setMessages([welcomeMessage]);
              await AsyncStorage.setItem('chatHistory', JSON.stringify([welcomeMessage]));
            } catch (error) {
              console.error('Error clearing chat history:', error);
            }
          }
        }
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{appName} Chat</Text>
            <View style={styles.headerBadges}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>{aiName}</Text>
              </View>
              <View style={styles.messageCountBadge}>
                <Text style={styles.messageCountText}>{messages.length} messages</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.statusBadge, API_KEY ? styles.onlineStatus : styles.offlineStatus]}>
              <Text style={[styles.statusText, API_KEY ? styles.onlineText : styles.offlineText]}>
                {API_KEY ? 'Online' : 'Setup Required'}
              </Text>
            </View>
            <TouchableOpacity onPress={clearChatHistory} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageRow, msg.role === 'user' ? styles.userMessageRow : styles.aiMessageRow]}>
              {msg.role !== 'user' && (
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
              )}
              <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : msg.role === 'system' ? styles.systemBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : msg.role === 'system' ? styles.systemText : styles.aiText]}>
                  {msg.content}
                </Text>

                {/* Display Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <View style={styles.attachmentsContainer}>
                    {msg.attachments.map(file => (
                      <View key={file.id} style={styles.attachmentItem}>
                        {file.isImage ? (
                          <Image source={{ uri: file.uri }} style={styles.attachmentImage} />
                        ) : (
                          <View style={styles.attachmentFile}>
                            <Ionicons name="document-outline" size={16} color="#666" />
                            <Text style={styles.attachmentFileName}>{file.name}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {msg.role === 'user' && (
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.messageRow}>
              <Image source={{ uri: avatars.ai }} style={styles.avatar} />
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#6B7280" />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Attachment Preview */}
          {attachedFiles.length > 0 && (
            <ScrollView horizontal style={styles.attachmentPreview} showsHorizontalScrollIndicator={false}>
              {attachedFiles.map(file => (
                <View key={file.id} style={styles.previewItem}>
                  {file.isImage ? (
                    <Image source={{ uri: file.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.previewFile}>
                      <Ionicons name="document-outline" size={20} color="#666" />
                    </View>
                  )}
                  <Text style={styles.previewFileName} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeAttachment(file.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Quick Action Buttons */}
          {user && user.fitnessGoals && user.fitnessGoals.length > 0 && messages.length <= 2 && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Quick Start:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
                {user.fitnessGoals.includes('weight_loss') && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => setInput('Create a personalized weight loss workout plan for me')}
                  >
                    <Ionicons name="trending-down" size={16} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Weight Loss Plan</Text>
                  </TouchableOpacity>
                )}
                {user.fitnessGoals.includes('muscle_gain') && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => setInput('Design a muscle building routine based on my profile')}
                  >
                    <Ionicons name="fitness" size={16} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Muscle Building</Text>
                  </TouchableOpacity>
                )}
                {user.fitnessGoals.includes('strength') && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => setInput('Create a strength training program for my level')}
                  >
                    <Ionicons name="barbell" size={16} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Strength Training</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setInput('What should I eat based on my goals and stats?')}
                >
                  <Ionicons name="restaurant" size={16} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Meal Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setInput('Give me a daily routine that fits my activity level')}
                >
                  <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Daily Routine</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={user ? "Ask about your personalized fitness plan..." : "Ask about fitness, diet, form..."}
              multiline
              editable={!loading}
            />

            <TouchableOpacity onPress={handleImagePicker} style={styles.actionButton}>
              <Ionicons name="image-outline" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSend}
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
              style={[styles.sendButton, (loading || (!input.trim() && attachedFiles.length === 0)) && styles.disabledButton]}
            >
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? 'Sending...' : 'Send'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  aiBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  messageCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageCountText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineStatus: {
    backgroundColor: '#D1FAE5',
  },
  offlineStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  onlineText: {
    color: '#065F46',
  },
  offlineText: {
    color: '#991B1B',
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
  },
  aiBubble: {
    backgroundColor: '#F3F4F6',
  },
  systemBubble: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#1F2937',
  },
  systemText: {
    color: '#991B1B',
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  attachmentImage: {
    width: '100%',
    height: 128,
    borderRadius: 8,
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentFileName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
  },
  attachmentPreview: {
    marginBottom: 12,
  },
  previewItem: {
    width: 80,
    marginRight: 8,
    alignItems: 'center',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewFile: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFileName: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    fontSize: 14,
    maxHeight: 100,
  },
  actionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickActionsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default Chat;