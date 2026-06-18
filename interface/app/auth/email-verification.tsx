import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { toast } from 'sonner-native';

export default function EmailVerificationScreen() {
  const router = useRouter();
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
    <Pressable style={styles.container} onPress={handleDismissKeyboard}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 4-digit code sent to your email</Text>
        </View>

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
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text style={styles.resendText}>Didn't receive code? Resend</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  instructionText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 70,
    height: 60,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#1da250',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1da250',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resendText: {
    color: '#1da250',
    fontSize: 14,
    fontWeight: '500',
  },
  backText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
