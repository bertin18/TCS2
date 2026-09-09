# VivaBem — Saúde e Nutrição

Aplicativo mobile para acompanhar alimentação, hidratação, sono e atividade física, com metas pessoais e histórico de evolução.

**Status:** planejamento e documentação. O repositório ainda não contém um aplicativo executável, migrações SQL ou um backend provisionado. As funcionalidades e os controles descritos são requisitos para implementação.

## Problema que resolve

Registros dispersos dificultam acompanhar hábitos e perceber o progresso. O VivaBem pretende reunir essas informações em uma rotina simples de registro e consulta.

## Público e objetivo

Voltado a pessoas adultas que desejam organizar seus hábitos. O objetivo é apoiar registros cotidianos, metas editáveis e acompanhamento diário e semanal. O aplicativo não realiza diagnósticos, prescrições ou avaliação clínica.

## Tecnologias e hospedagem definidas

| Componente | Escolha para implementação |
| --- | --- |
| Mobile | React Native, Expo e TypeScript |
| Backend | Supabase Auth, PostgreSQL e API de dados |
| Hospedagem inicial | **Supabase Cloud Free**, para desenvolvimento e testes acadêmicos |
| Operações privilegiadas | Supabase Edge Functions com autenticação e autorização |
| Persistência principal | PostgreSQL no Supabase; conexão necessária para salvar |
| Credenciais no celular | Armazenamento seguro do sistema, com integração a validar |
| Preferências não sensíveis | AsyncStorage, se necessário |
| Distribuição prevista | Expo/EAS e APK de teste Android; lojas em etapa posterior |

O Supabase é o backend escolhido para a primeira versão funcional. Não está prevista uma API própria em Node.js/Express. A criação de contas, tabelas, funções e políticas ainda será realizada.

## Funcionalidades planejadas

- Cadastro, login, confirmação de e-mail e recuperação de acesso;
- Registro, edição e exclusão de refeições, água, sono e exercícios;
- Metas diárias ou semanais, editáveis, pausáveis e com histórico de vigência;
- Sugestões baseadas em fontes oficiais aplicáveis, identificando instituição e versão;
- Resumo diário, histórico semanal e consulta por período;
- Perfil, preferências, exportação de dados e exclusão de conta.

As metas pessoais serão diferenciadas das referências oficiais. Não será atribuído à OMS um padrão de água ou sono sem fonte validada. Consulte as [regras de negócio](docs/regras-de-negocio.md).

## Funcionalidades implementadas

Nenhuma funcionalidade de software foi implementada nesta fase. Foram documentados o escopo, a navegação, o modelo conceitual de dados e os requisitos de segurança e operação.

## Instruções para execução

Nesta etapa, abra os arquivos Markdown no GitHub ou em um editor. **Ainda não há `package.json` nem projeto Expo**, portanto `npm install` e `npx expo start` não são instruções executáveis para este estado do repositório.

Após o scaffold do aplicativo, serão adicionados os pré-requisitos, as versões das ferramentas, os comandos testados e a configuração de ambiente. Credenciais reais não devem ser publicadas no repositório.

## Limitações conhecidas

- Interface, autenticação, persistência e testes ainda não implementados;
- Sem sincronização offline na primeira versão funcional;
- Sem cálculo automático de calorias, dietas ou integração com dispositivos;
- Fontes complementares para água e sono e critérios de público ainda precisam de revisão;
- O plano Free tem cotas, pausa por inatividade e não inclui backups automáticos do banco; o plano operacional está em [hospedagem e segurança](docs/hospedagem-e-seguranca.md);
- Uma arquitetura voltada a produção ainda exige implementação e validação dos controles antes de receber usuários reais.

## Documentação

- [Proposta com os 13 itens da disciplina](docs/proposta.md)
- [Regras de negócio e metas](docs/regras-de-negocio.md)
- [Modelo de dados e relacionamentos](docs/modelo-de-dados.md)
- [Hospedagem, segurança e evolução dos ambientes](docs/hospedagem-e-seguranca.md)

## Estrutura atual

```text
TCS2/
├── README.md
└── docs/
    ├── proposta.md
    ├── regras-de-negocio.md
    ├── modelo-de-dados.md
    └── hospedagem-e-seguranca.md
```

## Histórico de decisões

- A entrega inicial foi identificada pela tag `etapa-01`.
- Em 09/09/2026, o planejamento passou a adotar Supabase Cloud Free, metas versionadas e requisitos de segurança desde o início.
- A tag da entrega inicial permanece como registro histórico; esta revisão da documentação não a reposiciona.
