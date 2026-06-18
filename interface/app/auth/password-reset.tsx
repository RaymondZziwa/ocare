import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { toast } from 'sonner-native';

export default function PasswordResetScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <Pressable style={styles.container} onPress={handleDismissKeyboard}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create your new password</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleBackToSignIn}>
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
  </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 8,
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
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#1da250',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  passwordStrength: {
    fontSize: 14,
    fontWeight: '600',
  },
});
