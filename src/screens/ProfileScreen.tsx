import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Feedback, Field, ScreenTitle, SectionTitle, textStyles } from '../components/UI';
import { colors } from '../theme';
import { validateProfileName } from '../validation';

type Props = {
  name: string;
  setName: (name: string) => Promise<void>;
  extraFooter?: ReactNode;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

export function ProfileScreen({ name, setName, extraFooter, onDirtyChange, onBusyChange }: Props) {
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const saveLock = useRef(false);
  const dirty = draft.trim() !== name;

  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange?.(false); onBusyChange?.(false); }, [onDirtyChange, onBusyChange]);

  async function save() {
    if (saveLock.current) return;
    const nextName = draft.trim();
    const nextError = validateProfileName(nextName);
    setError(nextError ?? '');
    setSaveError('');
    setFeedback('');
    if (nextError) return;

    saveLock.current = true;
    setBusy(true);
    try {
      await setName(nextName);
      setDraft(nextName);
      setFeedback(`Nome salvo: ${nextName}. A saudação do Início foi atualizada.`);
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Não foi possível salvar seu nome. Tente novamente.');
    } finally {
      saveLock.current = false;
      setBusy(false);
    }
  }

  return (
    <View style={styles.content}>
      <ScreenTitle title="Meu perfil" subtitle="Personalize sua experiência no VivaBem." />
      <Card>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.initial}>{name.trim().charAt(0).toUpperCase() || 'V'}</Text>
        </View>
        <Text style={styles.name}>{name || 'Seu perfil'}</Text>
        <Text style={textStyles.muted}>Seu nome aparece na saudação do Início.</Text>
      </Card>
      <Card>
        <SectionTitle title="Como podemos chamar você?" />
        <Field
          label="Nome"
          value={draft}
          onChangeText={value => { setDraft(value); setError(''); setSaveError(''); setFeedback(''); }}
          placeholder="Seu nome"
          maxLength={60}
          error={error}
          editable={!busy}
          hint="Nome ou apelido, com até 60 caracteres."
        />
        <Button label={busy ? 'Salvando nome…' : 'Salvar nome'} onPress={save} disabled={busy} hint="Atualiza o nome no perfil e na saudação do Início." />
        {error ? <Feedback message="Nome não atualizado. Confira o campo Nome." kind="error" /> : null}
        {saveError ? <Feedback message={saveError} kind="error" /> : null}
        {feedback ? <Feedback message={feedback} /> : null}
      </Card>
      {extraFooter}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.forest, fontSize: 26, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 23, fontWeight: '800' },
});
