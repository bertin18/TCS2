import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Feedback, Field, ScreenTitle, textStyles } from '../components/UI';
import { configurationError, supabase } from '../services/supabase';

function authMessage(code: string | undefined, status: number | undefined) {
  if (code === 'invalid_credentials') return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar. Confira também a caixa de spam.';
  if (code === 'weak_password') return 'Escolha uma senha mais forte, seguindo os requisitos da sua conta.';
  if (code === 'signup_disabled') return 'O cadastro está indisponível no momento. Tente novamente mais tarde.';
  if (status === 429 || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
  return 'Não foi possível acessar a conta. Confira sua conexão e tente novamente.';
}

export function AuthScreen({ onDemo }: { onDemo: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmation?: string }>({});
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'success' | 'error'>('error');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  function update(field: 'email' | 'password' | 'confirmation', value: string) {
    if (locked.current) return;
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmation') setConfirmation(value);
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setMessage('');
  }

  async function submit() {
    if (locked.current || !supabase) return;
    const normalizedEmail = email.trim();
    const nextErrors: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Informe um e-mail válido.';
    if (!password) nextErrors.password = 'Informe sua senha.';
    else if (mode === 'signup' && password.length < 8) nextErrors.password = 'Use pelo menos 8 caracteres.';
    if (mode === 'signup' && password !== confirmation) nextErrors.confirmation = 'As senhas precisam ser iguais.';
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length) return;
    locked.current = true;
    setBusy(true);
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        : await supabase.auth.signUp({ email: normalizedEmail, password });
      if (!mounted.current) return;
      if (result.error) {
        setMessageKind('error');
        setMessage(authMessage(result.error.code, result.error.status));
      } else if (mode === 'signup' && !result.data.session) {
        setMessageKind('success');
        setMessage('Confira seu e-mail para confirmar o cadastro. Depois, volte ao aplicativo e entre com sua senha.');
        setPassword('');
        setConfirmation('');
        setMode('login');
      }
    } catch {
      if (mounted.current) {
        setMessageKind('error');
        setMessage('Não foi possível concluir o acesso ou proteger a sessão neste aparelho. Confira sua conexão e tente novamente.');
      }
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <View style={styles.content}>
    <ScreenTitle title="Boas-vindas ao VivaBem" subtitle="Acompanhe sua rotina de alimentação e hábitos." />
    {configurationError ? <Card>
      <Text accessibilityRole="header" style={textStyles.label}>Conexão com a conta indisponível</Text>
      <Text style={textStyles.body}>A conexão precisa ser configurada antes de acessar sua conta. Por enquanto, você pode conhecer as telas sem salvar informações.</Text>
    </Card> : <Card>
      <Text accessibilityRole="header" style={textStyles.label}>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</Text>
      <Text style={textStyles.muted}>Seus registros ficam associados à sua conta e podem ser recuperados ao entrar novamente.</Text>
      <Field label="E-mail" value={email} onChangeText={value => update('email', value)} email
        editable={!busy} maxLength={254} placeholder="voce@exemplo.com" error={errors.email} />
      <Field label="Senha" value={password} onChangeText={value => update('password', value)} secureTextEntry
        editable={!busy} maxLength={128} error={errors.password} hint={mode === 'signup' ? 'Use uma senha exclusiva com pelo menos 8 caracteres.' : undefined} />
      {mode === 'signup' ? <Field label="Confirmar senha" value={confirmation}
        onChangeText={value => update('confirmation', value)} secureTextEntry editable={!busy} maxLength={128} error={errors.confirmation} /> : null}
      {message ? <Feedback message={message} kind={messageKind} /> : null}
      <Button label={busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'} disabled={busy} onPress={() => { void submit(); }} />
      <Button label={mode === 'login' ? 'Quero criar uma conta' : 'Já tenho uma conta'} secondary disabled={busy} onPress={() => {
        if (locked.current) return;
        setMode(previous => previous === 'login' ? 'signup' : 'login');
        setErrors({}); setMessage(''); setPassword(''); setConfirmation('');
      }} />
    </Card>}
    <Card>
      <Text style={textStyles.body}>Na exploração sem conta, os registros ficam apenas na memória e são apagados ao sair ou reiniciar o aplicativo.</Text>
      <Button label="Explorar sem salvar" secondary disabled={busy} onPress={() => { if (!locked.current) onDemo(); }} />
    </Card>
  </View>;
}

const styles = StyleSheet.create({ content: { gap: 18 } });
