# ContentCompiler: Terminology Contract

This document establishes the official project terminology for the ContentCompiler open-source project. It is a strict contract. Every future document, module, and communication within the repository must follow this terminology consistently.

The objective is to eliminate ambiguity, prevent synonym drift, and create a shared language across the entire project.

---

## Official Terminology

### Core Architectural Distinctions

**Layer:** A permanent architectural boundary responsible for one isolated responsibility. Layers perform responsibilities but never travel through the system.
**Contract:** The formal specification governing the behavior, boundaries, and relationships of a Layer or Entity. Contracts define rules, not runtime objects.
**Entity:** A piece of information (e.g., Knowledge, Decision, Target Intent, Content Package) flowing through the architecture. Entities evolve and transform, but never execute responsibilities.
**Process:** The active computational operation executing the logic defined by a contract.

---

### Official Name: Business Knowledge
**Definition:** The raw, unstructured context regarding an organization's goals, brand, products, constraints, and target audience.  
**Purpose:** To serve as the foundational input for the compilation process, ensuring all generated content is deeply rooted in reality rather than LLM hallucination.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Prompt Context, Input Data, Background Info.  
**Notes:** Must always precede compilation. Represents the "source code" before execution.  

### Official Name: Compilation
**Definition:** The methodical process of selecting, composing, organizing, and validating reusable Components to form an Output Structure.
**Purpose:** To systematically assemble approved Content Decisions into execution-ready structural schemas without requiring additional strategic thinking.
**Allowed Synonyms:** None.  
**Forbidden Terms:** Generation, Writing, Processing, Drafting, Strategizing.
**Notes:** Compilation never reasons, never invents, and never changes decisions.

### Official Name: Component
**Definition:** A discrete, reusable structural building block (e.g., Hook, CTA, Story, Visual Direction) assembled during the Compilation process.
**Purpose:** To enable infinite scalability and cross-platform consistency by assembling outputs from validated strategic primitives.
**Allowed Synonyms:** None.
**Forbidden Terms:** Section, Part, Block.  

### Official Name: Compilation Model
**Definition:** The architectural Contract governing how the Compilation Layer selects, composes, and organizes Components.
**Purpose:** To establish the structural rules mapping strategic intent into organized components.
**Allowed Synonyms:** None.  
**Forbidden Terms:** Workflow, Pipeline, Funnel.  
**Notes:** Governs the Compilation Layer specifically.  

### Official Name: Content Decisions
**Definition:** Explicit, documented choices about strategic direction and formatting, finalized before Target selection and Compilation.
**Purpose:** To lock in the strategic direction and constraints, preventing generic outputs.  
**Allowed Synonyms:** Decisions.
**Forbidden Terms:** Outputs, Ideas, Drafts, Prompts.  
**Notes:** Content Decisions are Entities produced by the Decision Layer.  

### Official Name: Creative Brief
**Definition:** A structured document outputted by the compilation process that provides unambiguous instructions for a specific piece of content.  
**Purpose:** To align expectations and provide a rigid blueprint for the actual content creation phase.  
**Allowed Synonyms:** Brief.  
**Forbidden Terms:** Prompt, Instruction Set, Task.  
**Notes:** A specific type of Content Package.  

### Official Name: Video Package
**Definition:** A specialized Content Package focused exclusively on video production, detailing visual direction, pacing, and core messaging.  
**Purpose:** To bridge the gap between written strategy and audiovisual execution.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Video Script, Storyboard.  
**Notes:** Usually precedes the actual Script generation.  

### Official Name: Content Strategy
**Definition:** The overarching narrative, positioning, and distribution plan derived from the Business Knowledge.  
**Purpose:** To ensure individual Content Decisions align with long-term business objectives.  
**Allowed Synonyms:** Strategy.  
**Forbidden Terms:** Master Plan, Roadmap.  
**Notes:** Dictates the "why" and "where" behind the content.  

### Official Name: Target
**Definition:** The intended realization strategy defining *what* should be produced (e.g., Single Asset, Series, Campaign, Educational Experience).
**Purpose:** To determine the format and scale required to satisfy the strategic intent.
**Allowed Synonyms:** Realization Strategy.
**Forbidden Terms:** Output, Platform, Medium.

### Official Name: Output
**Definition:** The strict structural schema of a deliverable, defining mandatory/optional Components, ordering, relationships, and validation rules.
**Purpose:** To provide a rigid architectural blueprint before physical execution.
**Allowed Synonyms:** Output Schema.
**Forbidden Terms:** Target, Execution, Delivery, Final Asset.
**Notes:** Target determines *what* is produced. Output determines *what it structurally contains*.

### Official Name: Delivery
**Definition:** The physical materialization and handoff of Execution-Ready Content Packages to external systems or humans for publishing.
**Purpose:** To convert the conceptual structural blueprint into a published reality.
**Allowed Synonyms:** Execution (Legacy).
**Forbidden Terms:** Compilation, Output, Strategy.

