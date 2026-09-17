import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, SectionTitle, textStyles } from '../components/UI';
import type { Meal } from '../data';
import { colors } from '../theme';

const periods = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];
export function MealsScreen({ meals, addMeal }: { meals: Meal[]; addMeal: (meal: Meal) => void }) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState(periods[0]);
  function save() {
    if (!name.trim()) { Alert.alert('Informe a refeição', 'Digite o que você comeu para salvar o registro.'); return; }
    addMeal({ id: Date.now(), name: name.trim(), period, detail: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()) });
    setName('');
  }
  return <View style={styles.content}><View><Text style={textStyles.title}>Alimentação</Text><Text style={textStyles.muted}>Registre suas refeições sem complicação.</Text></View>
    <Card><SectionTitle title="Nova refeição" /><Field label="O que você comeu?" value={name} onChangeText={setName} placeholder="Ex.: sanduíche e fruta" /><Text style={styles.label}>Período do dia</Text><View style={styles.chips}>{periods.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: period === item }} onPress={() => setPeriod(item)} style={[styles.chip, period === item && styles.selected]}><Text style={[styles.chipText, period === item && styles.selectedText]}>{item}</Text></Pressable>)}</View><Button label="Salvar refeição" onPress={save} /></Card>
    <SectionTitle title="Refeições de hoje" subtitle={`${meals.length} registros`} />
    {meals.length === 0 ? <Card><Text style={textStyles.muted}>Nenhuma refeição registrada ainda.</Text></Card> : meals.slice().reverse().map(meal => <Card key={meal.id}><View style={styles.mealRow}><View style={styles.dot} /><View style={styles.mealText}><Text style={textStyles.label}>{meal.name}</Text><Text style={textStyles.muted}>{meal.period}</Text></View><Text style={textStyles.muted}>{meal.detail}</Text></View></Card>)}
  </View>;
}
const styles = StyleSheet.create({ content: { gap: 18 }, label: { ...textStyles.label, fontSize: 14 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderRadius: 30, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line }, selected: { backgroundColor: colors.mint, borderColor: colors.green }, chipText: { color: colors.ink, fontSize: 13, fontWeight: '600' }, selectedText: { color: colors.forest }, mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange }, mealText: { flex: 1, gap: 3 } });
