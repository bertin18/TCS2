import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, textStyles } from '../components/UI';
import type { Goals } from '../data';

export function GoalsScreen({ goals, setGoals }: { goals: Goals; setGoals: (goals: Goals) => void }) {
  const [water, setWater] = useState(String(goals.water));
  const [sleep, setSleep] = useState(String(goals.sleep));
  const [activity, setActivity] = useState(String(goals.activity));
  function save() {
    const next = { water: Number(water.replace(',', '.')), sleep: Number(sleep.replace(',', '.')), activity: Number(activity.replace(',', '.')) };
    if (Object.values(next).some(value => !Number.isFinite(value) || value <= 0) || next.sleep > 24) { Alert.alert('Confira as metas', 'Use números maiores que zero; para sono, até 24 horas.'); return; }
    setGoals(next); Alert.alert('Metas atualizadas', 'Suas metas pessoais foram salvas nesta sessão.');
  }
  return <View style={styles.content}><View><Text style={textStyles.title}>Suas metas</Text><Text style={textStyles.muted}>Ajuste seus objetivos de acordo com sua rotina.</Text></View><Card><Field label="Água por dia (ml)" value={water} onChangeText={setWater} numeric /><Field label="Sono por dia (horas)" value={sleep} onChangeText={setSleep} numeric /><Field label="Atividade por dia (minutos)" value={activity} onChangeText={setActivity} numeric /><Button label="Salvar metas" onPress={save} /></Card><Text style={textStyles.muted}>Estas são metas pessoais para demonstração, sem recomendação clínica.</Text></View>;
}
const styles = StyleSheet.create({ content: { gap: 18 } });
