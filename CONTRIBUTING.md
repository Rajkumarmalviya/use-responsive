# Contributing to use-responsive

Thank you for your interest in contributing! Here's how you can help.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/use-responsive.git
   cd use-responsive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   This starts a Vite dev server with live examples.

4. **Run type checking**
   ```bash
   npm run type-check
   ```

5. **Format your code**
   ```bash
   npm run format
   ```

## Project Structure

```
use-responsive/
├── src/              # Source code
│   ├── useResponsive.ts
│   └── index.ts
├── example/          # Live examples
│   ├── App.tsx
│   ├── main.tsx
│   └── index.html
├── dist/             # Built files (generated)
└── package.json
```

## Code Style

- Use TypeScript for all code
- Follow the existing code style
- Run `npm run format` before committing
- Add JSDoc comments for public APIs
- No `any` types allowed
- Ensure type safety

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issues in commits when applicable
- Keep commits focused and atomic

## Pull Request Process

1. Update README.md if you're adding features
2. Update CHANGELOG.md following Keep a Changelog format
3. Ensure all type checks pass
4. Make sure your code is formatted
5. Update examples if necessary

## Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Code examples if applicable

## Questions?

Feel free to open an issue for discussion!
