import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ProfileEdit = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Edit Screen</Text>
      <Text style={styles.subtitle}>Edit your profile information</Text>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ProfileEdit;