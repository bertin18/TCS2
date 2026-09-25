# Proposta — VivaBem

## 1. Nome da aplicação

**VivaBem — Saúde e Nutrição**

## 2. Problema que a aplicação pretende resolver

Muitas pessoas têm dificuldade em manter uma rotina saudável porque registram alimentação, hidratação, sono e atividade física em locais diferentes — ou não acompanham esses hábitos. Isso reduz a percepção de progresso e a constância no dia a dia.

## 3. Público-alvo

Pessoas adultas que desejam acompanhar hábitos cotidianos de bem-estar, especialmente quem busca organizar alimentação, ingestão de água, sono e atividade física.

## 4. Objetivo principal

Apoiar o acompanhamento diário de hábitos de saúde e alimentação por meio de registros simples, metas personalizadas e visualização de progresso.

> O VivaBem organiza hábitos e não realiza diagnósticos, prescrições ou orientações médicas.

## 5. Principais funcionalidades

- Registrar refeições por período do dia: café da manhã, almoço, jantar e lanches;
- Registrar a quantidade de água consumida;
- Registrar horas de sono e minutos de atividade física;
- Definir metas diárias pessoais;
- Acompanhar o progresso diário e semanal;
- Consultar o histórico de registros.

## 6. Telas previstas

1. **Início:** resumo do dia e progresso das metas;
2. **Alimentação:** registro e consulta das refeições do dia;
3. **Hábitos:** registro de água, sono e atividade física;
4. **Metas:** criação e edição de objetivos diários;
5. **Evolução:** histórico semanal e gráficos simples;
6. **Perfil:** identificação do usuário e preferências.

## 7. Fluxo básico de navegação

```
Início
 ├── Alimentação → registrar refeição
 ├── Hábitos → registrar água, sono e atividade
 ├── Metas → criar ou editar objetivo diário
 ├── Evolução → consultar histórico semanal
 └── Perfil → editar preferências
```

A navegação principal será feita por uma barra inferior, permitindo acesso direto às telas Início, Alimentação, Hábitos e Evolução. Metas e Perfil estarão disponíveis a partir da tela inicial.

## 8. Tecnologia mobile

**React Native com Expo e TypeScript.** React Native permite criar o aplicativo para Android e iOS com uma única base de código. O Expo simplifica o início do desenvolvimento e os testes em celulares; o TypeScript adiciona tipagem e ajuda a reduzir erros.

## 9. Tecnologia de backend

Na Etapa 02, não há backend. Para a evolução funcional, foi escolhido **Supabase Cloud Free**, com Supabase Auth e PostgreSQL, políticas RLS por usuário e Edge Functions para operações privilegiadas quando necessário.

## 10. APIs externas

Não serão utilizadas APIs externas na versão inicial. Notificações locais poderão ser incorporadas futuramente para lembrar o usuário de registrar água, refeições ou hábitos.

## 11. Armazenamento de dados

Na Etapa 02, os dados são simulados em memória. A persistência principal futura será PostgreSQL no Supabase. AsyncStorage poderá armazenar preferências não sensíveis; credenciais exigirão armazenamento seguro. Metas terão histórico de vigência em uma etapa futura.

## 12. Repositório Git

Repositório: [bertin18/TCS2](https://github.com/bertin18/TCS2)

Tag de entrega desta etapa: `etapa-01`.

## 13. Estrutura inicial de diretórios

```
TCS2/
├── README.md
└── docs/
    └── proposta.md
```

A estrutura será ampliada nas próximas etapas, incluindo as pastas `src/`, `components/`, `screens/` e `services/` quando o desenvolvimento do aplicativo for iniciado.

## Evolução na Etapa 03

A implementação agora inclui navegação de retorno, acessibilidade, formulários com feedback e registros datados sem dados fictícios iniciais. O adaptador de persistência Supabase e a migration com RLS estão no repositório; seu uso real depende da configuração do projeto, descrita em [etapa-03.md](etapa-03.md). Sem conta, a exploração é explicitamente temporária. Os hábitos compartilham a tabela `habit_entries`, diferenciados por tipo, e as metas usam versões imutáveis em `user_goal_versions`. A estrutura executável atual está no README; as tags anteriores preservam as entregas históricas.
