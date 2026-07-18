# Prompts System

The ContentCompiler utilizes an independent Prompt Registry, which sits outside of the application's domain logic in order to manage prompt versioning and rendering natively without bleeding hardcoded string data.

## Template Formats
Templates are strictly typed using `.json` structures, parsed against `PromptTemplateSchema`.
Example:
```json
{
  "id": "content-generator",
  "version": "1.0.0",
  "requiredVariables": ["topic", "tone"],
  "template": "Write a short paragraph about {{topic}} in a {{tone}} tone."
}
```

## Internal Architecture
1. **Registry (`InMemoryPromptRegistry`)**: Keeps track of `id` and `version` pairs. Pulls latest version when explicitly undetermined.
2. **Renderer (`MinimalPromptRenderer`)**: Validates missing arguments from configurations safely and strictly interpolates variables inside bracket placeholders (`{{key}}`).

## Usage Example
```ts
const rendered = promptModule.renderPrompt('content-generator', { topic: 'espresso', tone: 'formal' });
```
