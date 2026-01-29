# Engineering Daybook

We're going to plan on how to create my Engineering Daybook project.

---

## Context

### History

I've just finished reading "The Pragmatic Programmer" book and there's a part where the authors mention something called an "Engineering Daybook".
What is it? On the context of the book, it was something engineers of an industry (they were NOT software engineers) would, on a daily basis, write down by hand something that they learned on that day. Engineers with "longer", most full of notes books, would almost "brag" about it.
It is some kind of learning journal.
While the book (The Pragmatic Programmer) explicitly recommends the reader (myself in this case) to actually use a physical, paper notebook as the engineering daybook, I want to build one as my next software project.

### Semantic Agreements and Glossary

- chat: I'll refer to chat as a conversation between myself and Claude AI web or desktop interfaces (or other LLM backed chat bot applications, such as Perplexity, ChatGPT, etc.)
- session: I'll refer to session as an open session between myself and Claude Code (basically, everything I prompt after running `/claude` on this project's folder terminal)
- Claude AI: Claude's Web and Desktop chat tools
- ED: I'll use it as short for Engineering Daybook
- EDP: I'll use it as short for the Engineering Daybook Project
- POK: Piece of knowledge. While I don't have a better name for it, that's how I'll refer to EDPs atomic/minimal units of information
- POKs: plural of POK
- POL: Piece of Learning. I don't even know if that makes sense grammatically, I'll use it interchangeably with POK.
- POLs: plural of POL
- TPS: transactions per second
- UI/UX: User Interface/Experience
- WIP: work in progress

### Setup

This is the initial prompt for setting up the project.

Instead of a single chat or session, I'll use the Claude AI Project and Cowork features paired with Claude Code to assist and manage this project. Given this decision, I need help:

1. **Prompt Review:** reviewing and if so necessary, rearranging and/or rewriting this prompt
   1. for example: there are items on this section and many other sections that could also be on the "Deliverables" section and vice-versa
   2. the review should aim to make this better structured, cohesive, and efficient
   3. the review should aim to make this prompt the most effective **in/on** and **with** the tools and features listed below
   4. the review should help addressing ambiguities, inconsistencies, overall gaps, and redundancies
   5. the review should assist in leveraging the most of Claude AI, Claude Code, and their underlying models, tools, features, and capabilities
   6. grammar and spell-checking are also welcomed
2. **Prompt Split Up:** breaking this prompt down into artifacts that I can use as:
   1. **For Claude Code:**
      1. One or more prompts to setup the project considering the premisses, directives and goals below
   2. **For Claude AI (web/desktop):**
      1. **Project feature:**
         1. Instructions for the Engineering Daybook project
         2. Files for the Engineering Daybook project
         3. Prompts for the Engineering Daybook project Setup
      2. **Cowork feature:**
         1. Prompts - if applicable and efficient - to assist on the Project
   3. **For ALL of them:**
      1. Other resources that will help out planning, building, and ultimately delivering the EDP
3. **Tool Usage:** how to best leverage all of Anthropic's/Claude tools?
   1. Considering my subscription plan is Pro and that some of the tasks here are better handled by Claude Code, and some other by Claude AI or Cowork, I also need help on identifying which ones and addressing them accordingly

---

## Directives and Premisses

Because this will be a long project, I didn't want to concentrate it on a single chat or session. What I did instead was creating a project in Claude AI to handle it.
I will separate the directives at first in **Cross-Session/Top Level Directives**, for those that will be used in several different chats whenever their context gets too long and heavy, and **Session-level Directives** for shorter sessions and interactions.
Also, I have premisses and hypothesis that I'm assuming to be true. Please double-check and sanity check them before proceeding.

### Premisses

- I take it that Claude's standard context window is 200K tokens, right?
  - if so, I'm not sure exactly when a context starts getting too big and loses performance, but as a rule of thumb I'll assume it's by the half of it (once it reaches 100K tokens), hence, the token directive below
