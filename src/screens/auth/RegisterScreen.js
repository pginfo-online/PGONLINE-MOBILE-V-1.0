import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Keyboard, KeyboardAvoidingView,
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
const AUTH_TABS = ['Standard', 'Email OTP'];

// ─── Helper ───────────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
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
            {n === 1 ? 'Enter details' : 'Verify OTP'}
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  // Standard registration form
  const [stdForm, setStdForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [stdLoading, setStdLoading] = useState(false);

  // OTP registration state
  const [otpForm, setOtpForm] = useState({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Main tab
  const [activeTab, setActiveTab] = useState(0); // 0 = Standard, 1 = Email OTP

  const { setAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ─── Countdown ───────────────────────────────────────────────────────────
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
    setOtpError(false);
    clearInterval(countdownRef.current);
    setCountdown(0);
  };

  const handleTabSwitch = (idx) => {
    setActiveTab(idx);
    resetOtpFlow();
    setStdForm({ name: '', email: '', phone: '', password: '' });
  };

  // ─── Standard Registration Validation ────────────────────────────────────
  const validateStdForm = () => {
    if (!stdForm.name.trim()) return 'Name is required';
    if (!isValidEmail(stdForm.email)) return 'Enter a valid email';
    if (!/^[6-9]\d{9}$/.test(stdForm.phone)) return 'Enter a valid 10-digit mobile number';
    if (stdForm.password.length < 6) return 'Password must be 6+ characters';
    return null;
  };

  // ─── Standard Register ────────────────────────────────────────────────────
  const handleStdRegister = async () => {
    const err = validateStdForm();
    if (err) { Toast.show({ type: 'error', text1: 'Validation Error', text2: err }); return; }
    setStdLoading(true);
    try {
      const { user, token } = await authService.register(stdForm);
      await setAuth(user, token);
      Toast.show({ type: 'success', text1: `Welcome, ${user.name.split(' ')[0]}! 🎉` });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: e.message });
    } finally { setStdLoading(false); }
  };

  // ─── OTP: Validate Step 1 form ───────────────────────────────────────────
  const validateOtpForm = () => {
    if (!otpForm.name.trim() || otpForm.name.trim().length < 2) return 'Enter your full name';
    if (!isValidEmail(otpForm.email)) return 'Enter a valid email address';
    if (otpForm.phone && !/^[6-9]\d{9}$/.test(otpForm.phone))
      return 'Enter a valid 10-digit mobile number';
    return null;
  };

  // ─── OTP: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const err = validateOtpForm();
    if (err) { Toast.show({ type: 'error', text1: 'Validation Error', text2: err }); return; }
    setOtpLoading(true);
    try {
      await authService.sendOtp(otpForm.email.trim(), 'register');
      setOtpStep(2);
      startCountdown();
      Toast.show({ type: 'success', text1: 'OTP Sent!', text2: `Check your inbox at ${otpForm.email.trim()}` });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Could not send OTP', text2: e.message });
    } finally { setOtpLoading(false); }
  };

  // ─── OTP: Resend ─────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp('');
    setOtpError(false);
    setOtpLoading(true);
    try {
      await authService.sendOtp(otpForm.email.trim(), 'register');
      startCountdown();
      Toast.show({ type: 'info', text1: 'OTP Resent', text2: 'A new code was sent to your email' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Resend failed', text2: e.message });
    } finally { setOtpLoading(false); }
  };

  // ─── OTP: Verify & Register ───────────────────────────────────────────────
  const handleVerifyAndRegister = async () => {
    if (otp.length < 6) {
      setOtpError(true);
      Toast.show({ type: 'error', text1: 'Incomplete OTP', text2: 'Enter all 6 digits' });
      return;
    }
    setOtpLoading(true);
    setOtpError(false);
    try {
      const { user, token } = await authService.registerWithOtp({
        name: otpForm.name.trim(),
        email: otpForm.email.trim(),
        phone: otpForm.phone?.trim() || undefined,
        otp,
      });
      await setAuth(user, token);
      Toast.show({ type: 'success', text1: `Welcome, ${user.name.split(' ')[0]}! 🎉` });
    } catch (e) {
      setOtpError(true);
      setOtp('');
      Toast.show({ type: 'error', text1: 'Registration failed', text2: e.message });
    } finally { setOtpLoading(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid]} style={styles.topBand} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Join thousands finding PGs the right way</Text>
        </View>

        {/* Tab switcher */}
        <View style={{ paddingHorizontal: 16 }}>
          <TabSwitcher tabs={AUTH_TABS} activeIndex={activeTab} onPress={handleTabSwitch} />
        </View>

        <View style={styles.card}>

          {/* ── TAB 0: Standard Registration ──────────────────────────────── */}
          {activeTab === 0 && (
            <View>
              <Input
                label="Full Name"
                placeholder="Amit Kumar"
                value={stdForm.name}
                onChangeText={(v) => setStdForm((p) => ({ ...p, name: v }))}
                leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Email Address"
                placeholder="you@email.com"
                value={stdForm.email}
                onChangeText={(v) => setStdForm((p) => ({ ...p, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Mobile Number"
                placeholder="9876543210"
                value={stdForm.phone}
                onChangeText={(v) => setStdForm((p) => ({ ...p, phone: v }))}
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Password"
                placeholder="Min. 6 characters"
                value={stdForm.password}
                onChangeText={(v) => setStdForm((p) => ({ ...p, password: v }))}
                secureTextEntry
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
              />
              <Button
                title={stdLoading ? 'Creating account…' : 'Create Account'}
                onPress={handleStdRegister}
                loading={stdLoading}
                fullWidth size="lg"
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* ── TAB 1: OTP Registration ───────────────────────────────────── */}
          {activeTab === 1 && (
            <View>
              <OtpStep step={otpStep} />

              {/* Step 1: Fill details and request OTP */}
              {otpStep === 1 && (
                <View>
                  <Input
                    label="Full Name"
                    placeholder="Amit Kumar"
                    value={otpForm.name}
                    onChangeText={(v) => setOtpForm((p) => ({ ...p, name: v }))}
                    leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
                  />
                  <Input
                    label="Email Address"
                    placeholder="you@email.com"
                    value={otpForm.email}
                    onChangeText={(v) => setOtpForm((p) => ({ ...p, email: v }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
                  />
                  <Input
                    label="Mobile Number (optional)"
                    placeholder="9876543210"
                    value={otpForm.phone}
                    onChangeText={(v) => setOtpForm((p) => ({ ...p, phone: v }))}
                    keyboardType="phone-pad"
                    leftIcon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
                  />
                  <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.info} />
                    <Text style={styles.infoText}>
                      A 6-digit verification code will be sent to your email. No password required.
                    </Text>
                  </View>
                  <Button
                    title={otpLoading ? 'Sending OTP…' : 'Send Verification Code'}
                    onPress={handleSendOtp}
                    loading={otpLoading}
                    fullWidth size="lg"
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}

              {/* Step 2: Enter OTP to complete registration */}
              {otpStep === 2 && (
                <View>
                  <View style={styles.sentToBox}>
                    <Ionicons name="mail" size={16} color={colors.primary} />
                    <Text style={styles.sentToText}>
                      Code sent to <Text style={styles.sentEmail}>{otpForm.email}</Text>
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

                  {/* Resend */}
                  <View style={styles.resendRow}>
                    <Text style={styles.resendLabel}>Didn’t receive it?</Text>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={countdown > 0 || otpLoading}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}>
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    title={otpLoading ? 'Creating account…' : 'Verify & Create Account'}
                    onPress={handleVerifyAndRegister}
                    loading={otpLoading}
                    disabled={otp.length < 6 || otpLoading}
                    fullWidth size="lg"
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.surface },
  topBand: { height: 220, position: 'absolute', top: 0, left: 0, right: 0 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  backBtn: {
    marginTop: 56, marginLeft: 20, width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  header: { padding: 20, paddingTop: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: 24,
    margin: 16, padding: spacing.screenPadding,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },

  // Info box
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.infoBg, borderRadius: 10,
    padding: 12, marginBottom: 4,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },

  // Sent-to row
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
  resendRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4, marginTop: 14,
  },
  resendLabel: { fontSize: 13, color: colors.textSecondary },
  resendBtn: { fontSize: 13, fontWeight: '700', color: colors.primary },
  resendBtnDisabled: { color: colors.textMuted },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: colors.textSecondary },
  footerLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
