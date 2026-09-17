import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initialGoals, initialHabits, initialMeals, type Meal } from './data';
import { HomeScreen } from './screens/HomeScreen';
import { MealsScreen } from './screens/MealsScreen';
import { HabitsScreen } from './screens/HabitsScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { colors } from './theme';

const tabs = [
  { name: 'Início', icon: '⌂' },
  { name: 'Alimentação', icon: '◉' },
  { name: 'Hábitos', icon: '◌' },
  { name: 'Evolução', icon: '▥' },
];

function Prototype() {
  const [screen, setScreen] = useState('Início');
  const [meals, setMeals] = useState(initialMeals);
  const [habits, setHabits] = useState(initialHabits);
  const [goals, setGoals] = useState(initialGoals);
  const [name, setName] = useState('Visitante');
  function content() {
    switch (screen) {
      case 'Alimentação': return <MealsScreen meals={meals} addMeal={(meal: Meal) => setMeals(current => [...current, meal])} />;
      case 'Hábitos': return <HabitsScreen habits={habits} goals={goals} setHabits={setHabits} />;
      case 'Evolução': return <ProgressScreen />;
      case 'Metas': return <GoalsScreen goals={goals} setGoals={setGoals} />;
      case 'Perfil': return <ProfileScreen name={name} setName={setName} />;
      default: return <HomeScreen habits={habits} goals={goals} meals={meals} goTo={setScreen} />;
    }
  }
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}><StatusBar style="dark" /><View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Ir para início" onPress={() => setScreen('Início')}><Text style={styles.brand}>✳ VivaBem</Text></Pressable><Text style={styles.headerTag}>BEM-ESTAR TODO DIA</Text></View>{(screen === 'Metas' || screen === 'Perfil') && <Pressable accessibilityRole="button" onPress={() => setScreen('Início')} style={styles.back}><Text style={styles.backText}>‹ Voltar ao início</Text></Pressable>}<ScrollView key={screen} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.page}>{content()}</View></ScrollView><View style={styles.tabs}>{tabs.map(tab => <Pressable key={tab.name} accessibilityRole="tab" accessibilityLabel={tab.name} accessibilityState={{ selected: screen === tab.name }} onPress={() => setScreen(tab.name)} style={styles.tab}><Text style={[styles.tabIcon, screen === tab.name && styles.active]}>{tab.icon}</Text><Text style={[styles.tabText, screen === tab.name && styles.active]}>{tab.name}</Text></Pressable>)}</View></SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><Prototype /></SafeAreaProvider>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.line, gap: 8 }, brand: { color: colors.forest, fontSize: 22, fontWeight: '900' }, headerTag: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, back: { paddingHorizontal: 22, paddingTop: 12 }, backText: { color: colors.green, fontSize: 15, fontWeight: '700' }, scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 18, paddingTop: 24, paddingBottom: 35 }, page: { width: '100%', maxWidth: 600 }, tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingTop: 7, paddingBottom: 5 }, tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 }, tabIcon: { color: colors.muted, fontSize: 23, lineHeight: 25 }, tabText: { color: colors.muted, fontSize: 10, fontWeight: '700' }, active: { color: colors.green } });
