import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Progress, SectionTitle, textStyles } from '../components/UI';
import type { Goals, Habits } from '../data';
import { colors } from '../theme';

export function HabitsScreen({ habits, goals, setHabits }: { habits: Habits; goals: Goals; setHabits: (next: Habits) => void }) {
  const [sleep, setSleep] = useState('');
  const [activity, setActivity] = useState('');
  function saveNumber(kind: 'sleep' | 'activity', raw: string, clear: () => void) {
    const value = Number(raw.replace(',', '.'));
    if (!raw.trim() || !Number.isFinite(value) || value < 0 || (kind === 'sleep' && value > 24)) { Alert.alert('Valor inválido', kind === 'sleep' ? 'Informe um número entre 0 e 24 horas.' : 'Informe um número de minutos igual ou maior que zero.'); return; }
    setHabits({ ...habits, [kind]: value }); clear();
  }
  return <View style={styles.content}><View><Text style={textStyles.title}>Hábitos</Text><Text style={textStyles.muted}>Acompanhe água, descanso e movimento.</Text></View>
    <Card style={styles.waterCard}><Text style={styles.emoji}>💧</Text><Text style={textStyles.label}>Hidratação</Text><Text style={styles.number}>{habits.water} <Text style={styles.unit}>ml de {goals.water} ml</Text></Text><Progress value={habits.water} max={goals.water} /><Button label="+ 250 ml de água" onPress={() => setHabits({ ...habits, water: habits.water + 250 })} /></Card>
    <SectionTitle title="Outros registros" />
    <Card><Text style={styles.emoji}>🌙</Text><Text style={textStyles.label}>Sono</Text><Text style={textStyles.muted}>Hoje: {habits.sleep} h · Meta: {goals.sleep} h</Text><Field label="Horas dormidas" value={sleep} onChangeText={setSleep} placeholder="Ex.: 7,5" numeric /><Button label="Atualizar sono" onPress={() => saveNumber('sleep', sleep, () => setSleep(''))} secondary /></Card>
    <Card><Text style={styles.emoji}>☀️</Text><Text style={textStyles.label}>Atividade física</Text><Text style={textStyles.muted}>Hoje: {habits.activity} min · Meta: {goals.activity} min</Text><Field label="Minutos de atividade" value={activity} onChangeText={setActivity} placeholder="Ex.: 30" numeric /><Button label="Atualizar atividade" onPress={() => saveNumber('activity', activity, () => setActivity(''))} secondary /></Card>
  </View>;
}
const styles = StyleSheet.create({ content: { gap: 18 }, waterCard: { backgroundColor: '#EDF6F5' }, emoji: { fontSize: 27 }, number: { color: colors.forest, fontSize: 32, fontWeight: '800' }, unit: { color: colors.muted, fontSize: 15, fontWeight: '500' } });
