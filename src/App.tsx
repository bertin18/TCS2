import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { localDateKey, mealsForDate, totalHabitsForDate, type Goals, type HabitKind } from './data';
import { HomeScreen } from './screens/HomeScreen';
import { MealsScreen } from './screens/MealsScreen';
import { HabitsScreen } from './screens/HabitsScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AuthScreen } from './screens/AuthScreen';
import { Button, Card, Feedback, textStyles } from './components/UI';
import { initialHistory, navigationReducer, type Screen } from './navigation';
import { createMemoryRepository, createSupabaseRepository, type Repository, type Snapshot, type MealInput } from './services/repository';
import { supabase } from './services/supabase';
import { colors } from './theme';

const tabs: { name: Screen; icon: string }[] = [
  { name: 'Início', icon: '⌂' }, { name: 'Alimentação', icon: '◉' },
  { name: 'Hábitos', icon: '◌' }, { name: 'Evolução', icon: '▥' },
];

function EntryFrame({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" />
    <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.page}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function SessionGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);
  const [initializing, setInitializing] = useState(Boolean(supabase));
  const [sessionError, setSessionError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    setInitializing(true);
    setSessionError('');
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setSessionError('Não foi possível restaurar a sessão. Confira a conexão e tente novamente.');
      else setSession(data.session);
    }).catch(() => {
      if (active) setSessionError('Não foi possível acessar a sessão protegida neste aparelho.');
    }).finally(() => { if (active) setInitializing(false); });
    const { data: subscription } = client.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setSessionError(''); }
    });
    if (AppState.currentState === 'active') client.auth.startAutoRefresh();
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    return () => { active = false; subscription.subscription.unsubscribe(); appState.remove(); client.auth.stopAutoRefresh(); };
  }, [attempt]);

  const userId = session?.user.id;
  const repository = useMemo(() => userId && supabase
    ? createSupabaseRepository(supabase, userId) : createMemoryRepository(), [userId, demo]);

  if (initializing) return <EntryFrame><ActivityIndicator accessibilityLabel="Restaurando sessão" /><Text style={textStyles.body}>Abrindo o VivaBem…</Text></EntryFrame>;
  if (sessionError && !demo) return <EntryFrame><Feedback message={sessionError} kind="error" />
    <Button label="Tentar novamente" onPress={() => setAttempt(value => value + 1)} />
    <Button label="Explorar sem salvar" secondary onPress={() => setDemo(true)} /></EntryFrame>;
  if (!session && !demo) return <EntryFrame><AuthScreen onDemo={() => setDemo(true)} /></EntryFrame>;
  return <Notebook key={userId ?? 'demo'} repository={repository} demo={!session} onExit={async () => {
    if (session && supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw new Error('Não foi possível sair da conta. Verifique a conexão e tente novamente.');
    }
    setDemo(false);
  }} />;
}

