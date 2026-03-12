# Enhancing CLAUDE.md Feedback

Before I answer your questions, I have other questions of my own:

1. Why didn't a root CLAUDE.md file exist before? Is that a bug? Was it missing? Is it standard behavior?
2. In case we DO create a root CLAUDE.md file: does Claude Code even use it? Like EVER?
3. If Claude Code DOES use root CLAUDE.md, does it have precedence over the project level CLAUDE.md? For instance, if they present conflicting directives?
4. If Claude Code DOES NOT use root CLAUDE.md, should we even create it in the first place?
5. Are there any benefits of creating a root CLAUDE.md file? Is there any harm in creating it?

---

## Answering your questions

Again, I don't really remember your questions, but I'll put what I'm assuming they were in _itatlic_.
1. _Q. where should `lessons.md` stay?_ A. `lessons.md` path:
   1. I guess `docs/` so we don't create so many new folders at project root.
   2. This question resonates with question 4, so I'll sort of answer both of them here. Also, I'm not 100% sure on this, show me trade-offs, maybe "search" claude documentation and guides, or even how other engineers do this. Help me decide. I think no lessons need to be checked out, meaning, they don't need to go to remote repository in github (so can they can be added to .gitignore), but you can argue and disagree with me on this. Anyway, I would do it like this:
      1. For lessons that are context/domain/project specific, save them on the project's memory system.
      2. For lessons that are cross-project or project-agnostic, maybe we could create a root lessons file, like in `~/.claude/docs/lessons.md.`. What do you think of this strategy? I DO NOT want to duplicate anything. Meaning, directives and learnings that are already documented in `CLAUDE.md` or `MEMORY.md` don't need to be duplicated in `lessons.md`. Help me decide. I also don't want to clutter the repository
2. _Q. Should I remove `/finish-session` + update `ROADMAP.md` and replace it with `todo.md` (or was it `lessons.md`?_ 
A. This one could be used to assist you in having a cleaner context, but it should not replace my workflow. It should be created the minute I approve a plan and if by the end of the session (when I invoke `/finish-session`) the `todo` is finished, maybe timestamp it like `todo-archived-2026-03-02-hh-MM-ss-feat-tagging-system.md` or whatever just so we know it's done. Meanwhile, at `/start-session`, checking `todo` could be a new step. That would, of course, not work very well on worktrees created within a claude session (in case the worktree was created via `claude worktree <worktree-name>`, as claude deletes them on session end, i.e. on double CTRL+C press), but for worktrees created via `git add worktree <worktree-name>`, as they are "durable" and "survive" closing a claude session from the terminal, that would work just well
3. _Q. root claude.md should save what type of directives? Cross-project or project-agnostic?_ A. Both (cross-project and project-agnostic)
4. _Q. Where should I save `lessons.md`?_ A. Memory system (as it already exists)
