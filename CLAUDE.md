# CLAUDE.md

This file provides guidance to C‍laude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: There is currently no `build` script in `package.json`, but you can typecheck the project using `npx tsc --noEmit`.
- **Run tests**: `npx jest` runs all tests.
- **Run a single test**: `npx jest src/path/to/test.ts`
- **Lint**: The project lacks a standalone lint script in `package.json`. TypeScript typechecking (`npx tsc --noEmit`) acts as the primary validation step.

## High-Level Architecture & Structure

ContentCompiler is a pure TypeScript runtime engine for processing declarative specifications into output artifacts (JSON/Markdown). The project strictly forbids UI frameworks (React, Next.js, etc.) and DOM APIs; it is entirely Node.js based.

### Core Principles
- **No `any`**: Type safety is paramount. Unknown payloads should be typed as `unknown` and validated/narrowed to concrete types using `zod`.
- **Zod for Validation**: Zod is the standard for runtime payload validation.
- **Interfaces over Type Aliases**: Prefer `interface` rather than `type` for defining object structures.
- **Line Endings**: Every file (source code and Markdown) must end with a single newline according to standard formatting constraints.

### Directory Structure & Intent
The overall codebase structure aims to separate external integrations, business logic, and executable pipelines:

- **`src/domain/`**: Houses the core business logic, types, interfaces, and schemas. This layer remains isolated and must contain no implementation details (infrastructure or third-party logic).
- **`src/adapters/`**: Houses implementation details and integration layers for third-party systems. For example, third-party provider integrations like Anthropic exist under `src/adapters/provider/anthropic/`.
- **`src/workflows/`**: (or `workflows/`) Serves as the composition root. This is where dependencies are instantiated, wired together, and executed as complete data pipelines. Workflows primarily output JSON artifacts or generated text paths.