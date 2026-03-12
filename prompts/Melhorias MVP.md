# Melhorias MVP

Utilizando o **learnimo** eu identifiquei diversas oportunidades de melhoria. Elas estão listadas abaixo.

## Diretrizes

- Utilize o `Plan Mode`
- Pense passo a passo e seja detalhista
- Me ajude com brainstorming para perguntas em aberto
- Organizei as oportunidades entre CRÍTICAS, MODERADAS, LEVES, e EVOLUÇÕES FUTURAS (para o roadmap) para facilitar a priorização dos ajustes
- **CRÍTICO**: Reduzir fricção e ter uma experiência fluída (seamless) com o mínimo de cliques e telas possível é um MANDATE CRÍTICO dessa revisão. Todas as decisões devem ser tomadas com isso em mente. Aliás, não apenas dessa revisão, este mandate é crítico para o projeto de modo geral e deve ser "aprendido" ou "documentado" para SEMPRE levarmos em consideração conforme evoluirmos em features futuras.

## Melhorias identificadas

- **CRÍTICAS**
  - a sessão não está durando muito tempo. Sempre que eu dou F5 (refresh) no site, retorno à home
  - a home possui apenas o botão começar, que ao ser clicado redireciona o usuário para a tela de cadastro/login. Essa tela pode deixar de existir e a home pode ser a tela de cadastro/login.
  - a tela inicial pós-login deveria ser diretamente o feed. Não faz sentido uma tela intermediária com o botão "Ver Meus Aprendizados". Só aumenta o volume de cliques e telas, reduz a navegabilidade, aumenta fricção e piora a experiência do usuário.
  - o título "learnimo" no canto superior esquerdo deveria ser clicável e redirecionar o usuário à home page
  - Exibição vertical dos cards de POKs no feed ao invés de horizontal: adicionei novos aprendizados em produção hoje e notei que eles estão dispostos lado a lado. Prefiro uma visualização centralizada vertical, onde o mais recente está no topo (LIFO).
- **MODERADAS**
  - A interface ainda está "feia", com cara de formulário, temos muitas oportunidades aqui.
  - Eu não gostei do botão "Novo Aprendizado", ele pode continuar lá, mas também deveria ter 2 caixas de texto (1 para título) na home onde podería
  - o botão de login com google está retangular, com bordas ou margens brancas contornando ele, muito feio, dado que o fundo é azul
- **LEVES**
- **EVOLUÇÕES FUTURAS**
  - Quando adicionarmos capacidades sociais, o handle (@lucas, no caso do meu usuário) disponível no canto superior direito ao lado do botão "Sair" deverá ser clicável e redirecionar o usuário para seu perfil. Ao lado do handle deverá ser exibida também uma miniatura do avatar do aprendiz (learner/user)
  - 

## Perguntas em aberto

- O que sugere para melhorarmos o front?
  - Figma? Lovable? Claude itself? Other AI tool?
  - Delegar para o agente `ui/ux-specialist`?