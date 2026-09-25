import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Feedback, Field, Progress, ScreenTitle, SectionTitle, textStyles } from '../components/UI';
import type { Goals, HabitKind, Habits } from '../data';
import { colors } from '../theme';
import { parseDecimalInput, validateHabitValue, validateWaterAddition } from '../validation';

type HabitInput = 'sleep' | 'activity';
type Props = {
  habits: Habits;
  goals: Goals;
  saveHabit: (kind: HabitKind, value: number) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

export function HabitsScreen({ habits, goals, saveHabit, onDirtyChange, onBusyChange }: Props) {
  const [sleep, setSleep] = useState('');
  const [activity, setActivity] = useState('');
  const [errors, setErrors] = useState<Partial<Record<HabitKind, string>>>({});
  const [saveErrors, setSaveErrors] = useState<Partial<Record<HabitKind, string>>>({});
  const [feedback, setFeedback] = useState<Partial<Record<HabitKind, string>>>({});
  const [busy, setBusy] = useState<HabitKind | null>(null);
  const saveLock = useRef(false);
  const dirty = Boolean(sleep.trim() || activity.trim());

  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy !== null); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange?.(false); onBusyChange?.(false); }, [onDirtyChange, onBusyChange]);

  function clearMessages(kind: HabitKind) {
    setErrors(current => ({ ...current, [kind]: '' }));
    setSaveErrors(current => ({ ...current, [kind]: '' }));
    setFeedback(current => ({ ...current, [kind]: '' }));
  }

  function editNumber(kind: HabitInput, value: string) {
    if (kind === 'sleep') setSleep(value);
    else setActivity(value);
    clearMessages(kind);
  }

  async function persist(kind: HabitKind, value: number, message: string) {
    if (saveLock.current) return;
    saveLock.current = true;
    setBusy(kind);
    try {
      await saveHabit(kind, value);
      if (kind === 'sleep') setSleep('');
      if (kind === 'activity') setActivity('');
      setFeedback(current => ({ ...current, [kind]: message }));
    } catch (failure) {
      setSaveErrors(current => ({
        ...current,
        [kind]: failure instanceof Error ? failure.message : 'Não foi possível salvar o registro. Tente novamente.',
      }));
    } finally {
      saveLock.current = false;
      setBusy(null);
    }
  }

  async function saveNumber(kind: HabitInput, raw: string) {
    if (saveLock.current) return;
    const value = parseDecimalInput(raw);
    const nextError = validateHabitValue(kind, value);
    clearMessages(kind);
    if (nextError || value === null) {
      setErrors(current => ({ ...current, [kind]: nextError ?? 'Informe um valor válido.' }));
      return;
    }
    await persist(kind, value, kind === 'sleep'
      ? `Sono salvo: ${value.toLocaleString('pt-BR')} horas no total de hoje.`
      : `Atividade salva: ${value.toLocaleString('pt-BR')} minutos no total de hoje.`);
  }

  async function addWater() {
    if (saveLock.current) return;
    clearMessages('water');
    const nextError = validateWaterAddition(habits.water, 250);
    if (nextError) {
      setErrors(current => ({ ...current, water: nextError }));
      return;
    }
    await persist('water', 250, '250 ml de água salvos. O total de hoje foi atualizado.');
  }

  return (
    <View style={styles.content}>
      <ScreenTitle title="Hábitos" subtitle="Acompanhe água, descanso e movimento." />
      <Card style={styles.waterCard}>
        <Text style={styles.emoji} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">💧</Text>
        <SectionTitle title="Hidratação" />
        <Text style={styles.number}>
          {habits.water.toLocaleString('pt-BR')} <Text style={styles.unit}>ml de {goals.water.toLocaleString('pt-BR')} ml</Text>
        </Text>
        <Progress label="Progresso da meta de água" value={habits.water} max={goals.water} />
        <Button label={busy === 'water' ? 'Salvando água…' : '+ 250 ml de água'} onPress={addWater} disabled={busy !== null} hint="Soma 250 mililitros ao consumo de hoje." />
        {errors.water ? <Feedback message={errors.water} kind="error" /> : null}
        {saveErrors.water ? <Feedback message={saveErrors.water} kind="error" /> : null}
        {feedback.water ? <Feedback message={feedback.water} /> : null}
      </Card>
      <SectionTitle title="Outros registros" />
      <Card>
        <Text style={styles.emoji} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">🌙</Text>
        <SectionTitle title="Sono" />
        <Text style={textStyles.muted}>Hoje: {habits.sleep.toLocaleString('pt-BR')} h · Meta: {goals.sleep.toLocaleString('pt-BR')} h</Text>
        <Field
          label="Horas dormidas"
          value={sleep}
          onChangeText={value => editNumber('sleep', value)}
          placeholder="Ex.: 7,5"
          numeric
          maxLength={8}
          error={errors.sleep}
          editable={busy === null}
          hint="Informe o total de hoje, de 0 a 24 horas. Aceita vírgula ou ponto."
        />
        <Button label={busy === 'sleep' ? 'Salvando sono…' : 'Atualizar sono'} onPress={() => saveNumber('sleep', sleep)} disabled={busy !== null} secondary hint="Substitui o total de horas dormidas de hoje." />
        {errors.sleep ? <Feedback message="Sono não atualizado. Confira o campo de horas dormidas." kind="error" /> : null}
        {saveErrors.sleep ? <Feedback message={saveErrors.sleep} kind="error" /> : null}
        {feedback.sleep ? <Feedback message={feedback.sleep} /> : null}
      </Card>
      <Card>
        <Text style={styles.emoji} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">☀️</Text>
        <SectionTitle title="Atividade física" />
        <Text style={textStyles.muted}>Hoje: {habits.activity.toLocaleString('pt-BR')} min · Meta: {goals.activity.toLocaleString('pt-BR')} min</Text>
        <Field
          label="Minutos de atividade"
          value={activity}
          onChangeText={value => editNumber('activity', value)}
          placeholder="Ex.: 30"
          numeric
          maxLength={8}
          error={errors.activity}
          editable={busy === null}
          hint="Informe o total de hoje, de 0 a 1440 minutos. Aceita vírgula ou ponto."
        />
        <Button label={busy === 'activity' ? 'Salvando atividade…' : 'Atualizar atividade'} onPress={() => saveNumber('activity', activity)} disabled={busy !== null} secondary hint="Substitui o total de minutos de atividade de hoje." />
        {errors.activity ? <Feedback message="Atividade não atualizada. Confira o campo de minutos." kind="error" /> : null}
        {saveErrors.activity ? <Feedback message={saveErrors.activity} kind="error" /> : null}
        {feedback.activity ? <Feedback message={feedback.activity} /> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  waterCard: { backgroundColor: '#EDF6F5' },
  emoji: { fontSize: 27 },
  number: { color: colors.forest, fontSize: 32, fontWeight: '800' },
  unit: { color: colors.muted, fontSize: 15, fontWeight: '500' },
});
