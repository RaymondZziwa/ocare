import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, User, Eye, EyeOff, Phone, Check, Sparkles } from 'lucide-react-native';
import { apiRequest } from '../../libs/apiConfig';
import { toast } from 'sonner-native';


export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Individual state variables instead of formData object
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
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
      return { strength: 4, color: '#10b981', text: 'Good' };
    }
    return { strength: 5, color: '#059669', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async () => {
    // Validation using individual state variables
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions and privacy policy');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (passwordStrength.strength < 3) {
      Alert.alert('Error', 'Password must be at least Fair strength');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password: password
      };

      const res = await apiRequest('/api/auth/mobile-register', 'POST', '', payload);

      setIsLoading(false);
      console.log(res);
      if ((res as any)?.status === 201 || (res as any)?.status === 200 || (res as any)?.status === "success") {
        Alert.alert('Success', 'Account created successfully. Please login to continue.');
        router.replace('/auth/sign-in' as any);
      } else {
        toast.error((res as any)?.message || 'Failed to create account. Please try again.');
      }
    } catch (error: any) {
      setIsLoading(false);

      const errorMessage = error?.response?.data?.message || 'Failed to create account. Please try again.';
      //Alert.alert('Error', errorMessage);
      // console.error('Signup error:', error?.response?.data);
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth/sign-in');
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started with your account</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.form}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Full Name</Text>
                </View>
                <View style={[
                  styles.inputContainer,
                  isFullNameFocused && styles.inputContainerFocused
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isFullNameFocused && styles.iconContainerFocused
                  ]}>
                    <User size={20} color={isFullNameFocused ? "#1da250" : "#6b7280"} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9ca3af"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!isLoading}
                    onFocus={() => setIsFullNameFocused(true)}
                    onBlur={() => setIsFullNameFocused(false)}
                  />
                </View>

                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Email Address</Text>
                </View>
                <View style={[
                  styles.inputContainer,
                  isEmailFocused && styles.inputContainerFocused
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isEmailFocused && styles.iconContainerFocused
                  ]}>
                    <Mail size={20} color={isEmailFocused ? "#1da250" : "#6b7280"} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                </View>

                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Phone Number</Text>
                </View>
                <View style={[
                  styles.inputContainer,
                  isPhoneFocused && styles.inputContainerFocused
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isPhoneFocused && styles.iconContainerFocused
                  ]}>
                    <Phone size={20} color={isPhoneFocused ? "#1da250" : "#6b7280"} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9ca3af"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                  />
                </View>

                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Password</Text>
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
                    placeholder="Create a password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
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
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

                {password && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
                    <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}

                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                    disabled={isLoading}
                  >
                    <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                      {agreeToTerms && <Check size={16} color="#ffffff" />}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.termsLink}>Terms and Conditions</Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading || !agreeToTerms}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleBackToSignIn} disabled={isLoading}>
                <Text style={styles.linkText}> Sign In</Text>
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
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    marginBottom: 14,
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
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    marginRight: 10,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(29, 162, 80, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 14,
    paddingRight: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeButton: {
    padding: 10,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1da250',
    paddingVertical: 16,
    borderRadius: 14,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  passwordStrengthLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  passwordStrength: {
    fontSize: 13,
    fontWeight: '700',
  },
  termsContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1da250',
    borderColor: '#1da250',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  termsLink: {
    color: '#1da250',
    fontWeight: '600',
  },
});