function Notebook({ repository, demo, onExit }: { repository: Repository; demo: boolean; onExit: () => Promise<void> }) {
  const [history, dispatch] = useReducer(navigationReducer, initialHistory);
  const screen = history[history.length - 1];
  const previous = history[history.length - 2];
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [day, setDay] = useState(() => localDateKey(new Date()));
  const revision = useRef(0);
  const alive = useRef(true);
  const { width, height, fontScale } = useWindowDimensions();
  const wrapTabs = width < 360 || fontScale > 1.3;
  const compactViewport = height / fontScale < 440;

  const refresh = useCallback(async () => {
    const version = revision.current;
    setRefreshing(true); setLoadError('');
    try {
      const next = await repository.load();
      if (alive.current && revision.current === version) setSnapshot(next);
    } catch (error) {
      if (alive.current) setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os registros.');
    } finally { if (alive.current) setRefreshing(false); }
  }, [repository]);

  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => { alive.current = false; };
  }, [refresh]);
  useEffect(() => {
    const updateDay = () => setDay(localDateKey(new Date()));
    const timer = setInterval(updateDay, 30000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') updateDay(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const previousDay = useRef(day);
  useEffect(() => {
    if (previousDay.current !== day) { previousDay.current = day; void refresh(); }
  }, [day, refresh]);

  const runNavigation = useCallback((action: () => void) => {
    if (busy || refreshing) {
      Alert.alert('Aguarde um instante', 'Espere a operação terminar antes de mudar de tela.');
      return;
    }
    const proceed = () => { Keyboard.dismiss(); action(); };
    if (dirty) Alert.alert('Descartar alterações?', 'Há campos ainda não salvos nesta tela.', [
      { text: 'Continuar editando', style: 'cancel' },
      { text: 'Descartar e continuar', style: 'destructive', onPress: proceed },
    ]);
    else proceed();
  }, [busy, refreshing, dirty]);

  const goTo = useCallback((destination: Screen) => {
    if (destination !== screen) runNavigation(() => dispatch({ type: 'open', screen: destination }));
  }, [screen, runNavigation]);
  const goBack = useCallback(() => {
    if (previous) runNavigation(() => dispatch({ type: 'back' }));
  }, [previous, runNavigation]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!previous) return false;
      goBack(); return true;
    });
    return () => subscription.remove();
  }, [previous, goBack]);

  async function addMeal(input: MealInput) {
    const meal = await repository.addMeal(input);
    revision.current++;
    setDay(localDateKey(new Date()));
    setSnapshot(current => current && ({ ...current, meals: [...current.meals.filter(item => item.id !== meal.id), meal] }));
  }
  async function saveHabit(kind: HabitKind, value: number) {
    const entry = await repository.saveHabit(kind, value);
    revision.current++;
    setDay(localDateKey(new Date()));
    setSnapshot(current => current && ({ ...current, habitEntries: [...current.habitEntries.filter(item => item.id !== entry.id), entry] }));
  }
  async function saveGoals(goals: Goals) {
    const next = await repository.saveGoals(goals);
    revision.current++;
    setSnapshot(current => current && ({ ...current, goals: next }));
  }
  async function saveName(name: string) {
    const next = await repository.saveName(name);
    revision.current++;
    setSnapshot(current => current && ({ ...current, name: next }));
  }

  const exit = () => runNavigation(() => {
    const confirmExit = async () => {
      setBusy(true);
      try { await onExit(); }
      catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível sair.'); }
      finally { if (alive.current) setBusy(false); }
    };
    if (demo) Alert.alert('Sair da exploração?', 'Os registros desta sessão serão descartados.', [
      { text: 'Cancelar', style: 'cancel' }, { text: 'Sair', onPress: () => { void confirmExit(); } },
    ]);
    else void confirmExit();
  });

  if (!snapshot) return <EntryFrame>
    {loadError ? <Feedback message={loadError} kind="error" /> : <><ActivityIndicator accessibilityLabel="Carregando registros" /><Text style={textStyles.body}>Carregando seus registros…</Text></>}
    {loadError ? <Button label="Tentar novamente" onPress={() => { void refresh(); }} disabled={refreshing} /> : null}
    <Button label="Voltar ao acesso" onPress={exit} disabled={refreshing || busy} secondary />
  </EntryFrame>;

  const meals = mealsForDate(snapshot.meals, day);
  const habits = totalHabitsForDate(snapshot.habitEntries, day);
  const formState = { onDirtyChange: setDirty, onBusyChange: setBusy };
  function content() {
    if (!snapshot) return null;
    switch (screen) {
      case 'Alimentação': return <MealsScreen meals={meals} addMeal={addMeal} {...formState} />;
      case 'Hábitos': return <HabitsScreen habits={habits} goals={snapshot.goals} saveHabit={saveHabit} {...formState} />;
      case 'Evolução': return <ProgressScreen meals={snapshot.meals} entries={snapshot.habitEntries} today={day} />;
      case 'Metas': return <GoalsScreen goals={snapshot.goals} setGoals={saveGoals} {...formState} />;
      case 'Perfil': return <ProfileScreen name={snapshot.name} setName={saveName} {...formState} extraFooter={<Card>
        <Text style={textStyles.muted}>{demo ? 'Sem conta: seus dados existem somente nesta sessão.' : 'Registros vinculados à sua conta. Atualize para buscar alterações de outro dispositivo.'}</Text>
        <Button label={refreshing ? 'Atualizando…' : 'Atualizar registros'} secondary disabled={busy || refreshing} onPress={() => runNavigation(() => { void refresh(); })} />
        <Button label={demo ? 'Sair da exploração' : 'Sair da conta'} secondary disabled={busy || refreshing} onPress={exit} />
      </Card>} />;
      default: return <HomeScreen name={snapshot.name} habits={habits} goals={snapshot.goals} meals={meals} goTo={goTo} />;
    }
  }

  const header = <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="VivaBem, ir para início"
      onPress={() => goTo('Início')} style={({ pressed }) => [styles.brandButton, pressed && styles.pressed]}>
      <Text style={styles.brand}>✳ VivaBem</Text>
    </Pressable>
    {previous ? <Button label={`Voltar para ${previous}`} onPress={goBack} secondary compact /> : null}
  </View>;
  const navigation = <View accessibilityRole="tablist" style={styles.tabs}>
    {tabs.map(tab => <Pressable key={tab.name} accessibilityRole="tab" accessibilityLabel={tab.name}
      accessibilityState={{ selected: screen === tab.name }} onPress={() => goTo(tab.name)}
      style={({ pressed }) => [styles.tab, wrapTabs && styles.wrappedTab, screen === tab.name && styles.selectedTab, pressed && styles.pressed]}>
      <Text accessible={false} importantForAccessibility="no" style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={[styles.tabText, screen === tab.name && styles.active]}>{tab.name}</Text>
    </Pressable>)}
  </View>;

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']} onAccessibilityEscape={goBack}>
    <StatusBar style="dark" />
    {!compactViewport ? header : null}
    <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView key={screen} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.page}>
          {compactViewport ? <>{header}{navigation}</> : null}
          {demo ? <Text style={styles.modeNotice}>Exploração sem conta · os dados não serão salvos ao sair.</Text> : null}
          {refreshing ? <Text accessibilityLiveRegion="polite" style={textStyles.muted}>Atualizando registros…</Text> : null}
          {loadError ? <Feedback message={loadError} kind="error" /> : null}
          {content()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    {!compactViewport ? navigation : null}
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><SessionGate /></SafeAreaProvider>; }
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  brandButton: { minHeight: 48, minWidth: 48, justifyContent: 'center', paddingHorizontal: 4, borderRadius: 8 },
  brand: { color: colors.forest, fontSize: 22, fontWeight: '900' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 32 },
  page: { width: '100%', maxWidth: 600, gap: 16 },
  modeNotice: { color: colors.forest, backgroundColor: colors.mint, fontSize: 16, padding: 12, borderRadius: 8 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, padding: 4, gap: 4 },
  tab: { flexGrow: 1, flexBasis: 0, minHeight: 56, minWidth: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 2, gap: 4, borderTopWidth: 3, borderColor: 'transparent', borderRadius: 6 },
  wrappedTab: { flexBasis: '45%' },
  selectedTab: { borderTopColor: colors.forest, backgroundColor: colors.mint },
  pressed: { backgroundColor: colors.pressed },
  tabIcon: { color: colors.forest, fontSize: 22 },
  tabText: { color: colors.muted, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  active: { color: colors.forest, fontWeight: '900', textDecorationLine: 'underline' },
});
