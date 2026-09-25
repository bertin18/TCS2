import { StyleSheet, Text, View } from 'react-native';
import { Card, ScreenTitle, SectionTitle, textStyles } from '../components/UI';
import { dailySummary, lastSevenDays, mealsForDate, type Meal, type HabitEntry } from '../data';
import { colors } from '../theme';

export function ProgressScreen({ meals, entries, today }: { meals: Meal[]; entries: HabitEntry[]; today: string }) {
  const days = lastSevenDays(new Date(today + 'T12:00:00'));
  const summaries = days.map(day => dailySummary(day, meals, entries));
  const largestWater = Math.max(1, ...summaries.map(day => day.water));
  const hasRecords = meals.length > 0 || entries.length > 0;
  const dateLabel = (day: string) => new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

  return <View style={styles.content}>
    <ScreenTitle title="Evolução" subtitle="Seus registros nos últimos sete dias." />
    {!hasRecords ? <Card><Text style={textStyles.body}>Você ainda não tem registros nesta semana. Registre uma refeição ou um hábito para começar a acompanhar sua rotina.</Text></Card> : null}
    <Card>
      <SectionTitle title="Água por dia" subtitle="Quantidade registrada em mililitros; não é uma avaliação de saúde." />
      {summaries.map(day => <View key={day.localDate} style={styles.chartRow}>
        <Text style={textStyles.body}>{dateLabel(day.localDate)}: {day.water.toLocaleString('pt-BR')} ml</Text>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.track}>
          <View style={[styles.bar, { width: `${day.water / largestWater * 100}%` }]} />
        </View>
      </View>)}
      <Text style={textStyles.muted}>As barras comparam as quantidades da semana entre si. Dias sem registros aparecem com zero.</Text>
    </Card>
    <SectionTitle title="Resumo por dia" />
    {summaries.slice().reverse().map(day => {
      const dayMeals = mealsForDate(meals, day.localDate);
      const recorded = dayMeals.length > 0 || entries.some(entry => entry.localDate === day.localDate);
      return <Card key={day.localDate}>
        <Text accessibilityRole="header" style={textStyles.label}>{dateLabel(day.localDate)}</Text>
        {!recorded ? <Text style={textStyles.muted}>Sem registros neste dia.</Text> : <>
          <Text style={textStyles.body}>Água: {day.water.toLocaleString('pt-BR')} ml</Text>
          <Text style={textStyles.body}>Sono: {day.sleep.toLocaleString('pt-BR')} horas</Text>
          <Text style={textStyles.body}>Atividade: {day.activity.toLocaleString('pt-BR')} minutos</Text>
          <Text style={textStyles.body}>Refeições: {day.mealCount}</Text>
          {dayMeals.map(meal => <Text key={meal.id} style={textStyles.muted}>{meal.period}: {meal.name}</Text>)}
        </>}
      </Card>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  content: { gap: 18 },
  chartRow: { gap: 8 },
  track: { height: 12, borderRadius: 8, backgroundColor: colors.mint, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.green, borderRadius: 8 },
});
