import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Progress, ScreenTitle, SectionTitle, textStyles } from '../components/UI';
import type { Goals, Habits, Meal } from '../data';
import type { Screen } from '../navigation';
import { colors } from '../theme';

type HomeScreenProps = {
  name: string;
  habits: Habits;
  goals: Goals;
  meals: Meal[];
  goTo: (screen: Screen) => void;
};

export function HomeScreen({ name, habits, goals, meals, goTo }: HomeScreenProps) {
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>{today}</Text>
        <Text style={textStyles.body}>Olá, {name.trim() || 'visitante'}!</Text>
        <ScreenTitle
          title="Seu dia, no seu ritmo."
          subtitle="Pequenos registros ajudam a enxergar sua evolução."
        />
      </View>
      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>RESUMO DE HOJE</Text>
        <Text accessibilityRole="header" style={styles.heroTitle}>Cada passo conta 🌿</Text>
        <Text style={styles.heroText}>
          Você tem {meals.length} {meals.length === 1 ? 'refeição registrada' : 'refeições registradas'} hoje.
        </Text>
        <Button label="Registrar refeição" onPress={() => goTo('Alimentação')} secondary />
      </Card>
      <SectionTitle title="Seu progresso" subtitle="Metas pessoais de hoje" />
      <Card>
        <ProgressRow
          label="Água"
          unit="mililitros"
          value={`${habits.water} ml`}
          goal={`${goals.water} ml`}
          current={habits.water}
          target={goals.water}
        />
        <ProgressRow
          label="Sono"
          unit="horas"
          value={`${habits.sleep} h`}
          goal={`${goals.sleep} h`}
          current={habits.sleep}
          target={goals.sleep}
        />
        <ProgressRow
          label="Atividade"
          unit="minutos"
          value={`${habits.activity} min`}
          goal={`${goals.activity} min`}
          current={habits.activity}
          target={goals.activity}
        />
        <Text style={textStyles.muted}>
          As metas são pessoais e editáveis. Os valores sugeridos inicialmente não são recomendações de saúde.
        </Text>
      </Card>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Ajustar metas" onPress={() => goTo('Metas')} secondary />
        </View>
        <View style={styles.action}>
          <Button label="Meu perfil" onPress={() => goTo('Perfil')} secondary />
        </View>
      </View>
    </View>
  );
}

type ProgressRowProps = {
  label: string;
  unit: string;
  value: string;
  goal: string;
  current: number;
  target: number;
};

function ProgressRow({ label, unit, value, goal, current, target }: ProgressRowProps) {
  return (
    <View style={styles.progressRow}>
      <View
        style={styles.row}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={textStyles.label}>{label}</Text>
        <Text style={textStyles.muted}>{value} / {goal}</Text>
      </View>
      <Progress
        label={`${label}: ${current} ${unit} de uma meta de ${target} ${unit}`}
        value={current}
        max={target}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20 },
  heading: { gap: 9 },
  eyebrow: { color: colors.green, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  hero: { backgroundColor: colors.forest, borderColor: colors.forest, padding: 24, gap: 13 },
  heroLabel: { color: colors.lime, fontWeight: '800', letterSpacing: 1.4, fontSize: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '800' },
  heroText: { color: '#D8E8DE', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  progressRow: { gap: 9, paddingVertical: 5 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  action: { flexGrow: 1, minWidth: 130 },
});