### Official Name: Knowledge Base
**Definition:** The organized collection of Markdown files containing all approved Business Knowledge.  
**Purpose:** To provide a single source of truth that the LLM can reference during the Reasoning process.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Database, Memory, Context Window.  
**Notes:** Must be strictly formatted and easily readable by both humans and machines.  

### Official Name: Framework
**Definition:** The entire ContentCompiler methodology, encompassing the principles, structures, and processes defined in the project.  
**Purpose:** To encapsulate the project as a cohesive system rather than a loose collection of files.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** App, Software, System, Engine (Applies to architectural components, not implementation details like Prompt Engineering).  
**Notes:** Refers to the conceptual methodology, not code.  

### Official Name: Review
**Definition:** The evaluation of Content Decisions or generated content against predefined criteria.  
**Purpose:** To enforce quality control and strategic alignment before final approval.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Editing, Proofreading.  
**Notes:** Focused on strategic alignment rather than grammatical correctness.  

### Official Name: Quality Check
**Definition:** The specific, objective benchmarks and constraints that must be verified during a Review.  
**Purpose:** To eliminate subjective evaluation and ensure strict adherence to the Creative Brief.  
**Allowed Synonyms:** QC.  
**Forbidden Terms:** Audit, Test.  
**Notes:** Should be binary (Pass/Fail) whenever possible.  

### Official Name: Package
**Definition:** A structured architectural deliverable composed from approved Output Structures and their constituent Components, ready for human review or Delivery.  
**Purpose:** To group related structural assets together for streamlined delivery.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Zip, Bundle, Deliverable.  
**Notes:** e.g., a Video Package or a Campaign Package.  

### Official Name: Script
**Definition:** The final, generated text intended specifically for spoken or audiovisual performance.  
**Purpose:** To serve as the literal words spoken on camera or by a voiceover.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Copy, Text, Dialogue.  
**Notes:** Distinct from the Video Package, which contains the direction for the script.  

### Official Name: Hook
**Definition:** The critical opening segment of a piece of content designed to capture immediate attention and establish relevance.  
**Purpose:** To maximize audience retention in the first few seconds of consumption.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Intro, Opening, Beginning.  
**Notes:** A key structural element defined during Compilation.  

### Official Name: Persona
**Definition:** A documented representation of the target audience, detailing their demographics, psychographics, and pain points.  
**Purpose:** To ensure the LLM tailors its tone, language, and messaging to resonate with the specific reader or viewer.  
**Allowed Synonyms:** None.  
**Forbidden Terms:** Avatar, Ideal Customer Profile (ICP), Target Market.  
**Notes:** Part of the Business Knowledge.  

### Official Name: Brand Voice
**Definition:** The explicit guidelines dictating the personality, tone, vocabulary, and stylistic boundaries of the content.  
**Purpose:** To maintain a consistent organizational identity across all generated content.  
**Allowed Synonyms:** Voice.  
**Forbidden Terms:** Tone of Voice (ToV), Style Guide.  
**Notes:** Part of the Business Knowledge.  

### Official Name: Content Pillar
**Definition:** A core thematic category or primary topic that supports the broader Content Strategy.  
**Purpose:** To ensure all generated content aligns with the key subjects the brand needs to be authoritative in.  
**Allowed Synonyms:** Pillar.  
**Forbidden Terms:** Topic, Category, Bucket.  
**Notes:** Used to categorize and structure content pipelines.  

---

## Naming Rules

- **One concept = one official term:** Do not use multiple terms for the same concept.
- **Avoid inventing new terminology:** Use established terminology unless a new concept explicitly requires it.
- **Do not rename concepts across documents:** The terminology defined here applies globally to the entire repository.
- **Prefer explicit wording over marketing language:** Clarity always overrides "cleverness."
- **Avoid buzzwords:** Terms like "revolutionary," "smart," or "AI-powered" are strictly forbidden in official naming conventions.

---

## Writing Rules

- **Prefer concise definitions:** Keep definitions to 2–4 sentences. Be direct.
- **Use the same capitalization everywhere:** Official terms must be Title Cased (e.g., Business Knowledge, Content Decisions) to signify their official status.
- **Avoid AI buzzwords:** Focus on the structural and business utility of the framework, not the novelty of the technology.
- **Prefer business language over technical jargon:** The framework targets Content Directors and Strategists; speak their language.
- **Keep terminology implementation-agnostic:** Terminology must remain valid regardless of which specific LLM, software, or UI is being used to execute the framework.

---

## Future Expansion Policy

As ContentCompiler evolves, new terminology may be introduced under the following strict conditions:

- **New terms require justification:** Contributors must explicitly prove that an existing term cannot adequately describe the new concept.
- **Existing terms should never be duplicated:** Do not introduce synonyms or overlapping terms. 
- **Prefer extending existing concepts over creating new ones:** For example, introduce a specific type of Component, Content Package, or Contract rather than creating an entirely new architectural concept.
- **Terminology changes require project-wide updates:** If a term is modified or added to this contract, all relevant documentation in the repository must be refactored to reflect the change before approval.
