# New Features, Roadmap Update, and Requirements Update

I've using `learnimo` a lot on production these days and have identified several opportunities for improvement as well as changes in direction, and some minor issues.
Please find them below and plan on how to address them properly.

## Roadmap Changes

**Changes in priority**:

- Roadmap phases 4 (growth & polish) and 7 (gamification) are to be postponed, they're not my priority now
- A new phase enters and gains priority over phases 4 and 7: help me name the new phase based on the roadmap and features changes documented here
- All changes documented here have priority over phases 4 and 7

## Features

### New features

- **Knowledge Paths: A mental map**: I want to visualize the learnings in some sort of graph based on their connection to each other. There are tools that receive adjacency or edge lists and convert them into images. I want that. While this is not a spec, I'm adding some details for the roadmap. The map shouldn't, at first, comprise all of the person's learnings, but be grouped by major category, such as "dsa" or "software-development". As someone might be studying several different unrelated topics, we could draw several mind maps as well. I want to name them something like "Knowledge Paths/Pathways" or "Caminhos de Aprendizado/Aprendizagem"
- **Markdown support**: as an software engineer that constantly uses AI, having **learnimo** automatically format and display markdown syntax would be extremely helpful when recording knowledge. This feature is a MUST. The markdown support for POK CONTENT is a MUST, but for TITLES is a SHOULD/NICE TO HAVE

### Changes in current features

1. **Tagging System**:
   1. **tag search**: add support for tag based search (we sort the POKs based on tags on the "Etiquetas" tab, but it is NOT the same thing)
   2. tags **casing**:
      1. MUST be case-insensitive: while the user might input "Claude code", we should store it both ways: a "data" column with all small caps (which we'll use on other features such as semantic search, tag searching, mind map, etc.), and a "display" column with how we're going to present to the user (as they should see the way they typed it in)
      2. tags MUST be shown in the UI as the user input them
      3. I want a backfill to run, because I accidentally created a `Claude code` tag, when I actually intended to create a `claude code` one. So as a learner myself, I want this tag on my UI to be shown as `claude code`
      4. tags COULD be input as small caps: there could be a mask on the frontend/web input fields that "forces" small caps. I need to brainstorm trade-offs on this (NOT ON THIS SESSION, BUT ON /write-spec and /implement-spec in the future)
      5. tags MUST be stored as all small caps (.toLowerCase() in the backend or something)
   3. tags **naming**:
      1. **dashes over spaces**: whenever a learner inputs a multi-word tag separated by white-spaces, we should replace said spaces with dashes. In the casing example above, when I was typing `claude code`, the UI should automatically insert a `-` with an underlying mask and show me `claude-code` instead. To avoid bypasses, the backend should also address this (like with a `"String".split(" ")` or `"String".replace(" ", "-")` function of sorts)
