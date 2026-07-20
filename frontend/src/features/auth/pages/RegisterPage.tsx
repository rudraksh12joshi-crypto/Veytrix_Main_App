import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export function RegisterPage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { setStatus, setUser } = useAuthStore();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [loadingProvider, setLoadingProvider] = useState<"email" | "google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: "", color: theme.colors.textMuted, width: "0%" };
    if (pass.length < 6) return { label: "Weak", color: theme.colors.danger, width: "33%" };
    if (pass.length < 10 || !/\d/.test(pass)) return { label: "Medium", color: theme.colors.warning, width: "66%" };
    return { label: "Strong", color: theme.colors.success, width: "100%" };
  };

  const strength = getPasswordStrength(password);

  const handleEmailSignUp = () => {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoadingProvider("email");
    Keyboard.dismiss();
    
    setTimeout(() => {
      setLoadingProvider(null);
      setUser({
        id: "usr_67890",
        email: email,
        displayName: fullName || "Test User",
        role: "free",
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setStatus("authenticated");
    }, 1500);
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    setError(null);
    setLoadingProvider(provider);
    
    setTimeout(() => {
      setLoadingProvider(null);
      setUser({
        id: "usr_67890",
        email: `test@${provider}.com`,
        displayName: "Test User",
        role: "free",
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setStatus("authenticated");
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/image.png")}
                style={styles.logoContainer}
                resizeMode="cover"
              />
              
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                Create Your Account
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Start creating cinematic videos with AI-powered editing.
              </Text>
            </View>

            <View style={styles.form}>
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '20' }]}>
                  <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              {/* Full Name Input */}
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="person" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (error) setError(null);
                  }}
                  editable={loadingProvider === null}
                />
              </View>

              {/* Email Input */}
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="mail" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  editable={loadingProvider === null}
                />
              </View>

              {/* Password Input */}
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginBottom: 8 }]}>
                <Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  editable={loadingProvider === null}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={theme.colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBackground}>
                    <View style={[styles.strengthBarFill, { width: strength.width as any, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}

              {/* Confirm Password Input */}
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError(null);
                  }}
                  editable={loadingProvider === null}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={theme.colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>

              {/* Checkbox */}
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                activeOpacity={0.8}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[styles.checkbox, { 
                  backgroundColor: agreedToTerms ? theme.colors.primary : 'transparent',
                  borderColor: agreedToTerms ? theme.colors.primary : theme.colors.border
                }]}>
                  {agreedToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[styles.checkboxText, { color: theme.colors.textSecondary }]}>
                  I agree to the Terms of Service and Privacy Policy.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleEmailSignUp}
                disabled={loadingProvider !== null}
                activeOpacity={0.8}
              >
                {loadingProvider === "email" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <View style={[styles.loginContainer, { alignSelf: 'center', marginBottom: 0 }]}>
                <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                  Already have an account? 
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={[styles.loginLink, { color: theme.colors.primary }]}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.termsText, { color: theme.colors.textMuted }]}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 80 : 100,
    marginBottom: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    width: 50,
    textAlign: "right",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 13,
    flex: 1,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginBottom: 32,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  providerIcon: {
    marginRight: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 20 : 40,
    alignItems: "center",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "700",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
