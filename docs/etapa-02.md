# Etapa 02 — Interface do VivaBem

Protótipo navegável em React Native, Expo e TypeScript, com dados simulados em memória e sem comunicação com servidor.

## Telas implementadas

| Tela | Recursos |
| --- | --- |
| Início | Resumo das refeições, progresso diário e atalhos para Metas e Perfil. |
| Alimentação | Cadastro de refeição, seleção de período e lista de registros. |
| Hábitos | Adição de água e atualização de sono e atividade. |
| Evolução | Gráfico semanal com dados fixos de demonstração. |
| Metas | Edição das três metas pessoais. |
| Perfil | Edição do nome e exibição da inicial. |

## Navegação e componentes

`src/App.tsx` controla a tela ativa por estado React. A barra inferior acessa Início, Alimentação, Hábitos e Evolução. Início oferece atalhos para Metas e Perfil, que têm botão de retorno. A marca também retorna ao início. Dados salvos na sessão permanecem ao trocar de tela; campos não salvos são descartados.

As telas estão em `src/screens/`. Em `src/components/UI.tsx`, os componentes reutilizáveis são Card (agrupamento), SectionTitle (títulos), Button (ações), Field (rótulo e entrada) e Progress (barra de progresso). `textStyles` e `src/theme.ts` compartilham tipografia e cores. São usados View, Text, TextInput, Pressable, ScrollView, Alert e áreas seguras.

## Elementos de entrada

- Refeição: texto obrigatório e seletor de café da manhã, almoço, lanche ou jantar.
- Água: botão para acrescentar 250 ml.
- Sono: campo numérico entre 0 e 24 horas, substituindo o total atual.
- Atividade: campo numérico não negativo, substituindo os minutos atuais.
- Metas: valores positivos, com sono limitado a 24 horas.
- Perfil: nome não vazio após remoção de espaços nas extremidades.

Os campos numéricos aceitam vírgula decimal. Refeições vazias e números inválidos nos hábitos e metas geram alertas.

## Adaptação do layout

O conteúdo usa largura de 100%, limite de 600 pontos e centralização. ScrollView permite rolagem vertical. Flexbox distribui abas e gráfico; seletores, ações e linhas de progresso admitem quebra de linha. SafeAreaView acomoda áreas reservadas do dispositivo. A orientação é retrato. Botões principais possuem altura mínima de 48 pontos. Ainda é necessária inspeção visual em aparelhos de diferentes tamanhos, com teclado aberto e fontes ampliadas.

## Execução e verificação

Com Node.js e npm compatíveis com Expo SDK 57, execute na raiz:

```sh
npm ci
npm start
```

Abra no Expo Go compatível ou use `npm run android` com emulador configurado. O simulador iOS exige macOS; um iPhone físico pode ser usado com Expo Go. Para redes que bloqueiam acesso local, há `npm run start:tunnel`. Não há variáveis de ambiente.

```sh
npm run typecheck
npx expo export --platform android --output-dir dist
```

A exportação valida o empacotamento JavaScript; não gera APK nem substitui teste em dispositivo.

Validação em 17/09/2026: `npm run typecheck` passou e a exportação Android concluiu com 598 módulos. A navegação foi revisada no código; não foi realizado teste interativo em celular ou emulador nesta revisão.

## Decisões de interface

A paleta verde e os cartões organizam os hábitos por assunto. Quatro áreas principais permanecem acessíveis na barra inferior. Os formulários têm rótulos em português e teclado numérico quando apropriado. Barras com limite visual de 100% comparam os registros às metas pessoais.

Os valores iniciais são demonstrativos, sem atribuição à OMS. Referências oficiais e histórico de vigência das metas serão incorporados na evolução funcional. Supabase Auth e PostgreSQL permanecem como backend futuro.

## Limitações e entrega

Os dados retornam aos exemplos quando o aplicativo reinicia. Não há login, persistência, edição/exclusão de refeições nem histórico real. O gráfico não reflete novos registros. A navegação usa estado, sem histórico nativo de rotas. Não há suíte automatizada de interface.

Repositório: [bertin18/TCS2](https://github.com/bertin18/TCS2). Tag desta entrega: `etapa-02`. A tag `etapa-01` preserva a entrega anterior.
