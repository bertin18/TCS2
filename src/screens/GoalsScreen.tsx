import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Feedback, Field, ScreenTitle, textStyles } from '../components/UI';
import type { Goals } from '../data';
import { parseDecimalInput, validateGoalValue } from '../validation';

type GoalErrors = Partial<Record<keyof Goals, string>>;
type Props = {
  goals: Goals;
  setGoals: (goals: Goals) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

export function GoalsScreen({ goals, setGoals, onDirtyChange, onBusyChange }: Props) {
  const [draft, setDraft] = useState({ water: String(goals.water), sleep: String(goals.sleep), activity: String(goals.activity) });
  const [errors, setErrors] = useState<GoalErrors>({});
  const [saveError, setSaveError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const saveLock = useRef(false);
  const hasErrors = Object.values(errors).some(Boolean);
  const hasChanges = (Object.keys(goals) as (keyof Goals)[]).some(key => parseDecimalInput(draft[key]) !== goals[key]);

  useEffect(() => { onDirtyChange?.(hasChanges); }, [hasChanges, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange?.(false); onBusyChange?.(false); }, [onDirtyChange, onBusyChange]);

  function edit(key: keyof Goals, value: string) {
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: '' }));
    setSaveError('');
    setFeedback('');
  }

  async function save() {
    if (saveLock.current) return;
    const water = parseDecimalInput(draft.water);
    const sleep = parseDecimalInput(draft.sleep);
    const activity = parseDecimalInput(draft.activity);
    const nextErrors: GoalErrors = {
      water: validateGoalValue('water', water),
      sleep: validateGoalValue('sleep', sleep),
      activity: validateGoalValue('activity', activity),
    };
    setErrors(nextErrors);
    setSaveError('');
    setFeedback('');
    if (Object.values(nextErrors).some(Boolean) || water === null || sleep === null || activity === null) return;

    saveLock.current = true;
    setBusy(true);
    try {
      await setGoals({ water, sleep, activity });
      setDraft({ water: String(water), sleep: String(sleep), activity: String(activity) });
      setFeedback('Metas salvas. O Início e a tela Hábitos já exibem os novos objetivos.');
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Não foi possível salvar as metas. Tente novamente.');
    } finally {
      saveLock.current = false;
      setBusy(false);
    }
  }

  return (
    <View style={styles.content}>
      <ScreenTitle title="Suas metas" subtitle="Ajuste seus objetivos de acordo com sua rotina." />
      <Card>
        <Field
          label="Água por dia (ml)"
          value={draft.water}
          onChangeText={value => edit('water', value)}
          numeric
          maxLength={8}
          error={errors.water}
          editable={!busy}
          hint="Mais de 0 e até 10.000 ml. Limite técnico de entrada."
        />
        <Field
          label="Sono por dia (horas)"
          value={draft.sleep}
          onChangeText={value => edit('sleep', value)}
          numeric
          maxLength={8}
          error={errors.sleep}
          editable={!busy}
          hint="Mais de 0 e até 24 horas. Aceita vírgula ou ponto."
        />
        <Field
          label="Atividade por dia (minutos)"
          value={draft.activity}
          onChangeText={value => edit('activity', value)}
          numeric
          maxLength={8}
          error={errors.activity}
          editable={!busy}
          hint="Mais de 0 e até 1440 minutos. Aceita vírgula ou ponto."
        />
        <Button
          label={busy ? 'Salvando metas…' : 'Salvar metas'}
          onPress={save}
          disabled={busy || !hasChanges}
          hint={hasChanges ? 'Atualiza suas metas pessoais.' : 'Edite uma meta para habilitar este botão.'}
        />
        {!hasChanges && !feedback ? <Text style={textStyles.muted}>Edite um valor para salvar novas metas.</Text> : null}
        {hasErrors ? <Feedback message="Metas não atualizadas. Confira os campos indicados acima." kind="error" /> : null}
        {saveError ? <Feedback message={saveError} kind="error" /> : null}
        {feedback ? <Feedback message={feedback} /> : null}
      </Card>
      <Text style={textStyles.muted}>Os limites dos campos são controles técnicos, não recomendações da OMS. Ajuste suas metas pessoais conforme suas necessidades e orientação profissional.</Text>
    </View>
  );
}

const styles = StyleSheet.create({ content: { gap: 18 } });
