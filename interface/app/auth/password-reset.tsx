import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { toast } from 'sonner-native';

export default function PasswordResetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: '#dc2626', text: 'Required' };
    if (password.length < 6) return { strength: 1, color: '#dc2626', text: 'Very Weak' };
    if (password.length < 8) return { strength: 2, color: '#f59e0b', text: 'Weak' };
    if (!/(?=.*[A-Z])/.test(password) || !/(?=.*[a-z])/.test(password) || !/(?=.*[0-9])/.test(password)) {
      return { strength: 3, color: '#f59e0b', text: 'Fair' };
    }
    if (password.length >= 12 && /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(password)) {
      return { strength: 5, color: '#10b981', text: 'Good' };
    }
    return { strength: 4, color: '#059669', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = async () => {
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error('Please enter both password fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength.strength < 3) {
      toast.error('Password must be at least Fair strength');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset attempt:', { password });
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        toast.success('Password reset successful! Please sign in with your new password.');
        router.replace('/auth/sign-in' as any);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to reset password. Please try again.');
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth/sign-in' as any);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Pressable style={styles.container} onPress={handleDismissKeyboard}>
        <View style={[styles.gradientBackground, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Sparkles size={32} color="#1da250" />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Create your new password</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.form}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>New Password</Text>
                </View>
                <View style={[
                  styles.inputContainer,
                  isPasswordFocused && styles.inputContainerFocused
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isPasswordFocused && styles.iconContainerFocused
                  ]}>
                    <Lock size={20} color={isPasswordFocused ? "#1da250" : "#6b7280"} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Confirm Password</Text>
                </View>
                <View style={[
                  styles.inputContainer,
                  isConfirmPasswordFocused && styles.inputContainerFocused
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isConfirmPasswordFocused && styles.iconContainerFocused
                  ]}>
                    <Lock size={20} color={isConfirmPasswordFocused ? "#1da250" : "#6b7280"} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>

                {formData.password && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
                    <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleBackToSignIn} disabled={isLoading}>
                <Text style={styles.linkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(29, 162, 80, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: '40%',
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: '#1da250',
    backgroundColor: '#ffffff',
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    marginRight: 12,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(29, 162, 80, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
    paddingRight: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeButton: {
    padding: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1da250',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  linkText: {
    color: '#1da250',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  passwordStrength: {
    fontSize: 14,
    fontWeight: '700',
  },
});
