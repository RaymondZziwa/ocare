import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch } from "react-redux";
import { toast } from "sonner-native";
import { apiRequest } from "../../libs/apiConfig";

const logo = require("../../assets/images/logo.jpg");

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please enter both email/phone and password");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        emailOrPhone: emailOrPhone.trim(),
        password: password,
      };
       router.replace("/(tabs)");
      const response = await apiRequest(
        "/api/auth/sign-in",
        "POST",
        "",
        payload,
      );
      console.log(response);
      if (response?.status === 200 || response?.status === 201) {
        // Store authentication data in AsyncStorage
        if (response.data?.token) {
          await AsyncStorage.setItem("authToken", response.data.token);
        }

        if (response.data?.user) {
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(response.data.user),
          );
        }

        // Store user data in Redux store
        if (response.data) {
          // Map the API response to match IUserAuth interface
          const userData = {
            id: response.data.id.toString(),
            fullName: response.data.fullName,
            phone: response.data.phone,
            email: response.data.email,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
            // Add token if available
            ...(response.data.token && {
              token: {
                accessToken: response.data.token,
                refreshToken: response.data.token,
              },
            }),
          };

          //dispatch(loginSuccess(userData));
        }

        // Navigate to main app
        router.replace("/(tabs)");
      } else {
       // toast.error(response.message || "Invalid credentials");
        // Alert.alert('Login Failed', response.data?.message || 'Invalid credentials');
      }
    } catch (error: any) {
      let errorMessage = "Invalid credentials.";

      if (error?.response?.status === 401) {
        errorMessage = "Invalid email/phone or password";
      } else if (error?.response?.status === 404) {
        errorMessage = "Account not found. Please sign up first.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      //toast.error(errorMessage);
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
    <Pressable style={styles.container} onPress={handleDismissKeyboard}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone number"
            placeholderTextColor="#9ca3af"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
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
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    marginTop: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
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
    color: "#1f2937",
    paddingVertical: 16,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: "#1da250",
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "#1da250",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#1da250",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 20,
  },
  linkText: {
    color: "#1da250",
    fontSize: 14,
    fontWeight: "500",
  },
});
