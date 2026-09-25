import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Feedback, Field, ScreenTitle, SectionTitle, textStyles } from '../components/UI';
import type { Meal } from '../data';
import { colors } from '../theme';
import { MEAL_PERIODS, validateMealName } from '../validation';

type Props = {
  meals: Meal[];
  addMeal: (input: { name: string; period: string }) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

export function MealsScreen({ meals, addMeal, onDirtyChange, onBusyChange }: Props) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<string>(MEAL_PERIODS[0]);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const saveLock = useRef(false);
  const dirty = Boolean(name.trim());

  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange?.(false); onBusyChange?.(false); }, [onDirtyChange, onBusyChange]);

  async function save() {
    if (saveLock.current) return;
    const mealName = name.trim();
    const nextError = validateMealName(mealName);
    setError(nextError ?? '');
    setSaveError('');
    setFeedback('');
    if (nextError) return;

    saveLock.current = true;
    setBusy(true);
    try {
      await addMeal({ name: mealName, period });
      setName('');
      setFeedback(`Refeição salva em ${period.toLocaleLowerCase('pt-BR')}. Confira o registro abaixo.`);
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Não foi possível salvar a refeição. Tente novamente.');
    } finally {
      saveLock.current = false;
      setBusy(false);
    }
  }

  return (
    <View style={styles.content}>
      <ScreenTitle title="Alimentação" subtitle="Registre suas refeições sem complicação." />
      <Card>
        <SectionTitle title="Nova refeição" />
        <Field
          label="O que você comeu?"
          value={name}
          onChangeText={value => { setName(value); setError(''); setSaveError(''); setFeedback(''); }}
          placeholder="Ex.: sanduíche e fruta"
          maxLength={160}
          error={error}
          editable={!busy}
          hint="Descreva a refeição em até 160 caracteres."
        />
        <Text style={styles.label}>Período do dia</Text>
        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Período da refeição">
          {MEAL_PERIODS.map(item => {
            const selected = period === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityLabel={item}
                accessibilityState={{ checked: selected, disabled: busy }}
                disabled={busy}
                onPress={() => { setPeriod(item); setSaveError(''); setFeedback(''); }}
                style={({ pressed }) => [styles.chip, selected && styles.selected, busy && styles.disabled, pressed && styles.chipPressed]}
              >
                <Text style={[styles.chipText, selected && styles.selectedText]}>
                  {selected ? '✓ ' : ''}{item}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button label={busy ? 'Salvando refeição…' : 'Salvar refeição'} onPress={save} disabled={busy} hint="Adiciona a refeição aos seus registros com data e hora." />
        {error ? <Feedback message="Não foi possível salvar. Confira a descrição da refeição." kind="error" /> : null}
        {saveError ? <Feedback message={saveError} kind="error" /> : null}
        {feedback ? <Feedback message={feedback} /> : null}
      </Card>
      <SectionTitle title="Suas refeições" subtitle={`${meals.length} ${meals.length === 1 ? 'registro' : 'registros'}`} />
      {meals.length === 0 ? (
        <Card><Text style={textStyles.muted}>Nenhuma refeição registrada ainda. Preencha o formulário acima para começar.</Text></Card>
      ) : meals.slice().sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).map(meal => (
        <Card key={meal.id}>
          <View style={styles.mealRow}>
            <View style={styles.dot} />
            <View style={styles.mealText}>
              <Text style={textStyles.label}>{meal.name}</Text>
              <Text style={textStyles.muted}>{meal.period} · {new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
              }).format(new Date(meal.occurredAt))}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  label: { ...textStyles.label, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minWidth: 48, minHeight: 48, maxWidth: '100%', justifyContent: 'center', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.background, borderWidth: 2, borderColor: colors.line },
  selected: { backgroundColor: colors.mint, borderColor: colors.green },
  disabled: { opacity: 0.6 },
  chipPressed: { backgroundColor: colors.lime, borderColor: colors.forest },
  chipText: { color: colors.ink, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  selectedText: { color: colors.forest, fontWeight: '800' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  mealText: { flex: 1, gap: 3 },
});
