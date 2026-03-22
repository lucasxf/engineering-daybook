# Melhorias Mobile

## Contexto

O app mobile na versão Android foi lançado para testes internos e testes fechados. Estou testando e coletando feedbacks. Abaixo vou listar problemas numerados por códigos, bem como, **sugestões** de soluções igualmente numeradas para endereçá-los.
Os problemas aqui listados não referem-se à versão web.

## Diretrizes

- Leia o prompt inteiro antes de agir
- Pense bastante e pense passo a passo
- Pense sistematicamente ANTES de propor melhorias ou ajustes
- Os problemas listados aqui são percepções dos usuários. Eles podem ser sintomas e suas devidas causas raízes devem ser investigadas detalhadamente.
- NÃO concorde de imediato com todas sugestões propostas. Seja crítico e busque alternativas
- Avalie trade-offs como: esforço, custos, UI, UX, acessibilidade, etc.

## Tela de Salvar Aprendizado (TSA)

### Problemas (P##)

#### [TSA-P01]

Os botões de visibilidade (Privado/Apenas colegas/Apenas seguidores/Público) estão enormes e atrapalhando na hora de digitar o título e principalmente o conteúdo da POK. Fica dificil inserir o aprendizado com a caixa de texto ficando pequena e sendo parcialmente tomada pelo teclado digital.

**Possíveis soluções sugeridas:**

1. Soluções para o curto prazo
   1. [TSA-P01-S01] Inverter a ordem dos componentes na tela: título e caixa de texto "O que você aprendeu?" no topo da tela, botões de visibilidade na parte debaixo
   2. [TSA-P01-S02] Reduzir o tamanho dos botões
   3. [TSA-P01-S03] Ambos: inverter a ordem e reduzir os botões
   4. [TSA-P01-S04] "colapsar/encolher" os botões quando o usuário selecionar a caixa de texto para inserir o conteúdo do aprendizado
2. Soluções de médio-longo prazo
   1. [TSA-P01-S05] Substituir os botões por componentes mais elegantes, como radio buttons, por exemplo
   2. [TSA-P01-S06] Colocar todos os botões na mesma linha: neste caso a "descrição/texto ajuda" do que significa cada nível de visibilidade precisaria ser repensada (talvez disponível num ícone de ajuda, como um botãozinho como símbolo "?" abaixo de cada tipo de visibilidade)

#### [TSA-P02]

Depois de salvar um aprendizado, o usuário é redirecionado à tela "Meus Aprendizados" (TMA), conforme funcionamento esperado. O problema é que quando retornamos à TSA , ela continua preenchida com o POK recém adicionado. Isso me causou confusão e fez com que eu salvasse o mesmo POK 2 vezes.A princípio, inclusive, pensei que fosse um bug de duplicidade, quando na verdade, era um problema de usabilidade. A tela deveria ser limpa.

#### [TSA-P03] & [TMA-01]

Depois de salvar um aprendizado, o usuário é redirecionado à tela "Meus Aprendizados" (TMA), conforme funcionamento esperado. O problema aqui é que esta tela não é automaticamente atualizada. O usuário precisa "forçar" um refresh ao "puxar" a tela para baixo. É uma questão de usabilidade, não um bug, mas causa fricção. Dá a impressão de que o POK não foi salvo, ou que o sistema está lento e desatualizado.

**Possíveis soluções sugeridas:**

1. Atualização e implementação das especificações atuais (`/review-spec`, `/implement-spec`)
2. Criação de nova spec (`/write-spec`, `/review-spec`, `/implement-spec`)
