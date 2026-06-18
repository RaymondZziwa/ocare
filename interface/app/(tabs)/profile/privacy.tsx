import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield, Eye, EyeOff, Bell, Lock } from 'lucide-react-native';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [privacySettings, setPrivacySettings] = React.useState({
    profileVisibility: true,
    shareData: false,
    marketingEmails: true,
    pushNotifications: true,
    locationServices: false,
  });

  const [securitySettings, setSecuritySettings] = React.useState({
    twoFactorAuth: false,
    biometricLogin: true,
    faceId: true,
    rememberDevice: true,
  });

  const handleBack = () => {
    router.back();
  };

  const togglePrivacySetting = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const toggleSecuritySetting = (setting: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Data Sharing</Text>
            <Text style={styles.settingDescription}>Share your data with trusted partners</Text>
          </View>
          <Switch
            value={privacySettings.shareData}
            onValueChange={() => togglePrivacySetting('shareData')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={privacySettings.shareData ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Marketing Emails</Text>
            <Text style={styles.settingDescription}>Receive promotional offers and updates</Text>
          </View>
          <Switch
            value={privacySettings.marketingEmails}
            onValueChange={() => togglePrivacySetting('marketingEmails')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={privacySettings.marketingEmails ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive order and prescription updates</Text>
          </View>
          <Switch
            value={privacySettings.pushNotifications}
            onValueChange={() => togglePrivacySetting('pushNotifications')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={privacySettings.pushNotifications ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Location Services</Text>
            <Text style={styles.settingDescription}>Allow app to access your location</Text>
          </View>
          <Switch
            value={privacySettings.locationServices}
            onValueChange={() => togglePrivacySetting('locationServices')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={privacySettings.locationServices ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
            <Text style={styles.settingDescription}>Add an extra layer of security</Text>
          </View>
          <Switch
            value={securitySettings.twoFactorAuth}
            onValueChange={() => toggleSecuritySetting('twoFactorAuth')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={securitySettings.twoFactorAuth ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Remember Device</Text>
            <Text style={styles.settingDescription}>Stay logged in on this device</Text>
          </View>
          <Switch
            value={securitySettings.rememberDevice}
            onValueChange={() => toggleSecuritySetting('rememberDevice')}
            trackColor={{ false: '#e5e7eb', true: '#1da250' }}
            thumbColor={securitySettings.rememberDevice ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
