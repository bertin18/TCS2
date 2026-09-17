import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, SectionTitle, textStyles } from '../components/UI';
import { colors } from '../theme';

export function ProfileScreen({ name, setName }: { name: string; setName: (name: string) => void }) {
  const [draft, setDraft] = useState(name);
  return <View style={styles.content}><View><Text style={textStyles.title}>Meu perfil</Text><Text style={textStyles.muted}>Personalize sua experiência no protótipo.</Text></View><Card><View style={styles.avatar}><Text style={styles.initial}>{name.trim().charAt(0).toUpperCase() || 'V'}</Text></View><Text style={styles.name}>{name}</Text><Text style={textStyles.muted}>Perfil de demonstração</Text></Card><Card><SectionTitle title="Como podemos chamar você?" /><Field label="Nome" value={draft} onChangeText={setDraft} placeholder="Seu nome" /><Button label="Salvar nome" onPress={() => { if (draft.trim()) setName(draft.trim()); }} /></Card><Text style={textStyles.muted}>As alterações ficam apenas na memória e são perdidas ao reiniciar o aplicativo.</Text></View>;
}
const styles = StyleSheet.create({ content: { gap: 18 }, avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, initial: { color: colors.forest, fontSize: 26, fontWeight: '800' }, name: { color: colors.ink, fontSize: 23, fontWeight: '800' } });
