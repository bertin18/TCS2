# VivaBem — Saúde e Nutrição

Aplicativo mobile para pessoas adultas acompanharem alimentação, hidratação, sono e atividade física em um só lugar. O objetivo é organizar registros cotidianos e metas pessoais; o aplicativo não faz diagnóstico ou prescrição.

**Etapa 03 — versão 0.3.0:** navegação com retorno, feedback dos formulários, recursos de acessibilidade e registros datados. A integração de persistência com Supabase está implementada; o projeto inicial já tem as tabelas e políticas de acesso aplicadas. A validação ponta a ponta no celular ainda está pendente.

## Implementado

- Telas Início, Alimentação, Hábitos, Evolução, Metas e Perfil, além de acesso/cadastro.
- Abas e histórico de retorno, botão Voltar do Android e proteção contra descarte acidental de rascunhos.
- Estados de carregamento, sucesso, erro, seleção, foco e controles indisponíveis durante operações.
- Rótulos e estados acessíveis, foco nos títulos, anúncios de feedback, fontes escaláveis e alvos de toque ampliados.
- Usuário novo sem refeições ou hábitos fictícios. Registros têm data e hora; resumo diário e evolução de sete dias usam esses dados.
- Validação de nomes, refeições, hábitos e metas, com limites técnicos explícitos.
- Adaptador Supabase, SQL de criação das tabelas, RLS por usuário e versões imutáveis de metas.
- Sessão protegida com Expo SecureStore no Android/iOS.
- Modo **Explorar sem salvar**, separado da conta e identificado como temporário em todas as telas.

As metas iniciais são sugestões pessoais editáveis. Não atribuímos valores universais de água ou sono à OMS.

## Tecnologias

React Native, Expo SDK 57 e TypeScript. Supabase Auth e PostgreSQL para persistência quando configurados; hospedagem planejada no Supabase Cloud Free. Testes com Node.js e PGlite para validar SQL e acesso entre contas.

## Executar

Pré-requisitos: Node.js 24, npm e Expo Go compatível ou um emulador Android. O simulador iOS requer macOS; iPhone físico pode usar Expo Go.

```sh
npm ci
npm start
```

Abra o QR code no celular. Se houver restrição de rede local, use `npm run start:tunnel`. Para emulador Android: `npm run android`. Sem backend configurado, escolha **Explorar sem salvar**.

Para persistir, execute a [migration](supabase/migrations/202609180001_vivabem_records.sql) em um projeto Supabase de desenvolvimento, copie `.env.example` para `.env`, preencha a URL e a chave pública `sb_publishable_`, configure confirmação de e-mail e reinicie o Expo. O [guia da Etapa 03](docs/etapa-03.md) detalha a configuração. Nunca inclua senha do banco ou chave secreta/service_role no aplicativo.

## Verificações

```sh
npm run check
npx expo export --platform android --output-dir dist/android
npx expo export --platform ios --output-dir dist/ios
```

`check` executa TypeScript e testes de navegação, validações, datas, contraste, armazenamento de sessão e RLS/SQL. Exportações validam os bundles; não geram APK/IPA.

## Limitações conhecidas

- Na configuração local, URL e chave pública do Supabase estão preenchidas em `.env` (ignorado pelo Git). A migration foi aplicada no projeto inicial, com RLS ativo e acesso anônimo bloqueado nas quatro tabelas. Falta testar a persistência com uma conta no celular. Outras instalações devem configurar seu próprio `.env`; não execute novamente a migration inicial em um banco onde ela já foi aplicada.
- Testes interativos em celular, com TalkBack/VoiceOver e fontes ampliadas, permanecem no roteiro manual.
- O modo sem conta perde dados ao sair/reiniciar e não migra automaticamente para uma conta.
- Não há persistência offline, sincronização em segundo plano, edição/exclusão de refeições ou consulta além dos sete dias na interface. Registros antigos permanecem no banco.
- Recuperação de senha, exclusão/exportação de conta e controles operacionais de produção ainda precisam ser implementados e validados.
- Sem cálculo automático de calorias, dietas, integração com dispositivos ou recomendações clínicas.

## Estrutura

```text
TCS2/
├── README.md
├── .env.example
├── app.json
├── index.ts
├── package.json
├── src/
│   ├── App.tsx
│   ├── data.ts
│   ├── navigation.ts
│   ├── validation.ts
│   ├── theme.ts
│   ├── components/
│   ├── screens/
│   └── services/
├── supabase/migrations/
├── tests/
└── docs/
    ├── proposta.md
    ├── etapa-02.md
    └── etapa-03.md
```

## Entregas

- [Proposta da aplicação](docs/proposta.md) — tag `etapa-01`.
- [Protótipo da Etapa 02](docs/etapa-02.md) — tag `etapa-02`; documentação histórica.
- [Navegação, UX e acessibilidade da Etapa 03](docs/etapa-03.md) — tag `etapa-03`.

Repositório: [bertin18/TCS2](https://github.com/bertin18/TCS2). As tags anteriores são preservadas.
