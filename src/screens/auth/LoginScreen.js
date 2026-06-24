import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Easing, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/ui/OtpInput';
import useAuthStore from '../../store/authStore';
import authService from '../../services/auth.service';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

// ─── Constants ────────────────────────────────────────────────────────────────
const RESEND_COOLDOWN = 60; // seconds
const AUTH_TABS = ['Password', 'Email OTP'];

// ─── Helper: simple email validation ─────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Sub-component: Tab Switcher ──────────────────────────────────────────────
function TabSwitcher({ tabs, activeIndex, onPress }) {
  return (
    <View style={tabStyles.container}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={tab}
          style={[tabStyles.tab, activeIndex === i && tabStyles.tabActive]}
          onPress={() => onPress(i)}
          activeOpacity={0.8}
        >
          <Text style={[tabStyles.tabText, activeIndex === i && tabStyles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
});

// ─── Sub-component: OTP Step Indicator ────────────────────────────────────────
function OtpStep({ step }) {
  return (
    <View style={stepStyles.row}>
      {[1, 2].map((n) => (
        <View key={n} style={stepStyles.item}>
          <View style={[stepStyles.circle, step >= n && stepStyles.circleActive]}>
            {step > n ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={[stepStyles.num, step >= n && stepStyles.numActive]}>{n}</Text>
            )}
          </View>
          <Text style={[stepStyles.label, step >= n && stepStyles.labelActive]}>
            {n === 1 ? 'Enter email' : 'Verify OTP'}
          </Text>
          {n < 2 && (
            <View style={[stepStyles.line, step > 1 && stepStyles.lineActive]} />
          )}
        </View>
      ))}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  circle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  circleActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  num: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  numActive: { color: '#fff' },
  label: { fontSize: 11, color: colors.textMuted, marginLeft: 6, fontWeight: '500' },
  labelActive: { color: colors.primary },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 6 },
  lineActive: { backgroundColor: colors.primary },
});

// ─── Sub-component: Coming Soon Badge ─────────────────────────────────────────
function ComingSoonBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[csStyles.badge, { transform: [{ scale: pulse }] }]}>
      <Ionicons name="time-outline" size={10} color="#fff" style={{ marginRight: 3 }} />
      <Text style={csStyles.text}>Coming Soon</Text>
    </Animated.View>
  );
}

const csStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 8,
  },
  text: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  // Password form state
  const [pwForm, setPwForm] = useState({ email: '', password: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // OTP state
  const [otpSubTab, setOtpSubTab] = useState('email'); // 'email' | 'mobile'
  const [otpStep, setOtpStep] = useState(1);           // 1 = enter email, 2 = enter OTP
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Main tab
  const [activeTab, setActiveTab] = useState(0); // 0 = Password, 1 = Email OTP

  const { setAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  // ─── Cleanup timer on unmount ────────────────────────────────────────────
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ─── Start countdown ─────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  // ─── Reset OTP flow ───────────────────────────────────────────────────────
  const resetOtpFlow = () => {
    setOtpStep(1);
    setOtp('');
    setOtpEmail('');
    setOtpError(false);
    clearInterval(countdownRef.current);
    setCountdown(0);
  };

  // ─── Tab switch resets sub-state ─────────────────────────────────────────
  const handleTabSwitch = (idx) => {
    setActiveTab(idx);
    resetOtpFlow();
    setPwForm({ email: '', password: '' });
  };

  // ─── Password Login ───────────────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!pwForm.email || !pwForm.password) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Enter email and password' });
      return;
    }
    setPwLoading(true);
    try {
      const { user, token } = await authService.login(pwForm);
      await setAuth(user, token);
      Toast.show({ type: 'success', text1: `Welcome back, ${user.name.split(' ')[0]}! 👋` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  // ─── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!isValidEmail(otpEmail)) {
      Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email address' });
      return;
    }
    setOtpLoading(true);
    try {
      await authService.sendOtp(otpEmail.trim(), 'login');
      setOtpStep(2);
      startCountdown();
      Toast.show({ type: 'success', text1: 'OTP Sent!', text2: `Check your inbox at ${otpEmail.trim()}` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Could not send OTP', text2: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp('');
    setOtpError(false);
    setOtpLoading(true);
    try {
      await authService.sendOtp(otpEmail.trim(), 'login');
      startCountdown();
      Toast.show({ type: 'info', text1: 'OTP Resent', text2: 'A new OTP has been sent to your email' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Resend failed', text2: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Verify OTP & Login ───────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError(true);
      Toast.show({ type: 'error', text1: 'Incomplete OTP', text2: 'Enter all 6 digits' });
      return;
    }
    setOtpLoading(true);
    setOtpError(false);
    try {
      const { user, token } = await authService.loginWithOtp(otpEmail.trim(), otp);
      await setAuth(user, token);
      Toast.show({ type: 'success', text1: `Welcome back, ${user.name.split(' ')[0]}! 👋` });
    } catch (err) {
      setOtpError(true);
      setOtp('');
      Toast.show({ type: 'error', text1: 'Verification failed', text2: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={styles.gradient}
        >
        {/* Brand Area */}
        <View style={[styles.brand, { paddingTop: insets.top + 40 }]}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={32} color="#fff" />
          </View>
          <Text style={styles.brandName}>PGinfo.online</Text>
          <Text style={styles.brandTagline}>Find your perfect PG, no brokerage</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSub}>Sign in to continue</Text>

          {/* Main Tab Switcher */}
          <TabSwitcher tabs={AUTH_TABS} activeIndex={activeTab} onPress={handleTabSwitch} />

          {/* ── TAB 0: Password Login ─────────────────────────────────────── */}
          {activeTab === 0 && (
            <View>
              <Input
                label="Email Address"
                placeholder="you@email.com"
                value={pwForm.email}
                onChangeText={(v) => setPwForm((p) => ({ ...p, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Password"
                placeholder="Your password"
                value={pwForm.password}
                onChangeText={(v) => setPwForm((p) => ({ ...p, password: v }))}
                secureTextEntry
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
              />
              <Button
                title={pwLoading ? 'Signing in…' : 'Sign In'}
                onPress={handlePasswordLogin}
                loading={pwLoading}
                fullWidth size="lg"
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* ── TAB 1: OTP Login ──────────────────────────────────────────── */}
          {activeTab === 1 && (
            <View>
              {/* Sub-tab: Email OTP vs Mobile OTP */}
              <View style={styles.subTabRow}>
                {/* Email OTP button */}
                <TouchableOpacity
                  style={[styles.subTab, otpSubTab === 'email' && styles.subTabActive]}
                  onPress={() => setOtpSubTab('email')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="mail-outline"
                    size={14}
                    color={otpSubTab === 'email' ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.subTabText, otpSubTab === 'email' && styles.subTabTextActive]}>
                    Email OTP
                  </Text>
                </TouchableOpacity>

                {/* Mobile OTP button — disabled */}
                <View style={[styles.subTab, styles.subTabDisabled]}>
                  <Ionicons name="phone-portrait-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.subTabText}>Mobile OTP</Text>
                  <ComingSoonBadge />
                </View>
              </View>

              {/* ── Email OTP flow ──────────────────────────────────────────── */}
              {otpSubTab === 'email' && (
                <View>
                  <OtpStep step={otpStep} />

                  {/* Step 1: Enter email */}
                  {otpStep === 1 && (
                    <View>
                      <Input
                        label="Email Address"
                        placeholder="you@email.com"
                        value={otpEmail}
                        onChangeText={(v) => setOtpEmail(v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
                      />
                      <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={15} color={colors.info} />
                        <Text style={styles.infoText}>
                          We&apos;ll send a 6-digit code to your email. Valid for 5 minutes.
                        </Text>
                      </View>
                      <Button
                        title={otpLoading ? 'Sending OTP…' : 'Send OTP'}
                        onPress={handleSendOtp}
                        loading={otpLoading}
                        fullWidth size="lg"
                        style={{ marginTop: 8 }}
                      />
                    </View>
                  )}

                  {/* Step 2: Enter OTP */}
                  {otpStep === 2 && (
                    <View>
                      <View style={styles.sentToBox}>
                        <Ionicons name="mail" size={16} color={colors.primary} />
                        <Text style={styles.sentToText}>
                          OTP sent to <Text style={styles.sentEmail}>{otpEmail}</Text>
                        </Text>
                        <TouchableOpacity onPress={resetOtpFlow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.otpLabel}>Enter 6-digit code</Text>
                      <OtpInput
                        value={otp}
                        onChange={(val) => { setOtp(val); setOtpError(false); }}
                        hasError={otpError}
                        disabled={otpLoading}
                        style={{ marginBottom: 6 }}
                      />
                      {otpError && (
                        <View style={styles.errorRow}>
                          <Ionicons name="alert-circle" size={13} color={colors.error} />
                          <Text style={styles.errorMsg}> Incorrect OTP. Please try again.</Text>
                        </View>
                      )}

                      {/* Resend row */}
                      <View style={styles.resendRow}>
                        <Text style={styles.resendLabel}>Didn&apos;t receive it?</Text>
                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={countdown > 0 || otpLoading}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}>
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Button
                        title={otpLoading ? 'Verifying…' : 'Verify & Sign In'}
                        onPress={handleVerifyOtp}
                        loading={otpLoading}
                        disabled={otp.length < 6 || otpLoading}
                        fullWidth size="lg"
                        style={{ marginTop: 12 }}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* ── Mobile OTP placeholder ──────────────────────────────────── */}
              {otpSubTab === 'mobile' && null /* never reachable since button is disabled */}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.surface },
  gradient: { flex: 1 },
  brand: { alignItems: 'center', paddingBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  brandName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    flex: 1, padding: spacing.screenPadding,
    paddingTop: 28,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },

  // Sub-tabs (Email OTP / Mobile OTP)
  subTabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  subTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    gap: 5,
  },
  subTabActive: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  subTabDisabled: { opacity: 0.55, backgroundColor: '#F8FAFC' },
  subTabText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  subTabTextActive: { color: colors.primary },

  // Info box
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.infoBg, borderRadius: 10,
    padding: 12, marginBottom: 4,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },

  // Sent-to confirmation row
  sentToBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 20,
  },
  sentToText: { flex: 1, fontSize: 12, color: colors.textSecondary },
  sentEmail: { fontWeight: '700', color: colors.primary },
  changeText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  // OTP label
  otpLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 12 },

  // Error
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  errorMsg: { fontSize: 12, color: colors.error },

  // Resend
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 14 },
  resendLabel: { fontSize: 13, color: colors.textSecondary },
  resendBtn: { fontSize: 13, fontWeight: '700', color: colors.primary },
  resendBtnDisabled: { color: colors.textMuted },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.textSecondary },
  footerLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
