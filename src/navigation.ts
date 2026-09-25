export const screens = ['Início', 'Alimentação', 'Hábitos', 'Evolução', 'Metas', 'Perfil'] as const;
export type Screen = typeof screens[number];
export type NavigationAction = { type: 'open'; screen: Screen } | { type: 'back' };
export const initialHistory: Screen[] = ['Início'];

export function navigationReducer(history: Screen[], action: NavigationAction): Screen[] {
  if (action.type === 'back') return history.length > 1 ? history.slice(0, -1) : history;
  const existing = history.indexOf(action.screen);
  // Reutiliza o destino já visitado para evitar ciclos no botão Voltar.
  if (existing >= 0) return history.slice(0, existing + 1);
  return [...history, action.screen];
}
