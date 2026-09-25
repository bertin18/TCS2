# Etapa 03 — Navegação, UX e acessibilidade

O VivaBem evolui as seis telas da Etapa 02 com navegação de retorno, feedback de ações, formulários acessíveis e registros datados. A revisão também remove os dados fictícios e prepara a persistência com Supabase. A implementação está no mesmo [repositório TCS2](https://github.com/bertin18/TCS2), versão 0.3.0, com entrega identificada pela tag `etapa-03`.

## Estrutura de navegação

`src/navigation.ts` contém os destinos tipados e o redutor do histórico. `src/App.tsx` integra a navegação, sessão e estado compartilhado. A pilha começa em Início, guarda os destinos visitados e, ao selecionar um destino anterior, retorna até ele. Repetir a aba atual não cria uma entrada. O histórico tem no máximo seis destinos, sem ciclos.

| Tela | Acesso e retorno |
| --- | --- |
| Acesso | Tela inicial antes de entrar; permite entrar, cadastrar ou explorar sem salvar. |
| Início | Primeira tela após o acesso, aba Início e marca VivaBem. |
| Alimentação | Aba inferior ou botão Registrar refeição do Início. |
| Hábitos | Aba inferior. |
| Evolução | Aba inferior; consulta os últimos sete dias. |
| Metas | Botão Ajustar metas no Início. |
| Perfil | Botão Meu perfil no Início; contém atualização dos registros e saída. |

O botão visível de retorno informa o destino anterior. O botão Voltar do Android e o gesto de escape do VoiceOver usam a mesma operação. Na raiz, o botão Android mantém seu comportamento de sistema. A saída da conta retorna ao acesso e desmonta o estado dos registros. A navegação é própria, baseada em estado React; não implementa deep links ou gesto nativo de deslizar entre rotas.

Campos alterados e ainda não salvos geram confirmação antes de sair da tela. Durante um salvamento, os controles ficam indisponíveis e a mudança de tela é bloqueada. O teclado é dispensado nas mudanças de tela, há rolagem dos formulários e ajuste de teclado no iOS.

## Componentes, feedback e decisões de UX

`src/components/UI.tsx` reúne Card, ScreenTitle, SectionTitle, Button, Field, Progress e Feedback. Os formulários em `src/screens/` usam os mesmos componentes e validadores de `src/validation.ts`.

- Botões mostram estados normal, pressionado, selecionado ou indisponível. O texto muda durante o salvamento.
- Campos recebem borda de foco, rótulo permanente, instrução e erro textual junto à entrada.
- Sucesso só é exibido depois que a operação assíncrona retorna. Em falhas, o rascunho é preservado e uma mensagem orienta nova tentativa.
- Carregamento inicial, falha de leitura, repetição da tentativa e ausência de registros têm apresentação específica.
- A aba selecionada usa fundo, sublinhado e estado acessível; o período da refeição usa marca de seleção e estado de rádio.
- Um bloqueio imediato por referência evita envios duplicados antes de o estado visual atualizar.

Na aplicação da Lei de Fitts, botões, marca, retorno e seletores têm área mínima de 48 × 48 pontos; as abas têm altura mínima de 56 pontos. A barra mantém os destinos principais previsíveis e as ações de salvar ficam próximas dos campos. O tamanho dos alvos e os espaços entre eles reduzem a precisão necessária para o toque.

## Acessibilidade e adaptação

Títulos recebem papel de cabeçalho e foco acessível ao abrir a tela. Campos têm rótulos; botões, abas e seletores expõem papéis e estados. Feedback usa região viva no Android e anúncio no iOS. Barras informam rótulo, valor e percentual; a Evolução expõe também os valores em texto, sem depender do gráfico.

A tipografia acompanha a escala do sistema, sem limitação artificial. O conteúdo tem largura máxima de 600 pontos e rolagem. Abas se reorganizam em duas linhas quando necessário; em uma área útil curta em relação à fonte, cabeçalho e navegação entram na região rolável para manter o conteúdo alcançável. Elementos decorativos são ocultos ao leitor quando possuem equivalente textual.

Os testes calculam contraste mínimo de 4,5:1 para os pares de texto selecionados e 3:1 para bordas dos campos e barras. Isso não constitui uma certificação completa de acessibilidade: foco, leitura, teclado e tamanho de fonte ainda precisam ser conferidos em dispositivos.

## Registros reais e persistência

Uma sessão nova começa sem refeições ou hábitos. As metas iniciais 2.000 ml, 8 horas e 30 minutos são valores pessoais editáveis, não registros feitos pelo usuário nem recomendações atribuídas à OMS.

Cada refeição e hábito possui identificador, instante `occurred_at` e dia local `local_date`. No banco, o instante vem do servidor; o dia local é informado pelo aplicativo para não classificar o dia somente pelo fuso UTC. Água soma incrementos; sono e atividade utilizam a atualização mais recente do total diário. O resumo filtra o dia atual; a Evolução apresenta os sete dias recentes, inclusive dias sem registro, sem gerar uma pontuação de saúde. A mudança de dia é verificada durante o uso e ao voltar ao aplicativo.

Os limites técnicos são água até 10.000 ml por dia, sono até 24 horas e atividade até 1.440 minutos. Metas são positivas; sono e atividade registrados admitem zero. Refeições exigem descrição até 160 caracteres e período válido; nomes exigem entre 1 e 60 caracteres. Esses limites de entrada não são orientações clínicas.

O adaptador `src/services/repository.ts` oferece dois modos explícitos:

- **Conta configurada:** gravações no Supabase; estado visual confirmado apenas após resposta do servidor. Perfil, metas e registros são recuperados ao entrar novamente. A leitura da interface abrange os sete dias recentes, mas registros mais antigos permanecem no banco. Repetições após falha de rede reutilizam o identificador enquanto o adaptador permanece em memória.
- **Explorar sem salvar:** estado somente em memória, sem registros iniciais fictícios e com aviso visível em todas as telas. Sair ou reiniciar apaga essa sessão. Esse modo não simula persistência e seus registros não são migrados automaticamente para uma conta.

Sessões de autenticação ficam no Expo SecureStore em Android/iOS, divididas em fragmentos para acomodar valores extensos. O manifesto só é atualizado depois dos fragmentos. Dados de saúde não são gravados em localStorage ou AsyncStorage. Não há cache persistente offline nem fila de sincronização.

## Banco e segurança

`supabase/migrations/202609180001_vivabem_records.sql` cria:

| Tabela | Conteúdo |
| --- | --- |
| profiles | Nome do proprietário da conta. |
| user_goal_versions | Versões imutáveis das metas. |
| meal_entries | Refeições datadas. |
| habit_entries | Registros datados de água, sono e atividade, diferenciados por kind. |

Os três hábitos usam uma tabela comum porque compartilham autoria, data e estrutura numérica. Isso simplifica a primeira implementação do modelo conceitual. RLS restringe leituras e gravações à conta autenticada. Privilégios por coluna impedem forjar autoria e timestamps. Metas não permitem edição retroativa. A função `save_habit` deriva a autoria da sessão, aplica os limites, serializa gravações por usuário/dia e evita duplicação de uma mesma requisição. O cliente não tem INSERT direto nessa tabela.

## Execução

Use Node.js 24, npm e Expo Go compatível com o SDK 57. Na raiz:

```sh
npm ci
npm start
```

Sem configuração externa, escolha **Explorar sem salvar** para avaliar a navegação. Para usar o backend:

1. Crie ou selecione um projeto de desenvolvimento no Supabase. Revise a migration antes de executá-la em um banco que já tenha tabelas com esses nomes.
2. Execute o SQL da migration no SQL Editor. Não desative RLS para resolver erros de acesso.
3. Copie `.env.example` para `.env` e preencha a URL HTTPS e a chave pública `sb_publishable_` do projeto. Chaves secretas/service_role são rejeitadas pelo cliente e nunca devem ser incluídas no app.
4. Configure autenticação por e-mail/senha e confirmação de e-mail no Supabase. Reinicie o Expo após alterar `.env`.
5. Crie a conta, confirme o e-mail e entre. Registre dados e reinicie o aplicativo para validar a recuperação.

Use `npm run android` com emulador configurado, ou Expo Go em celular. O simulador iOS exige macOS; um iPhone físico pode ser utilizado. Para restrições de rede local há `npm run start:tunnel`.

```sh
npm run check
npx expo export --platform android --output-dir dist/android
npx expo export --platform ios --output-dir dist/ios
```

As exportações geram bundles, não APK/IPA. Os testes Node cobrem navegação, validações, datas, contraste e armazenamento da sessão. Os testes PGlite executam a migration em um PostgreSQL local isolado com identidades simuladas, verificando regras de acesso e limites; não acessam uma conta Supabase real.

## Roteiro de testes manuais

1. Abra a exploração sem salvar; confirme ausência de refeições/hábitos e presença do aviso de modo temporário.
2. Percorra as quatro abas, Metas e Perfil. Use retorno visível e Voltar do Android; selecione novamente a aba atual e confirme que não duplica o histórico.
3. Digite sem salvar e tente sair; confirme as opções de continuar editando ou descartar.
4. Teste perfil vazio, água acima de 10.000, sono acima de 24, atividade acima de 1.440 e valores com vírgula decimal. Valores inválidos não devem alterar os registros.
5. Faça registros válidos, volte ao Início e confira a Evolução. O gráfico deve refletir água registrada e a lista deve mostrar datas e valores reais.
6. Amplie a fonte para 200%, use uma tela pequena e abra o teclado. Confira alcance de campos, ações, abas e retorno.
7. Com TalkBack/VoiceOver, percorra títulos, campos, seletores, progresso e mensagens; confirme nomes compreensíveis e ausência de elementos decorativos duplicados.
8. Com Supabase configurado, salve, reinicie e confira os dados. Desconecte a rede e tente salvar: não deve haver falso sucesso nem perda do texto digitado. Retome a conexão e repita.
9. Entre com duas contas diferentes e confira a separação dos registros. Saia da conta e verifique que os dados anteriores não aparecem na próxima sessão.

## Evidências e limites

TypeScript e 37 testes automatizados passaram na revisão local. A exportação conjunta Android/iOS concluiu com 662 e 664 módulos, respectivamente. Não havia dispositivo/emulador disponível para testes interativos.

Em 18/09/2026, a URL e a chave pública fornecidas foram configuradas no `.env` local, ignorado pelo Git. Uma consulta somente de leitura ao serviço de autenticação retornou HTTP 200, com cadastro por e-mail habilitado e confirmação de e-mail exigida. Após autenticação do proprietário no painel, a migration `202609180001_vivabem_records.sql` foi executada com sucesso pelo SQL Editor no projeto inicial VivaBem. Não é necessário executá-la novamente nesse banco; a aplicação foi manual, não pelo histórico de migrations do CLI.

A inspeção do banco confirmou RLS ativo nas quatro tabelas e oito políticas no total. A função `save_habit` está com `SECURITY DEFINER`, caminho de busca vazio e execução permitida ao papel autenticado, mas não ao anônimo. As quatro consultas REST sem login retornaram HTTP 401 / código PostgreSQL 42501, confirmando o bloqueio de leitura anônima. TypeScript e os 37 testes locais passaram novamente após a configuração.

Nenhuma persistência autenticada foi validada no celular ou com contas reais no projeto hospedado. Ainda é necessário executar o roteiro acima, incluindo salvamento, recuperação após reinício, separação entre contas e concorrência entre conexões reais. As verificações de configuração não substituem esses testes.

Recuperação de senha, exclusão/exportação de conta, SMTP de produção, backups e monitoramento continuam fora desta entrega. A arquitetura aplica controles iniciais, mas não representa homologação de produção ou conformidade legal.

## Referências técnicas

- [Acessibilidade no React Native](https://reactnative.dev/docs/accessibility)
- [BackHandler](https://reactnative.dev/docs/backhandler)
- [Autenticação Supabase com React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
