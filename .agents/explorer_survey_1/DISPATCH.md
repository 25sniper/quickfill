## 2026-09-10T14:59:39Z

Survey the project architecture, dependencies, build/test tooling, and repository layout:
1. Check package.json, build scripts, dev dependencies, bundler configuration (Vite/Webpack/etc.), TypeScript configuration (tsconfig.json).
2. Check existing test setup (Jest/Vitest/testing-library), whether unit tests or test runners exist, what test scripts are configured in package.json.
3. Check the bundle size baseline if possible by inspecting build configs or existing dist/build outputs.
4. Map the entire project file tree, identify entry points (index.html, src/main.tsx or src/index.tsx, src/App.tsx), routing setup (or lack thereof), asset folders (public/, src/, etc.).
5. Identify any current CDN or asset hosting references.
