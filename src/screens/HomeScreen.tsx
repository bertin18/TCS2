import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Progress, SectionTitle, textStyles } from '../components/UI';
import type { Goals, Habits, Meal } from '../data';
import { colors } from '../theme';

export function HomeScreen({ habits, goals, meals, goTo }: { habits: Habits; goals: Goals; meals: Meal[]; goTo: (screen: string) => void }) {
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <View style={styles.content}>
    <View><Text style={styles.eyebrow}>{today}</Text><Text style={textStyles.title}>Seu dia, no seu ritmo.</Text><Text style={textStyles.muted}>Pequenos registros ajudam a enxergar sua evolução.</Text></View>
    <Card style={styles.hero}><Text style={styles.heroLabel}>RESUMO DE HOJE</Text><Text style={styles.heroTitle}>Cada passo conta 🌿</Text><Text style={styles.heroText}>Você já registrou {meals.length} {meals.length === 1 ? 'refeição' : 'refeições'} hoje.</Text><Button label="Registrar refeição" onPress={() => goTo('Alimentação')} secondary /></Card>
    <SectionTitle title="Seu progresso" subtitle="Metas pessoais de hoje" />
    <Card><ProgressRow label="Água" value={`${habits.water} ml`} goal={`${goals.water} ml`} current={habits.water} target={goals.water} /><ProgressRow label="Sono" value={`${habits.sleep} h`} goal={`${goals.sleep} h`} current={habits.sleep} target={goals.sleep} /><ProgressRow label="Atividade" value={`${habits.activity} min`} goal={`${goals.activity} min`} current={habits.activity} target={goals.activity} /></Card>
    <View style={styles.actions}><View style={styles.action}><Button label="Ajustar metas" onPress={() => goTo('Metas')} secondary /></View><View style={styles.action}><Button label="Meu perfil" onPress={() => goTo('Perfil')} secondary /></View></View>
  </View>;
}

function ProgressRow({ label, value, goal, current, target }: { label: string; value: string; goal: string; current: number; target: number }) {
  return <View style={styles.progressRow}><View style={styles.row}><Text style={textStyles.label}>{label}</Text><Text style={textStyles.muted}>{value} / {goal}</Text></View><Progress value={current} max={target} /></View>;
}

const styles = StyleSheet.create({ content: { gap: 20 }, eyebrow: { color: colors.green, fontSize: 14, fontWeight: '700', marginBottom: 9, textTransform: 'capitalize' }, hero: { backgroundColor: colors.forest, borderColor: colors.forest, padding: 24, gap: 13 }, heroLabel: { color: colors.lime, fontWeight: '800', letterSpacing: 1.4, fontSize: 12 }, heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '800' }, heroText: { color: '#D8E8DE', fontSize: 15, marginBottom: 8 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }, progressRow: { gap: 9, paddingVertical: 5 }, actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' }, action: { flexGrow: 1, minWidth: 130 } });
