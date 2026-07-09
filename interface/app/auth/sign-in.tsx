import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../../libs/apiConfig";
import { useAuth } from "@/context/AuthContext";

const logo = require("../../assets/images/logo.jpg");

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSignIn = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: emailOrPhone.trim(),
        password: password,
      };

      const response = await apiRequest(
        "/api/auth/mobile-login",
        "POST",
        "",
        payload,
      );
      console.log(response);
      if ((response as any)?.status === 200 || (response as any)?.status === 201) {
        const responseData = (response as any);
        // Store authentication data using AuthContext
        await login(responseData, {
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
        });

        // Navigate to main app
        router.replace("/(tabs)");
      } else {
        console.log(response)
        Alert.alert('Login Failed', (response as any).message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.log(error)
      let errorMessage = "Invalid credentials.";

      if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.response?.status === 404) {
        errorMessage = "Account not found. Please sign up first.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert('Login Failed', errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/auth/sign-up");
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
                <Image source={logo} style={styles.logo} />
                <View style={styles.sparkleIcon}>
                  <Sparkles size={16} color="#1da250" />
                </View>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your account</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.form}>
                <View style={styles.inputLabel}>
                  <Text style={styles.labelText}>Email or Phone</Text>
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
                    placeholder="Enter your email or phone"
                    placeholderTextColor="#9ca3af"
                    value={emailOrPhone}
                    onChangeText={setEmailOrPhone}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
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
                    placeholder="Enter your password"
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

                <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={styles.linkText}> Sign Up</Text>
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
    position: 'relative',
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 80,
    resizeMode: 'contain',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: '#1da250',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  linkText: {
    color: '#1da250',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
