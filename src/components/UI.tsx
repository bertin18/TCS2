import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}</View>;
}

export function Button({ label, onPress, secondary = false, compact = false }: { label: string; onPress: () => void; secondary?: boolean; compact?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, compact && styles.compact, pressed && styles.pressed]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
}

export function Field({ label, value, onChangeText, placeholder, numeric = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; numeric?: boolean }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={numeric ? 'decimal-pad' : 'default'} style={styles.input} /></View>;
}

export function Progress({ value, max }: { value: number; max: number }) {
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.min(100, Math.round(value / Math.max(max, 1) * 100)) }} style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value / Math.max(max, 1) * 100))}%` }]} /></View>;
}

export const textStyles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.7 },
  body: { color: colors.ink, fontSize: 16 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 17, fontWeight: '700' },
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.line, gap: 12 },
  sectionHeading: { gap: 3, marginTop: 8 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  muted: textStyles.muted,
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.forest, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.mint },
  compact: { minHeight: 40, paddingVertical: 9 },
  pressed: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryText: { color: colors.forest },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FAFCF9', borderRadius: 13, paddingHorizontal: 14, color: colors.ink, fontSize: 16 },
  track: { height: 9, borderRadius: 9, backgroundColor: colors.mint, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9, backgroundColor: colors.green },
});