- it is possible to let a "listener" agent running on the background (see `pulse` under **AI & Workflow** below)
- I don't know how successful will this project be, maybe I'll be the only user, so I'm quite open on infrastructure decisions.
- it is possible and it is not an anti-pattern to have a monorepo project with web, mobile, and backend stack
- We will work iteratively. Some definitions here will likely change as we learn and build the project together.
- Although I'm working by myself as the single engineer, product team, and customer on this project, I'll try to use agile techniques while working on it
- it is impossible to predict or even remember every single use case, requirement or feature on this app. This is an initial document on which we will build the foundations for the project. As the project grows, so will our  level of understanding on it, and consequently so will the documentation.
- as with agile methodologies, we will start off with what we already know about the goals and requirements and refine them on each iteration. It is likely that several directives, premisses, and requirements will be added, removed and changed while we're at it, but we've go to start somewhere
- I'm not trying to predict the future, so this is not a waterfall project
- I'll use IntelliJ, VS Code, Postman, Android Studio, Docker Desktop, and Claude as my main development tools
- My personal mobile device is Android (Samsung Galaxy S25 Ultra)
- My PC OS is Windows and it's running in a Samsung laptop

### Cross Session Directives

- Think hard and think step by step
- Explain your reasoning
- Show tradeoffs and explanations for any and every questions, decisions and or suggestions that either one of us make
- Instead of agreeing with everything I propose, ALWAYS show arguments pro and against suggestions and or decisions that either one of us make
- Feel free to use tools such as - but not limited to - `web_fetch`, `conversation_search`, plan mode, prompt enhancer, and `TodoWrite` as well as the connectors (such as GiHub, Notion, etc.) whenever you see they fit the task at hand
- Before creating or editing any file, we're going to plan and wait for approval
- Show me the plan and wait for my approval before proceeding
- Whenever there's ambiguity, prompt me for disambiguation
- Use Mermaid for workflows and dataflow charts
- Be able to at any given moment summarize the current chat or session in a file to be used as context or initial prompt on a new chat or session
- Warn me when we arrive at 100K tokens on a chat or session such that I can pause, record the milestone, setup the initial prompt for the next session, and finally close the current one
- All prompts should be stored under `/engineering-daybook/prompts` folder:
  - `/user`: for myself generated prompts
  - `/claude`: for Claude generated prompts
  - This file (`Engineering Daybook.md`) will be the exception, as it's the projects original prompt, It will be stored under `/prompts` root (as it already is by the time we're writing).
