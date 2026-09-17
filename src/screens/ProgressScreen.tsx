import { StyleSheet, Text, View } from 'react-native';
import { Card, SectionTitle, textStyles } from '../components/UI';
import { weeklyData } from '../data';
import { colors } from '../theme';

export function ProgressScreen() {
  return <View style={styles.content}><View><Text style={textStyles.title}>Evolução</Text><Text style={textStyles.muted}>Um olhar para sua semana.</Text></View>
    <Card><SectionTitle title="Visão semanal" subtitle="Dados de demonstração" /><View style={styles.chart}>{weeklyData.map(({ day, score }) => <View key={day} style={styles.barColumn}><Text style={styles.score}>{score}%</Text><View style={styles.barTrack}><View style={[styles.bar, { height: `${score}%` }]} /></View><Text style={styles.day}>{day}</Text></View>)}</View></Card>
    <Card style={styles.highlight}><Text style={styles.highlightTitle}>Continue no seu ritmo</Text><Text style={textStyles.muted}>Acompanhar seus hábitos ajuda a perceber padrões ao longo do tempo.</Text></Card>
    <Text style={styles.note}>O gráfico é ilustrativo nesta etapa e não usa os registros inseridos hoje.</Text>
  </View>;
}
const styles = StyleSheet.create({ content: { gap: 18 }, chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4, height: 190, paddingTop: 10 }, barColumn: { flex: 1, alignItems: 'center', gap: 7 }, score: { color: colors.muted, fontSize: 10 }, barTrack: { width: '75%', maxWidth: 34, height: 125, backgroundColor: colors.mint, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' }, bar: { width: '100%', backgroundColor: colors.green, borderRadius: 12 }, day: { color: colors.muted, fontSize: 11, fontWeight: '600' }, highlight: { backgroundColor: '#FFF5E8' }, highlightTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' }, note: { ...textStyles.muted, fontSize: 12 } });
