/start-session --stack=docs

**Task List:**

1. Add new command (I already pasted it under `/.claude/commands/`)
2. Update documentation
   1. readme, claude, etc.
   2. roadmap updates
3. Update automation workflow
   1. update agents and commands that might be affected by this change
   2. update agents-readme (if necessary) and commands readme files with the newly added command
   3. update agent/task/command based hooks and underlying shell and python scripts with the newly added command

**New Command:**

On this session we'll add a new command called `/generate-v0-workflow`.

**Documentation:**

We'll also update the required documentation (automation workflow, readmes, commands, etc.) with the updated workflow.

**Rationale:**

While we have already built a lot of our original roadmap, I'm not really happy with the screens design, and there are lots of room for improvement. This new command, and my change in approach (to delegate screens remake to vercel's v0) is based on that feeling.
