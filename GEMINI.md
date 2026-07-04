# Gemini Agent Instructions

Please follow these specific rules and workflow guidelines when working on this project:

1. **No Self-Testing**: 
   - Do not execute any automated testing tools, test scripts, or runner commands (e.g., `jest`, `vitest`, `playwright test`, `cypress run`, `npm test`, `pnpm test`).
   - Do not run local scripts or assertions to verify logic.
   - Code correctness must be verified statically or conceptually. Inform the user of updates and wait for them to perform runtime checks and provide reviews/feedback.

2. **Do Not Run Dev/Preview Scripts**: 
   - Never run command-line development servers or preview utilities (e.g., `pnpm dev`, `npm run dev`, `vite`, `vite preview`, `node dist/index.js`, `nodemon`).
   - The user has a persistent development server running in their local terminal (binding ports `5173` and `3000`). Running another dev instance will cause port conflicts.

3. **Follow Documentation**: 
   - Align all code changes with the established files in the `docs/` directory:
     - Follow project scope and requirements in `docs/PRD.md`.
     - Follow technical architectures and stack guidelines in `docs/TRD.md`.
     - Follow database schemas, tables, and constraints in `docs/SCHEMA.md`.
     - Follow styling guidelines and visual wireframes in `docs/UI.md`.
     - Follow developer checklists and milestones in `docs/PLAN.md`.

4. **Use Available Skills**: 
   - Prioritize using the configured agent skills for specialized execution blocks:
     - Use `modern-web-guidance` before modifying HTML/CSS or React structures.

5. **Use Relative Paths**: 
   - Always reference documents, code files, and assets using relative workspace paths (e.g., `docs/PRD.md`, `client/src/App.tsx`, `server/src/index.ts`) instead of absolute paths (e.g., do not use `/home/aditya/...`).
