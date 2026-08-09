# AI Agent Rules for Campus EventHub

## Living Documentation Rule

Whenever you (the AI Agent) implement a new feature, change the database schema, add new dependencies, or alter the system architecture, you **MUST** proactively update the following files in the project root to reflect those changes:
1. `requirements.md` (Update if new features or workflows are added).
2. `architecture.md` (Update if models, stacks, or system designs change).
3. `README.md` (Update if setup instructions or run commands change).

Do not wait for the user to ask you to update the documentation. Keep them updated as part of your standard implementation workflow.

## UI/UX Design Rule

When building frontend components, you must rely on the UI/UX intelligence provided in the `D:\campusconnect\ui-ux-pro-max-skill` repository.
You should run the Python search scripts (e.g., `python D:\campusconnect\ui-ux-pro-max-skill\scripts\search.py "query"`) to retrieve color palettes, font pairings, and UI component structures *before* writing the frontend code. Do not use generic styling; always apply the premium rules from the skill.
