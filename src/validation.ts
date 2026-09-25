type MetricKind = 'water' | 'sleep' | 'activity';

// Limites de entrada do aplicativo; não representam recomendações de saúde.
export const TECHNICAL_LIMITS = { water: 10000, sleep: 24, activity: 1440 } as const;
export const MEAL_PERIODS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'] as const;

export function parseDecimalInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function validateGoalValue(kind: MetricKind, value: number | null): string | undefined {
  if (value !== null && Number.isFinite(value) && value > 0 && value <= TECHNICAL_LIMITS[kind]) return;
  const unit = kind === 'water' ? 'ml de água' : kind === 'sleep' ? 'horas de sono' : 'minutos de atividade';
  return `Informe mais de 0 e até ${TECHNICAL_LIMITS[kind].toLocaleString('pt-BR')} ${unit}. Este é um limite técnico.`;
}

export function validateHabitValue(kind: MetricKind, value: number | null): string | undefined {
  if (value !== null && Number.isFinite(value) && value >= 0 && value <= TECHNICAL_LIMITS[kind]) return;
  const unit = kind === 'water' ? 'ml de água' : kind === 'sleep' ? 'horas de sono' : 'minutos de atividade';
  return `Informe entre 0 e ${TECHNICAL_LIMITS[kind].toLocaleString('pt-BR')} ${unit}. Este é um limite técnico.`;
}

export function validateWaterAddition(current: number, amount: number): string | undefined {
  if (validateHabitValue('water', current) || !Number.isFinite(amount) || amount <= 0) {
    return 'Não foi possível adicionar água: a quantidade precisa ser positiva e o total precisa ser válido.';
  }
  if (current + amount > TECHNICAL_LIMITS.water) {
    return 'Não é possível ultrapassar o limite técnico de 10.000 ml de água no mesmo dia.';
  }
}

export function validateMealName(value: string): string | undefined {
  if (!value.trim()) return 'Digite o que você comeu para salvar a refeição.';
  if (value.trim().length > 160) return 'Descreva a refeição em até 160 caracteres.';
}

export function validateMealPeriod(value: string): string | undefined {
  if (!MEAL_PERIODS.some(period => period === value)) return 'Selecione um período válido para a refeição.';
}

export function validateProfileName(value: string): string | undefined {
  if (!value.trim()) return 'Informe o nome ou apelido que deseja usar.';
  if (value.trim().length > 60) return 'Use um nome ou apelido com até 60 caracteres.';
}
