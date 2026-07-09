import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Sparkles } from 'lucide-react-native';
import { toast } from 'sonner-native';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create refs for each input
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = index + 1;
      inputRefs[nextInput]?.current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 4) {
      toast.error('Please enter all 4 digits of verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual email verification logic
      console.log('Verifying code:', fullCode);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        toast.success(
          'Your email has been verified successfully. You can now reset your password.',
        );
        router.replace('/auth/password-reset' as any);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      // TODO: Implement actual resend logic
      console.log('Resending verification code');
      
      toast.success(
        'A new verification code has been sent to your email.',
      );
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
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
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>Enter the 4-digit code sent to your email</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.form}>
                <Text style={styles.instructionText}>
                  We've sent a verification code to your email address. Please check your inbox and enter the code below.
                </Text>

                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={inputRefs[index]}
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(value) => handleCodeChange(index, value)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      secureTextEntry={false}
                      editable={!isLoading}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleBack} disabled={isLoading}>
                <Text style={styles.backText}>Back</Text>
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
  instructionText: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 70,
    height: 60,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  button: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  resendText: {
    color: '#1da250',
    fontSize: 15,
    fontWeight: '800',
  },
  backText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
