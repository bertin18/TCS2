# VivaBem — Saúde e Nutrição

Aplicativo mobile para acompanhar alimentação, hidratação, sono e atividade física, com metas pessoais e histórico de evolução.

**Status:** Etapa 02 — protótipo visual e navegável em React Native/Expo. Os dados são simulados e mantidos apenas em memória. Ainda não há backend, autenticação ou banco de dados.

## Problema que resolve

Registros dispersos dificultam acompanhar hábitos e perceber o progresso. O VivaBem pretende reunir essas informações em uma rotina simples de registro e consulta.

## Público e objetivo

Voltado a pessoas adultas que desejam organizar seus hábitos. O objetivo é apoiar registros cotidianos, metas editáveis e acompanhamento diário e semanal. O aplicativo não realiza diagnósticos, prescrições ou avaliação clínica.

## Tecnologias

| Componente | Escolha para implementação |
| --- | --- |
| Mobile | React Native, Expo e TypeScript |
| Estado do protótipo | React `useState`, sem persistência |
| Backend futuro | Supabase Auth e PostgreSQL, ainda não configurados |
| Distribuição prevista | Expo/EAS e APK de teste Android; lojas em etapa posterior |

O Supabase é o backend planejado para uma versão futura. Este protótipo não se conecta a serviços externos.

## Funcionalidades planejadas

- Cadastro, login, confirmação de e-mail e recuperação de acesso;
- Registro, edição e exclusão de refeições, água, sono e exercícios;
- Metas diárias ou semanais, editáveis, pausáveis e com histórico de vigência;
- Sugestões baseadas em fontes oficiais aplicáveis, identificando instituição e versão;
- Resumo diário, histórico semanal e consulta por período;
- Perfil, preferências, exportação de dados e exclusão de conta.

As metas pessoais serão diferenciadas de referências oficiais. Não será atribuído à OMS um padrão de água ou sono sem fonte validada.

## Funcionalidades implementadas

- Navegação por abas entre **Início**, **Alimentação**, **Hábitos** e **Evolução**; acesso a **Metas** e **Perfil** pela tela inicial;
- Registro de refeições, água, sono e atividade física com atualização do resumo durante a sessão;
- Edição de metas pessoais e nome do perfil em memória;
- Gráfico semanal ilustrativo com dados simulados;
- Layout rolável, largura limitada para telas maiores e componentes reutilizáveis.

## Instruções para execução

Pré-requisito: Node.js compatível com Expo SDK 57 e o aplicativo Expo Go no celular (ou um emulador Android/iOS configurado).

```bash
npm install
npx expo login
npm start
```

Entre no Expo Go com a mesma conta usada no `npx expo login`. Depois, leia o QR code mostrado no terminal. Se aparecer a mensagem para executar `npx expo login` no computador, confirme a conta do CLI com `npx expo whoami`, entre na mesma conta no Expo Go e reinicie `npm start`. Para abrir diretamente no emulador Android, use `npm run android`. Para verificar a tipagem, use `npm run typecheck`. Não há variáveis de ambiente nesta etapa.

Se o projeto estiver rodando no WSL ou o celular não conseguir acessar o endereço mostrado pelo Expo, use `npm run start:tunnel` e leia o novo QR code. Aguarde a mensagem `Tunnel ready.` antes de escanear. O túnel precisa de internet. Com a conexão local, computador e celular precisam estar na mesma rede; VPN ou isolamento de dispositivos no Wi-Fi podem impedir o acesso. No iPhone, leia o QR code pela câmera; no Android, use o Expo Go.

## Limitações conhecidas

- Autenticação, persistência, comunicação com servidor e testes automatizados ainda não implementados;
- Registros e alterações voltam aos valores iniciais ao reiniciar o aplicativo;
- O gráfico semanal é ilustrativo e não reflete os registros adicionados pelo usuário;
- Sem sincronização offline na primeira versão funcional;
- Sem cálculo automático de calorias, dietas ou integração com dispositivos;
- Fontes complementares para água e sono e critérios de público ainda precisam de revisão;
- A infraestrutura Supabase ainda não foi provisionada;
- Uma arquitetura voltada a produção ainda exige implementação e validação dos controles antes de receber usuários reais.

## Documentação

- [Proposta com os 13 itens da disciplina](docs/proposta.md)
- [Documentação da Etapa 02](docs/etapa-02.md)

## Estrutura atual

```text
TCS2/
├── app.json
├── index.ts
├── package.json
├── README.md
├── src/
│   ├── App.tsx
│   ├── components/
│   └── screens/
└── docs/
    ├── proposta.md
    └── etapa-02.md
```

## Histórico de decisões

- A entrega inicial foi identificada pela tag `etapa-01`.
- Em 09/09/2026, o planejamento passou a adotar Supabase Cloud Free, metas versionadas e requisitos de segurança desde o início.
- A tag da entrega inicial permanece como registro histórico; esta revisão da documentação não a reposiciona.