- As I also read in The Pragmatic Programmer book, it is good practice to use source control (in this project's case, Git with GitHub) to handle everything, even documentation, so we won't add `/prompt` to our `.gitignore` file.
- I'll be the only one to edit this very file, but we can create versions of it by suffixing the new files with date and versions, something like `engineering-daybook-2026-01-28_1.0.md` (`project-name-YYYY-mm-DD_major-version.md`). Or even better: just suffix it with `-claude` and update the change log table by the end of this file, hence, we'll have 2 files (mine and this second one).
- By the end:
  - confirm your understanding through a concise summary of this prompt (maximum 1 bullet point with less than 500 characters per section)
  - help me answer the inquiries made here, especially the open questions
  - review this prompt:
    - does it need splitting up into smaller prompts? Or even tool-oriented prompts?
    - is it too broad? Too shallow? Too generic? Too deep?
    - does it need fixing, adjusting?
    - is the context too big? Is it not big enough?

### Session Directives

- Use plan mode
- If you think this prompt is poorly written and there's lots of room for improvement, help me improve it before moving forward
- The deliverables below will be generated one by one. Not all at once
- Always wait for my approval on a plan, documentation, coding, or overall file before proceeding to generate other files and deliverables

---

### Goals and Deliverables

#### Ultimate Goal (cross-session)

To deliver the EDP.

#### Session Goals

I'll be happy if by the end of this session, we have successfully:

- Laid out the initial draft with the project's desired planning, scope, documentation, structure, architecture, technological stack, and next steps

Should we run out of tokens before reaching the stated goals, at the very least we must have the blueprint to start from on the next sessions (something like the `ROADMAP.md` file in other projects).

#### Deliverables

This is a WIP and its content is spread across many sections in this prompt.
The deliverables, as defined in the directives, are not to be generated all at once, or even all on this very same chat or session. But we will go across them iteratively and in an on-demand manner.

Still, I guess the following should do (give me your thoughts on this):

- The EDP `README.md` draft/initial version file
- The project's initial commit comprising its basic structure, `README.md`, and `.gitignore` files
- Diagrams with top-level architecture and use-cases
- Some sort of suggested directory tree for the monorepo organization (as in the output of a `/tree` command) with the desired system architecture
- Prompts for the next steps (next Claude AI chats and Claude Code sessions)
- Prototypes for the web app screens (this is not that important now, but it'll be later on)
- A top level project plan with phases, deliverables, etc.:
  - this plan will be used as input for deeper-level plans on smaller features ahead

---

## Requirements

### Functional Requirements

#### What the ED _**will**_ be

- A place where one can record and search through pieces of knowledge of their own
- An app that allows both automatic and manual tagging of categories of knowledge
- An app where every new entry is an atomic - though modifiable - and unique piece.
  - while a learning entry might be modifiable, it is paramount that it is NOT changed between querying and displaying, meaning, should we use LLM powered features on this project, it is IMPERATIVE that NO knowledge is changed by the AI. The pieces of knowledge should be protected from technologies, and the LLMs must not "hallucinate" on those learnings, edit them, of anything like that whatsoever. If the user asks for a theme, the AI might assist with insights connecting different pieces of recorded learnings, but the pieces themselves might only be edited by the author of them, and the author is ALWAYS the user.
- An app that enables the following use cases.
- A fully digital and interactive **learning journal**
- A live memory that can be used on several ways, such as:
  - keeping track of progress
  - assisting engineers when facing problems they faced before (but might not remember how to solve them perfectly)
  - assisting engineers to write down their resumes/CVs
  - assisting engineers to write down their brag docs
  - connecting different, but related, topics:
    - like a graph or something that provides insight for the engineer on how a new learning X relates to older learnings Y, and Z, for instance
  - the pieces of knowledge will be available "on-demand", meaning:
    - when the app boots at first, we'll do lazy init, meaning, the app won't load all of the user's recorded learnings on the context

##### Use Case 1: Recording something new

> An engineer is facing an issue, like a bug for instance, on the current feature they're working on.
> They search the web and find a solution, maybe on an article, book, LLM chat app, or the official's tool/framework/language/tech in general documentation
> He/she/they then applies that solution, tests it, and realizes it works
> By the end of the day they open the ED and write down something like "whenever doing X, use library Y to address Z issue"

ED will classify and record that learning with metadata like:

- timestamps
  - creation date
  - update date* (I'm still thinking whether the update should be an insert, like a immutable event with the newest changes on top)
- tags: automatically generated tags based on the content of the learning, like:
  - #backend, #java, #concurrency, #caching, #system-design, #oop, #functional-programming, #agile, etc.

##### Use Case 2: Searching

> An engineer is working on a feature that uses some learning they already recorded on the daybook.
> They open the app interface and type in the search bar (or chat if we go with LLM // chat bot // MCP) some concept such as "rest api" or "loose coupling".
> The app searches and returns a list with several learnings with tags that fit that concept
> the list of items should be displayed in a default sorting, but the user must be able to sort it in several different ways, such as date of creation, relevance (how close to the search it is), etc.
> the engineer picks one and reads it to "refresh" their memory on the subject (or maybe to update id? I'm still thinking whether updated are in fact just new pieces of knowledge, in that case, a view [CQRS] could group those pieces together)

---

#### What the ED _**won't**_ be

- A regular notebook or notes app such as:
  - A copy of OneNote, Evernote, or other apps like that
- A regular text editor, such as:
  - Notepad, Notepad++, VS Code
- A regular task management or productivity app such as:
  - Jira, Notion
- An LLM-powered chat bot that just generates insights on user notes and stuff

**How does ED differs from the aforementioned tools?**

##### ED x OneNote

ED will ultimately be some sort of notes app, of course. So why don't I just go with OneNote instead?
Here are (some of) the reasons:

1. I'm studying and building personal and professional portfolios. Just using a well-established tool would'nt help me address that goal
2. While a big part of ED functionalities are covered by tools such as MS OneNote, the interface and underlying goal will differ largely:
   1. **Organization:** OneNote let's users paste links, pictures, structured and un-structured data alike, without any organization whatsoever. ED will be focused on short (see open questions) pieces of data, mostly text (as it's learning notes), maybe diagrams (we engineers love our diagrams), etc. (see open questions)
   2. **Cleanness, UX, and UI:** OneNote becomes cluttered: as one starts organizing their projects, learnings, todo lists, etc., in OneNote, several pages and sections start cluttering the UI. ED will be clean, and as stated before, it's goal IS NOT to replace project management, productivity, or organization tools
   3. ***Searching:** OneNote supports a simple file/text based search, highlighting matches in an unordered manner across several different pages, sections, etc. ED on the other hand won't be file based, but entry based. The search feature will be empowered by MCP later on, and will be much more visual and it'll support several different ordering criteria

##### ED x LLM-powered / chat-based AI apps

On an LLM-powered chat app, for instance, the app always generates data based on the knowledge base/source and on the data used to train the underlying model. ED won't do that, as it'll display the actual note exactly as the engineer wrote it down.
Also, AI apps usually struggle with dates, specially when the event happened after the model (and consequently the data it was trained on) release date. On ED the user will be able to see several different visualizations of their learnings, such as a in a timeline, categories, interactive cards, and so on. Chat based apps are all about generating text immediately on user prompt, but their interfaces are not quite interactive in a browsing manner. One needs to scroll up and down constantly on a chat to refer to pieces of information, while in ED I aim to make it more visual, fluid, and seamless.

---

## Technical Definitions

I'll start this project as a monorepo, much like `wine-reviewer`, and a modular monolithic application on the backend at first. AS and IF it evolves, I'll proceed to refactor to the best suiting architecture.

---

### Evolution

I intend to develop the project in this order:

1. **MVP:**
   1. **Tech Features**
      1. Web frontend
      2. Backend
      3. Some sort of simple storage
   2. Product Features
      1. Authentication (regular and Google login/sign-in options)
      2. Creation of pieces of knowledge
      3. Querying pieces of knowledge
2. **Immediate Evolution:**
   1. **Tech Features**
      1. Mobile frontend
   2. **Product Features**
      1. Sorting queried poks
      2. Categorization of poks:
         1. either manually or automatically, but ideally both
      3. Editing poks
3. **Mid-long term evolution:**
   1. **Tech Features**
      1. Cloud
      2. AI:
         1. MCP Client and Server (which will power the chat bot feature)
   2. **Product Features**
      1. AI support:
         1. Chat bot (querying the poks)
         2. Generating insights on correlation between poks
      2. Data Viz:
         1. Generating visualizations of poks
      3. Social capabilities:
         1. Sharing knowledge on social media and forums such as Substack, Medium, and LinkedIn

---

### Stack

While I used Flutter and Java in project `wine-reviewer`, I want to try a different stack for this one.
For the very basic stack (which will increase along with the project) I was thinking:

- **frontend:**
  - React for the web
  - still open for the mobile
- **backend:** Java with Spring Boot
- **database:** open (see open questions)
- **cloud:** open (see open questions)

---

### AI & Workflow

Most of my workflow automation will be replicated from projects `ai` and `wine-reviewer` (see **Resources** below). Think about the best way to migrate it from other projects, following the directives below (maybe agent `cross-project-architect` could prove useful):

#### Agents

##### Agents to Keep (migrate)

- **backend-code-reviewer**
- **session-optimizer**
- **tech-writer**

##### Agents to Adapt

- **automation-sentinel:**
  - because on the early days of the project there probably won't be lots of evolution on my automation workflow, I want to disable the auto triggering of `automation-sentinel` on each and every `/create-pr` command, and leave it to be on-demand via prompt.
- **cross-project-architect:**
  - this project is completely different from the previous ones, but I believe this agent should help setting up the `engineering-daybook` workflow via migration and adaptation from the other aforementioned projects. The thing is, it'll likely require some changes to it in order to do so.
- **frontend-ux-specialist:**
  - as this will be a web project using React instead of a mobile project with Flutter, there's need to change this agent (or even to delete it and create a new one altogether) to fit the preferred stack
- **learning-tutor:**
  - I'm still not sure about the impact here, but it should be considered
- **pulse:**
  - I don't know if that's possible (see premisses and open questions), but instead of being triggered automatically on each `/create-pr` and using sometimes inference to identify automation invocations, maybe it could be running on the background asynchronously on every command or agent invocation. Like I run `/start-session` and `pulse` automatically increases this command invocation count or something. I don't know. Show me alternatives, tradeoffs, limitations and token consumption on this to help me decide

##### Agents to Remove

Actually, the agents below should not be removed from their source projects, instead they just won't be migrated here, the EDP.

- **flutter-implementation-coach**

#### Agents to Create

- a Product Manager / Specialist: this agent will help me develop and leverage my already existing product-sense and build the `engineering-daybook` to be a well-defined (and hopefully successful) product. I still don't know the best name for this new agent. Help me with that as well, for now I'll use `product-manager`
- a marketing-specialist: I'm not sure on whether this one is actually required. See open questions

#### Overall Workflow Changes

- Because the **very goal** of an ED is to record learnings, I'll no longer have the `LEARNINGS.MD` file on this project. That implies that any agents or commands that would usually create and update said file, must be adjusted to this project
- See open questions about the `product-manager` agent on the current automation workflow

---

### Frontend

I know there are AI tools such as Figma, Lovable, and Midjourney, but as I'm a backend engineer, apart from Figma, I've never used any UI or UX tool before, so I'm quite open on frontend stack options.
The important things to consider here are (in order of importance):

1. to ship the web frontend as quick as possible
2. to deliver a mobile app following the web frontend (so that the engineer can add new pieces of knowledge wherever they are and whenever they want)

To address the items above following the directives below:

- use languages, libraries, frameworks that are ubiquitous and widely adopted cross-industry:
  - I want a stack that is well-known, well-documented and easy to maintain, such that whenever I find bugs, issues, etc., I can easily search for solutions in Google, Claude, etc.
- use technologies that are free:
  - as the solution scales, that might change, but for now free is our target
- use technologies that Claude models (Opus, Sonnet, etc.) are well trained into working with

---

### Open questions (help me figure them out)

- **Versioning:** how will version management work?
  - I'm not strong on this, show me versioning strategies and help me decide.
  - I want it to be production-ready, top-level market quality
  - Best case scenario: it'll be fully automated, like it'll be updated on the project's dependency management system as well as the documentation on every pr or production release.
- I want the infrastructure to be as cheap, lightweight and easy to maintain as possible. So maybe there's no need for a cloud provider now, maybe there is. The whole infrastructure is an open question which will address based on the context, goals, and requirements defined on this prompt
- **Frontend:** how will the frontend stack look like?
  - web stack
  - mobile stack
  - UI/UX tools: will we use free tiers of tools such as Midjourney? Lovable? Etc.?
- **Backend:** which stack are we to use here?
  - I realized I didn't provide a fully detailed section for the backend. Prompt me for questions on this should you need it.
  - While I'm most comfortable with Java, I understand some future features, such as AI capabilities, would work better on Python. So I'm open to discuss the whole stack eventually. For the overall APIs, I'll go with Java + Spring Boot.
- **System Design:**
  - Will we tackle the "pieces of knowledge/learnings" in a event-sourcing with CQRS approach (treating new pieces as new events, and creating views to handle them once they're recorded?)
  - What would the overall architecture look like?
  - Are there better options to tackle this specific problem?
- **Data and storage:**
  - I need help with options for storing pieces of knowledge (usually in text format), as well as categorizing, generating insights and connections between them, sorting and ordering, etc.
  - SQL x NoSQL?
  - CAP Theorem: I believe ED's CAP priority to be as follows:
    1. Consistency: the pieces of knowledge must be consistent to what the user recorded, so I'm avoiding eventual consistency here (unless we see on tradeoffs reasons not to)
    2. Availability: while the ED should be available 24/7, there's room for some latency. As it won't handle millions of TPS, and insertion will likely be more frequent than updating and querying, I believe Availability comes second
    3. Partition tolerance: there's a change I'll be this app one and only user for some time (or forever for that matter if no one knows about it or cares to use it), this is the least of my concerns on the CAP triangle
  - Data formats:
    - MVP: just text
    - later:
      - perhaps images?
      - sound recordings?
      - diagrams (mermaid)?
      - links (which are pretty much texts, but ok)
- **Prompts:**
  - is the quote syntax (""">""") the best way to describe use-cases in markdown? If not, I'll change on future prompts
  - do you have enough info? Did I miss out on something critical?
- **Automation Workflow:**
  - The planning and requirements part of this project will likely count heavily on the newly added `product-manager` agent. But I still don't know how it will integrate with the current automation workflow (maybe the agent won't even work on Claude Code, but on Claude AI instead?)
- **Requirements:**
  - I realize I didn't add a "non-functional" requirements section. I honestly didn't put much thinking into that, but I believe some of them are indirectly documented spread across this file's many sections. Prompt me for questions to improve this should you need it
- **agent `marketing-specialist`**: see section <q>Product Marketing</q>

---

## Product Marketing

I've never launched a product entirely by myself before. Obviously working solo I don't have a marketing team to assist me with that. Given the project's goals and features, I believe the best places to promote EDP are tech and professional hubs, such as LinkedIn, Medium, and Substack, which are pretty much the ones I currently am aware of and use regularly.
The thing is, even though I'll start developing and using the product by myself, I would be tremendously happy if I manage to help other people (mostly engineers I guess) and impact their lives in a meaningful way using the ED.
I need help establishing a strategy publicize this product and reach them (the people I intend to assist and have ultimately as customers).
Right now, as it's a personal project, I'm not thinking about monetizing or anything like that, just overall user adoption.
I don't know how to approach this, if the way forward is creating specialized agents or something. Help me address this.
Right now, the "pain" points would be:

- **naming:** engineering daybook is more of a description than it is a product's name. Branding matters
- **promoting**
- **gathering feedback:** should the promoting work, I'll need help on a strategy to collect feedback and iterate over it to enhance the product
- **branding:** eventually, I'll want a cool design, logo, UI and UX for the app, this goes hand-in-hand with the naming, but also, further.
- **pitching:** showing that ED is different from other products, and selling (though for free) it as a solution for X problems

---

## Resources

- All of my personal projects (including this one) are located under folder: `C:\repo`.
- For projects that were built with Claude Code assistance, the workflow automation will be under `/project/.claude/` directory
- My URLs:
  - [GitHub](https://github.com/lucasxf)
    1. [AI](https://github.com/lucasxf/ai)
    2. [Engineering Daybook](https://github.com/lucasxf/engineering-daybook)
    3. [Wine Reviewer](https://github.com/lucasxf/wine-reviewer)
  - [LinkedIn](https://www.linkedin.com/in/lucas-xavier-ferreira/)
  - [Medium](https://medium.com/@lucasxferreira)
    - Articles:
      1. [From Zero to Automated Workflow with Claude Code](https://medium.com/@lucasxferreira/from-zero-to-automated-workflow-with-claude-code-4cb5f579bf50)
      2. [8 Commands That Transformed My Claude Code Workflow](https://medium.com/@lucasxferreira/8-commands-that-transformed-my-claude-code-workflow-a226dc111aec)
      3. [9 Specialized Agents Working in Orchestra](https://medium.com/@lucasxferreira/9-specialized-agents-working-in-orchestra-43465908fad5)
      4. [5-Week Retrospective: What Really Changed](https://medium.com/@lucasxferreira/5-week-retrospective-what-really-changed-239aa45faa5e)
  - [Substack](https://substack.com/@xflucas)

---

## Conclusion

This prompt is massive hehehe.
I believe, however, that I have covered all of my major concerns and goals about the EDP. Most of them will probably change as they're not deep enough, and I'll learn more and iterate on it as we move forward. That is by design, that is what Agile is ultimately for. Ship, test, learn, pivot, repeat.
But I'm happy for now (:

---

## Version

| Version |    Date    |    Description    |        Authors        |
|:-------:|:----------:|:-----------------:|:---------------------:|
|  1.0    | 28/01/2026 | Initial prompt.   | Lucas Xavier Ferreira |

---
