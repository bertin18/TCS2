import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo, Platform, Pressable, StyleSheet, Text, TextInput, View,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { colors } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const titleRef = useRef<Text>(null);
  const focused = useRef(false);
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  return <View style={styles.heading}>
    <Text ref={titleRef} accessibilityRole="header" style={textStyles.title} onLayout={() => {
      if (focused.current) return;
      focused.current = true;
      frame.current = requestAnimationFrame(() => {
        if (titleRef.current) AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
      });
    }}>{title}</Text>
    {subtitle ? <Text style={textStyles.muted}>{subtitle}</Text> : null}
  </View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionHeading}>
    <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={textStyles.muted}>{subtitle}</Text> : null}
  </View>;
}

type ButtonProps = {
  label: string; onPress: () => void; secondary?: boolean; compact?: boolean;
  disabled?: boolean; hint?: string;
};

export function Button({ label, onPress, secondary = false, compact = false, disabled = false, hint }: ButtonProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint}
    accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary,
      compact && styles.compact, disabled && styles.disabled,
      pressed && !disabled && (secondary ? styles.secondaryPressed : styles.primaryPressed)]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryText, disabled && styles.disabledText]}>{label}</Text>
  </Pressable>;
}

type FieldProps = {
  label: string; value: string; onChangeText: (value: string) => void;
  placeholder?: string; numeric?: boolean; error?: string; hint?: string; maxLength?: number;
  editable?: boolean; secureTextEntry?: boolean; email?: boolean;
};

export function Field({ label, value, onChangeText, placeholder, numeric = false, error, hint, maxLength, editable = true, secureTextEntry = false, email = false }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput accessibilityLabel={label} accessibilityHint={error ? `Erro: ${error}` : hint}
      value={value} onChangeText={onChangeText} placeholder={placeholder} maxLength={maxLength}
      editable={editable} accessibilityState={{ disabled: !editable }} secureTextEntry={secureTextEntry}
      autoCapitalize={email || secureTextEntry ? 'none' : 'sentences'} autoCorrect={!email && !secureTextEntry}
      placeholderTextColor={colors.muted} keyboardType={numeric ? 'decimal-pad' : email ? 'email-address' : 'default'}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={[styles.input, focused && styles.inputFocused, Boolean(error) && styles.inputError]} />
    {error ? <Text style={styles.errorText}>Erro: {error}</Text>
      : hint ? <Text style={textStyles.muted}>{hint}</Text> : null}
  </View>;
}

export function Feedback({ message, kind = 'success' }: { message: string; kind?: 'success' | 'error' }) {
  const announcement = `${kind === 'error' ? 'Confira os dados' : 'Concluído'}: ${message}`;
  useEffect(() => {
    // Android usa a região viva; iOS precisa do anúncio explícito.
    if (message && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(announcement);
  }, [message, announcement]);
  if (!message) return null;
  return <View style={[styles.feedback, kind === 'error' && styles.feedbackError]}>
    <Text accessible accessibilityLiveRegion="polite"
      style={[styles.feedbackText, kind === 'error' && styles.errorText]}>{announcement}</Text>
  </View>;
}

export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = Math.min(100, Math.max(0, Math.round(value / Math.max(max, 1) * 100)));
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent}% da meta` }} style={styles.track}>
    <View style={[styles.fill, { width: `${percent}%` }]} />
  </View>;
}

export const textStyles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.7 },
  body: { color: colors.ink, fontSize: 16 },
  muted: { color: colors.muted, fontSize: 16 },
  label: { color: colors.ink, fontSize: 17, fontWeight: '700' },
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.line, gap: 12 },
  heading: { gap: 8 },
  sectionHeading: { gap: 5, marginTop: 8 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  button: { minHeight: 48, minWidth: 48, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.forest,
    borderRadius: 14, borderWidth: 2, borderColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.mint, borderColor: colors.mint },
  compact: { paddingHorizontal: 12 },
  primaryPressed: { backgroundColor: colors.ink, borderColor: colors.lime },
  secondaryPressed: { backgroundColor: colors.pressed, borderColor: colors.forest },
  disabled: { backgroundColor: colors.line, borderColor: colors.line },
  disabledText: { color: colors.muted },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondaryText: { color: colors.forest },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 2, borderColor: colors.inputBorder, backgroundColor: '#FAFCF9',
    borderRadius: 13, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontSize: 16 },
  inputFocused: { borderColor: colors.forest, backgroundColor: colors.surface },
  inputError: { borderColor: colors.error, backgroundColor: colors.errorBackground },
  track: { height: 10, borderRadius: 10, backgroundColor: colors.mint, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 10, backgroundColor: colors.green },
  feedback: { padding: 14, borderRadius: 12, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.green },
  feedbackError: { backgroundColor: colors.errorBackground, borderColor: colors.error },
  feedbackText: { color: colors.forest, fontSize: 16 },
  errorText: { color: colors.error, fontSize: 16 },
});
