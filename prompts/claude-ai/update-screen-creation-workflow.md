# Updating UI/UX Automation Workflow

Now that we have successfully created `/generate-v0-prompt`, there are some changes I'd like to perform to the way we specify and implement screens on **learnimo**.

## Context and Problems

### Cardinality

Cardinality-wise, a spec might be:

- **1:1:1**: 1 spec/1 screen/1 v0-prompt
  - this is the happy path, the best case scenario: implementing a single spec generates a single screen and a single conversion to v0.
  - invoking `/generate-v0-prompt --<spec-name>` is straightforward
- **1:N:?**: 1 spec/n screens
  - things start to get a bit more complicated here: a single spec changes/creates several screens. 
  - `/generate-v0-prompt --<spec-name>` would have to generate several prompts? Or a single prompt with several screens?
- **N:1:?**: N specs/1 screen/? v0-prompts
  - this is even trickier: there are several spread out specs that change the very same screen.
  - I have no idea how will `/generate-v0-prompt --<spec-name>` behave in this cases
- **N:N:N**: N specs/N screens/N v0-prompts
  - This is the automation workflow for screen creation and conversion final boss: there are several specs that change several screens, while several screens might be changed by several specs, and finally, they might result in several prompts

### Workflow

I'll use happy path simplified top-level workflows to exemplify what the problem at hand is.

**PAST:**

How I would implement a new feature comprising not only the screens (which we'll address in this session), but the whole stack (as most features involve UI/UX, web, frontend, backend, and database):

```markdown
/> start -> claude -> shift+tab to _plan mode_ -> `/start-session` -> `/write-spec` -> `/implement-spec` (agents) -> `/finish-session` -> `/create-pr` -> end
```

**PRESENT:**

As we have succeeded in creating most of the MVP screens, I decided to enhance them and my tool of choice was Vercel's v0. To achieve that, I setup `/generate-v0-prompt` command that parses current specs into custom v0 prompts specialized in screen building (leaving out other stacks details).

So we're in some sort of transition state, and the workflows below represents that:

```markdown

/> start -> claude -> `/start-session` -> `/generate-v0-prompt` -> a pre written and implemented spec is parsed into a v0 prompt -> **user (myself) opens browser -> parallel work in v0 -> v0 prs to develop -> end
```

**FUTURE:**

As we finished migrating all of the app's current screens, we proceed to adapt our workflow for _new_ screens instead.

**A - The Problematic Future:**

The problem with the approach below is having `/write-spec` wastefully generating full stack spec that will later be split up into a v0 UI/UX-only spec prompt, thus making it a bit redundant and a lot wasteful:

```markdown

/> start -> claude -> `/start-session` -> `/write-spec` -> `/generate-v0-prompt` -> parallel work -> `/implement-spec` -> session ending steps -> end
```

**B - A _somewhat less_ problematic future:**

In this context we separate both the specs writing and the specs implementation into stack-specific commands and agents, such that there's no waste.

```markdown

/> start -> claude -> `/start-session` -> `/write-v0-ready-ui-ux-spec` -> `/write-backend-infra-whatever-spec` -> parallel work -> `/implement-spec` -> session ending steps -> end
```

**B - An actual good future:**

We're going to brainstorm this one. I need help.

### Strategy

**Strategy Disclaimer:**

* These are **suggestions** to break down the bigger problems into smaller ones and tackle them accordingly.
* We DO NOT NEED to follow them strictly, quite the opposite, we must remain skeptical and problem-centric, such that we carefully analize and critic all ideas to come up with the best plan to address the problems.

**Suggestions:**

- A spec x screen map/catalog: mapping and understanding how the roadmap phases relate to the specs, and how the specs relate to the screens and recording that knowledge in some sort of table or catalog would help visualizing the relationships and cardinalities between them
- Once the context is laid out, there's a good chance we would have to change the behavior of `/generate-vo-prompt` and a slight chance to change `/write-spec` and `/implement-spec` as well

## Goals

- To address the workflow issues described above
- To have an automation workflow that is token-wise efficient

**Directives:**

- We must strive to leverage the most of `claude code` and `vercel-v0` capabilities as seamlessly as possible
- To its core, my automation workflow must remain as agnostic, idempotent, adaptable, and reusable as possible
- We must avoid redundancy at all costs
- Focus on the problems

**Constraints:**

- We must achieve the goals while following the directives and respecting the constraints
- Avoid bias towards the suggested approaches here
- Avoid over-engineering
- Avoid adding unnecessary complexity
- Avoid weak, brittle, one-time-only solutions
- Avoid changing too many agents, commands, and hooks to address the problems at hand
- Avoid expensive solutions (that would require pricey plans on either claude, vercel-v0, or any other tool)
- Avoid lots of manual work: while a bit redundant, I want to stress this principle, the goal of an automation workflow, is obviously, automating stuff so we don't end up doing manual labor
- I DO NOT want to rely too much on a single tool, such as vercel-v0, so my workflow must not revolve around it: even if we adapt the workflow to using it, all cogs in the automation workflow machine (the agents, commands, hooks, etc.) should be as technology agnostic as possible, such that in case I switch "vendors" for screen development assistance (from v0 to Midjourney, for instance), I won't break my workflow on too many parts
