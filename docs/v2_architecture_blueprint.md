# ContentCompiler v2.0
## Master Architecture Document — The Constitution

*The single, complete architectural source of truth for ContentCompiler: what it is, why every decision was made, how every subsystem works, and how the platform evolves.*

---

## Preface

This document is the highest-level architectural artifact in the ContentCompiler repository. It exists so that any engineer, designer, AI agent, or contributor can understand the entire system — its purpose, its structure, and the reasoning behind every structural choice — without needing tribal knowledge, meeting history, or access to the original architects.

This is not a summary. It is the complete specification. Every subsystem described here is internally consistent with every other subsystem, and every major decision is justified, not merely stated. If a future change contradicts this document, the document is updated first — the code follows the architecture, never the reverse.

ContentCompiler is not a script generator, a prompt library, a chatbot wrapper, or a workflow automation tool. It is an **AI-first Content Operating System**: a persistent, visual, extensible environment in which a company's entire content lifecycle — research, strategy, ideation, production, publishing, and analysis — lives, evolves, and remembers itself over time.

---

## 1. Vision

Every company that produces content today does so through a fragmented stack of disconnected tools: a notes app for brand knowledge, a spreadsheet for content calendars, a chat window for AI drafts, a folder of loose media files, and a publishing tool bolted on at the end. None of these tools know about each other. Nothing remembers why a decision was made. Nothing learns from what worked.

ContentCompiler exists to replace that fragmentation with a single, coherent operating system — one that treats content the way modern IDEs treat code, the way Figma treats design, and the way Linear treats project execution: as a first-class, structured, versioned, collaborative object, not a pile of files.

In ten years, ContentCompiler is the default place any team goes to think about, produce, and ship content — not because it does any single task better than a specialized tool, but because it is the only place where research, brand knowledge, strategy, production, and publishing are the same system, continuously informing each other, with an AI agent workforce embedded at every layer and a human always in control of the final word.

---

## 2. Core Philosophy

ContentCompiler is governed by a small number of non-negotiable beliefs. Every architectural decision in this document is a direct consequence of one or more of these.

### 2.1 Vision Philosophy
The product is judged by what it enables a team to become capable of over a year, not what it can generate in a single session. Every feature is evaluated against the question: *does this compound?*

### 2.2 Core Philosophy
ContentCompiler is a system of record first and a generation tool second. Generation is a feature of the system; being the durable home for a company's content operations is the product.

### 2.3 Design Principles
Interfaces are direct-manipulation environments, not forms. Every object in the system — a project, an asset, an idea, a job — is something you can see, click, drag, inspect, and version, in the spirit of Figma's canvas and Linear's issue graph.

### 2.4 Product Principles
The product ships opinionated defaults and open extensibility simultaneously. A new user gets a fully working system in minutes via Blueprints; a power user can rebuild any part of it via Plugins and the SDK ecosystem.

### 2.5 Architecture Principles
Strict layering is non-negotiable: Presentation calls Application, Application orchestrates Domain and the Execution Kernel, Domain never depends outward, and Infrastructure is swappable behind interfaces owned by the layers above it. No layer is permitted to reach two levels down.

### 2.6 Technical Principles
Local-first, typed, and event-sourced. Every mutation is a recorded event before it is a database row. Every module is independently testable because the Domain layer has zero framework dependencies.

### 2.7 User Experience Principles
Speed and reversibility over confirmation dialogs. Every destructive or AI-generated action is undoable via the Memory Timeline, so the UI can move fast without asking permission at every step — permission is asked once, structurally, through Human-in-the-loop checkpoints, not repeatedly through modals.

### 2.8 AI Principles
Agents propose; humans dispose. No agent is permitted to take an irreversible action (publish, delete, send) without passing through a Human Review checkpoint, unless a user has explicitly configured autonomous trust for that specific action class within a specific Project.

### 2.9 Desktop-first Philosophy
ContentCompiler ships first as a native-feeling desktop application because content operations require sustained, focused, multi-hour work — the opposite of the shallow-session model browser tabs encourage. Desktop-first also enables full offline capability and local model execution.

### 2.10 Offline-first Strategy
The application is fully functional without network access for all core operations: browsing Projects, editing Knowledge, drafting Assets, reviewing Memory. Only Provider calls (LLM inference), Marketplace access, and Cloud Sync require connectivity, and each degrades gracefully — queued, not blocking.

### 2.11 Cloud Synchronization Strategy
Local SQLite and vector storage remain the source of truth on-device. Cloud Sync is an optional, encrypted, eventually-consistent replication layer for cross-device continuity and team collaboration — never a required dependency for single-user operation.

### 2.12 API-first Philosophy
Every capability exposed in the UI exists first as an internal API call through the Application Layer. There is no code path where the UI mutates state directly. This guarantees Desktop, Web, CLI, Mobile, and Cloud surfaces can all be built on the exact same logic without duplication.

### 2.13 Plugin-first Philosophy
Anything that could reasonably be core functionality is instead built as a first-party plugin running on the same Plugin SDK available to third parties. This forces the platform's extension points to be genuinely sufficient, rather than aspirational.

### 2.14 Workspace-first Philosophy
The unit of daily use is not a "page" but a Workspace — a purpose-built environment (Research, Strategy, Production, Publishing) with its own layout, tools, and data views, all scoped to the active Project.

### 2.15 Project-first Philosophy
Nothing exists outside a Project. Every Asset, every Job, every piece of Knowledge, every Memory entry belongs to exactly one Project. This single ownership rule is what makes multi-tenant isolation, cost tracking, and context assembly tractable.

### 2.16 Memory-first Philosophy
Nothing is silently forgotten and nothing is silently overwritten. Every meaningful state change is captured in the Memory Timeline as an immutable event, making the system's entire history inspectable and reconstructable at any point.

### 2.17 Human-in-the-loop Philosophy
AI output is a draft until a human — or an explicitly trusted automation rule — accepts it. Review is a first-class state in every Agent's pipeline, not an afterthought bolted onto the UI.

### 2.18 Observability Philosophy
If the system did something, the system can show you exactly what it did, in what order, at what cost, and why. Observability is not a debugging feature; it is how trust in autonomous agents is earned.

### 2.19 Security Philosophy
Least privilege by default at every boundary: Plugins are sandboxed and permissioned, Agents can only touch the Application Layer surfaces they are explicitly granted, and credentials are never accessible to generated code or agent context.

### 2.20 Scalability Philosophy
The architecture scales along two independent axes without redesign: more Projects per user/team (horizontal), and deeper capability per Project — more Agents, more Plugins, more automations (vertical). Neither axis is allowed to degrade the other.


---

## 3. Architectural Decision Records

Architecture is not just a set of rules — it is a set of choices made among real alternatives, for real reasons. This section documents the decisions that shape everything else in this document, in the standard form: Context, Decision, Alternatives Considered, Tradeoffs, and Why Rejected Alternatives Were Rejected. Every future architectural decision of comparable weight must be recorded here using this same form; this section is a living ledger, not a historical artifact.

### ADR-001: Strict Layered Architecture (Presentation → Application → Domain)
- **Context:** The system needs to support four eventual surfaces (Desktop, Web, CLI, Mobile) without duplicating business logic, while keeping business rules testable in isolation.
- **Decision:** Enforce one-directional dependency flow — Presentation depends on Application, Application depends on Domain and orchestrates the Execution Kernel, Domain depends on nothing outward.
- **Alternatives Considered:** (a) A conventional MVC structure where the UI talks to the database directly for reads; (b) a "fat model" approach where Domain objects call out to infrastructure themselves.
- **Tradeoffs:** Strict layering adds indirection for simple operations — even a trivial read must pass through a Query object rather than a direct database call.
- **Why Rejected Alternatives Were Rejected:** MVC-with-direct-reads couples the UI to storage schema, making a future Web or Mobile client require re-implementing every read pattern. Fat models blur where business rules end and infrastructure begins, which historically produces Domain code that cannot be unit tested without a database connection — precisely the failure mode this architecture is designed to prevent.

### ADR-002: Event Sourcing for the Memory Timeline
- **Context:** The Memory-first Philosophy (2.16) requires that nothing be silently forgotten, and the product requires undo, audit, and Agent context assembly from history.
- **Decision:** Every Command that mutates state produces one or more immutable Events as its canonical output; all read-side state (SQLite projections, Search Index) is derived from the Event Store and can be rebuilt from it.
- **Alternatives Considered:** (a) Traditional CRUD with a separate, hand-maintained audit log table; (b) periodic snapshotting without a full event history.
- **Tradeoffs:** Event sourcing increases storage volume over time and requires the Snapshot mechanism (Section 22) to keep replay-based reconstruction fast; it also requires strict Event schema versioning discipline.
- **Why Rejected Alternatives Were Rejected:** A hand-maintained audit log drifts from the actual state over time because it is a second, independently-written artifact rather than the source of truth itself — this is precisely the class of bug event sourcing eliminates by construction. Snapshot-only history cannot answer "what exactly happened between these two points," which the Activity Center and Agent context assembly both require.

### ADR-003: Execution Kernel Isolated from Product Concepts
- **Context:** Background execution (Agent runs, Plugin actions) must scale independently from product logic and must be swappable (e.g., to a remote worker pool) without touching Application Layer code.
- **Decision:** The Execution Kernel knows only about Jobs, Workers, Queues, and Events — never about Projects, Knowledge, or Assets, which are Application Layer / Domain concepts.
- **Alternatives Considered:** A single unified "backend" module where scheduling and business logic are interleaved for simplicity.
- **Tradeoffs:** Kernel ignorance of product concepts means every piece of product context an Agent needs must be explicitly assembled and passed in by the Application Layer at Job-dispatch time, rather than looked up ambiently by the Kernel.
- **Why Rejected Alternatives Were Rejected:** A unified backend makes horizontal scaling of execution capacity require also scaling and redeploying product logic, and makes the Kernel untestable without a full product database — both directly contradict the Scalability Philosophy (2.20) and Technical Principles (2.6).

### ADR-004: Local-First Storage with Optional Cloud Sync
- **Context:** Desktop-first (2.9) and Offline-first (2.10) philosophies require the product to be fully functional without network access.
- **Decision:** SQLite and the local vector store are the canonical source of truth on-device; Cloud Sync is an optional, additive replication layer.
- **Alternatives Considered:** A cloud-backend-required architecture with local caching, common in SaaS products.
- **Tradeoffs:** Local-first requires solving conflict resolution (Section 25.8) for multi-device and multi-user scenarios explicitly, rather than getting strong consistency for free from a single server of record.
- **Why Rejected Alternatives Were Rejected:** A cloud-required backend breaks Offline-first entirely and reintroduces the exact latency and availability dependency the Desktop-first Philosophy was adopted to avoid; content work is frequently done in low-connectivity conditions (travel, on-site shoots) where this would be unacceptable.

### ADR-005: Plugins and First-Party Integrations Share One SDK
- **Context:** Historically, platforms that give first-party code privileged internal APIs end up with third-party extension points that are perpetually insufficient, because the privileged path never gets pressure-tested by an external developer.
- **Decision:** All integrations — including those ContentCompiler ships itself — are built as Plugins on the public Plugin SDK (Section 17), with no private fast path.
- **Alternatives Considered:** A tiered model where first-party integrations get direct Application Layer access for performance, and third parties get a more limited public SDK.
- **Tradeoffs:** This constrains first-party integration performance to whatever the public SDK can support, and forces SDK completeness to be solved before any integration — including day-one ones — can ship.
- **Why Rejected Alternatives Were Rejected:** A tiered model guarantees the public SDK is permanently behind what the product is actually capable of, undermining the Plugin-first Philosophy (2.13) and eventually forcing a breaking SDK redesign once third parties demand parity with first-party capability.

### ADR-006: Agents Interact Only Through the Application Layer
- **Context:** Autonomous AI agents are the highest-risk actors in the system in terms of unpredictable or unreviewed side effects.
- **Decision:** Agents issue Commands through the identical Application Layer contract a human user's UI action would issue — there is no Agent-specific write path into the Domain or Infrastructure.
- **Alternatives Considered:** A specialized "Agent Runtime API" with broader, faster access to Domain objects for performance.
- **Tradeoffs:** Every Agent action is subject to the same validation, authorization, and event-emission overhead as a human action, which is measurable but small compared to LLM inference latency.
- **Why Rejected Alternatives Were Rejected:** A specialized Agent API would create a second, less-audited mutation path exactly where the AI Principles (2.8) and Security Philosophy (2.19) demand the *most* scrutiny, not the least — this was judged an unacceptable risk regardless of the performance upside.

### ADR-007: CQRS Split Between Commands/Queries
- **Context:** Timeline, Search, and dashboard reads need to be fast and denormalized; writes need to be strictly validated against Domain invariants.
- **Decision:** Commands and Queries are structurally separate paths (Section 10.4 already establishes this); Query projections are rebuildable from the Event Store and never treated as canonical.
- **Alternatives Considered:** A single unified repository pattern serving both reads and writes against the same normalized schema.
- **Tradeoffs:** Projections must be kept in sync with the Event Store, requiring an explicit projection-rebuild mechanism (Section 22) and eventual consistency windows between a Command committing and its Query projection updating.
- **Why Rejected Alternatives Were Rejected:** A unified repository forces every read to pay the cost of the normalized write schema, which does not scale to Global Search or Timeline rendering across years of Project history — this was measured as the dominant cost in early prototyping and rejected on performance grounds alone.


---

## 4. System Architecture Overview

ContentCompiler is composed of five strictly layered systems. Each layer has exactly one reason to change.

### 4.1 Presentation Layer
The visual workspace: Workbench, Command Palette, Inspector panels, Node Editors, Dashboards. This layer renders state and captures intent. It contains no business logic and never talks to the Domain or Execution Kernel directly — every action is dispatched as a Command or Query to the Application Layer.

### 4.2 Application Layer
The orchestrator. It exclusively owns Use Cases, Commands, Queries, Transactions, Job Dispatching, Orchestration, and State Coordination. This is the only layer permitted to coordinate across Domain and Execution Kernel boundaries. Agents interface with the system exclusively through this layer — an agent never manipulates the Domain directly, and never touches Infrastructure directly.

### 4.3 Domain Layer
Pure, framework-agnostic business rules: entities, value objects, validators, invariants. This layer has zero knowledge of databases, UI frameworks, or LLM providers. It can be unit-tested in isolation and reused unmodified across Desktop, Web, or CLI surfaces.

### 4.4 Execution Kernel
Background infrastructure responsible for Job scheduling, executing Agents, running internal Pipelines, and managing queues, retries, and provider communication. The Kernel knows nothing about Projects, Knowledge, or product concepts — it only knows Jobs, Events, and Workers. This separation is what allows the Kernel to be swapped, scaled, or run remotely without touching product logic.

### 4.5 Providers & Plugins (Infrastructure Layer)
The extensible integration boundary: LLM providers, third-party services, and Plugins that extend the product surface itself. Infrastructure implements interfaces defined by the layers above it — the Domain and Application layers never depend on a specific provider or plugin implementation.

### 4.6 The Governing Rule
Dependencies point in one direction only: Presentation → Application → Domain, with Execution Kernel and Infrastructure invoked *by* the Application Layer and never the reverse. No layer skips a level. This single rule is what keeps the system comprehensible at scale, and is enforced mechanically — see Section 5, Dependency Rules.

---

## 5. Dependency Rules

Layering (Section 4) states the shape of the architecture. This section states, exhaustively, what is and is not allowed to depend on what, so the rule is enforceable rather than aspirational.

### 5.1 Allowed Dependencies
- Presentation → Application (via Commands/Queries only)
- Application → Domain (direct use of entities, value objects, validators)
- Application → Execution Kernel (Job dispatch only, never direct Worker manipulation)
- Application → Infrastructure interfaces (Provider Router interface, Plugin Registry interface, Event Store interface — never concrete implementations)
- Execution Kernel → Infrastructure (Provider SDKs, Plugin sandboxes — the Kernel is where concrete infrastructure is actually invoked)
- Infrastructure → Domain (to translate between external formats and Domain types, one direction only: infrastructure adapts to the Domain, not the reverse)
- Any layer → Cross-Cutting Concerns (Section 26) (logging, tracing, configuration — these are horizontal, not part of the vertical stack)

### 5.2 Forbidden Dependencies
- Presentation → Domain (direct). The UI must never import a Domain entity and construct or mutate it directly — this bypasses validation and event emission.
- Presentation → Infrastructure (direct). The UI never calls a Provider SDK, a Plugin, or the Event Store directly.
- Domain → Application. Domain code must never import anything from the Application Layer; this would invert the dependency direction and make Domain logic untestable without an Application context.
- Domain → Infrastructure. Domain code must never import a database driver, an HTTP client, or an LLM SDK.
- Execution Kernel → Domain. The Kernel operates on opaque Job payloads; it does not know what a "Knowledge" or "Asset" is, and must not import Domain types.
- Execution Kernel → Application. The Kernel never calls back into Application Use Cases directly; results flow back only as Events that the Application Layer subscribes to.
- Plugin → Domain or Application (direct). Plugins interact exclusively through the Plugin SDK's own contract, which is itself a thin client over the Application Layer's public API — never a direct import of internal packages.

### 5.3 Dependency Matrix

| From \ To | Presentation | Application | Domain | Execution Kernel | Infrastructure |
|---|---|---|---|---|---|
| Presentation | — | ✅ (Commands/Queries) | ❌ | ❌ | ❌ |
| Application | ❌ | — | ✅ | ✅ (dispatch only) | ✅ (interfaces only) |
| Domain | ❌ | ❌ | — | ❌ | ❌ |
| Execution Kernel | ❌ | ❌ (Events only, async) | ❌ | — | ✅ |
| Infrastructure | ❌ | ❌ | ✅ (adapters only) | ❌ | — |

### 5.4 Anti-Patterns Explicitly Rejected
- **The "Just This Once" Shortcut** — a UI component calling a repository directly "because it's just a simple read." This is how layering erodes; the rule has zero exceptions, including for reads.
- **The God Use Case** — a single Use Case that reaches into five unrelated Domain aggregates and three Infrastructure services. Use Cases must be narrow; broader behavior is composed at the Presentation Layer from multiple narrow Use Cases, not built as one sprawling one.
- **The Leaky Plugin** — a Plugin that discovers it can reach Application internals through a shared in-process module rather than the sandboxed SDK boundary. This is treated as a security defect, not a convenience, the moment it is discovered.
- **The Kernel That Knows Too Much** — adding a special case to the Execution Kernel for one specific Agent's needs. Any Job-level behavior that requires product knowledge belongs in the Application Layer's context assembly before dispatch, never inside the Kernel.

---

## 6. Package Boundaries

Every package in the monorepo has one owner concern, a defined public surface, and explicit dependencies. This section is the contract each package must honor.

### 6.1 `apps/desktop`
- **Responsibilities:** Native shell, window management, rendering the Presentation Layer.
- **Public API:** None — this is a leaf application, not a library other packages depend on.
- **Internal API:** Workbench, Workspace shells, Panel mounting.
- **Dependencies:** `application`, `design-system`, `ui-components`, `icons`.
- **Extension Points:** Plugin UI Panel mounting, Theme registration.
- **Ownership:** Desktop/Platform team.

### 6.2 `packages/design-system`
- **Responsibilities:** Tokens, themes, animation primitives, Light/Dark mode definitions.
- **Public API:** Token exports, theme provider, motion primitives.
- **Internal API:** Theme resolution and inheritance engine.
- **Dependencies:** None (leaf package with zero internal dependencies, by design).
- **Extension Points:** Plugin theme contribution (Section 18).
- **Ownership:** Design Systems team.

### 6.3 `packages/ui-components`
- **Responsibilities:** Reusable, unstyled-logic-plus-styled-presentation UI primitives (buttons, panels, dockable layout, tables, diff viewers).
- **Public API:** Component library.
- **Internal API:** Layout engine internals (Section 20.6).
- **Dependencies:** `design-system`.
- **Extension Points:** None directly — Plugins consume this indirectly through the Workspace SDK, never by importing it.
- **Ownership:** Design Systems team.

### 6.4 `packages/icons`
- **Responsibilities:** Custom iconography as a versioned, tree-shakeable asset package.
- **Public API:** Icon component exports.
- **Dependencies:** None.
- **Ownership:** Design Systems team.

### 6.5 `packages/application`
- **Responsibilities:** Commands, Queries, Use Cases, authorization, transaction boundaries (Section 10).
- **Public API:** The versioned internal API contract consumed by every Presentation surface and by the Plugin SDK.
- **Internal API:** Use Case composition helpers, DI container wiring.
- **Dependencies:** `core` (Domain), interfaces for `execution-kernel`, `plugin-engine`, and storage (never concrete implementations).
- **Extension Points:** New Use Cases; Plugin-registered Commands surface here as thin adapters.
- **Ownership:** Platform/Core team.

### 6.6 `packages/core` (Domain)
- **Responsibilities:** Entities, value objects, validators, domain invariants (Section 8).
- **Public API:** Domain types and validation functions.
- **Dependencies:** None — this is the most tightly constrained package in the repository.
- **Extension Points:** None; the Domain model changes only through direct engineering work reviewed against this document, never through runtime extension.
- **Ownership:** Platform/Core team.

### 6.7 `packages/execution-kernel`
- **Responsibilities:** Job Scheduling, Queue, Worker pool, Event Bus (Section 12/21).
- **Public API:** Job dispatch interface, Event subscription interface.
- **Internal API:** Scheduler, Worker lifecycle management, retry/backoff policy.
- **Dependencies:** `agent-engine` (to execute Pipelines), Infrastructure interfaces for Provider access.
- **Extension Points:** New Job types.
- **Ownership:** Execution/Infra team.

### 6.8 `packages/agent-engine`
- **Responsibilities:** Base Agent contract (Section 16), internal Pipelines.
- **Public API:** Agent registration interface, Pipeline definition format.
- **Dependencies:** `core`, Infrastructure interfaces for the Provider Router.
- **Extension Points:** New Agents, following the generic Agent Framework contract.
- **Ownership:** AI/Agents team.

### 6.9 `packages/plugin-engine`
- **Responsibilities:** Plugin interfaces, sandboxing, MCP Registry (Section 17).
- **Public API:** Plugin SDK.
- **Internal API:** Sandbox process/permission enforcement.
- **Dependencies:** `application` (interfaces only, for the Command surface Plugins are allowed to call).
- **Extension Points:** This package *is* the extension point for the rest of the platform.
- **Ownership:** Platform/Extensibility team.

### 6.10 `plugins/core-plugins`
- **Responsibilities:** First-party Plugins (publishing platform integrations, analytics sources) built on the public Plugin SDK, per ADR-005.
- **Dependencies:** `sdks/plugin-sdk` only — explicitly forbidden from importing `application` or `core` directly, to keep first-party Plugins honest test cases for the SDK.
- **Ownership:** Integrations team.

### 6.11 `blueprints/core-blueprints`
- **Responsibilities:** First-party Blueprint definitions (Section 18).
- **Dependencies:** Blueprint manifest schema only.
- **Ownership:** Product/Content team.

### 6.12 `sdks/plugin-sdk`, `sdks/mcp-sdk`
- **Responsibilities:** The public, versioned client libraries third parties (and first-party Plugins) build against.
- **Public API:** The entirety of what a Plugin author can use.
- **Dependencies:** None beyond the wire contract for the Application Layer's public API.
- **Ownership:** Platform/Extensibility team, with a public changelog and deprecation policy (Section 9.6).


---

## 7. Product Architecture: The Domain Model

Every concept in ContentCompiler is one of the following first-class objects. Nothing exists that isn't one of these, or a relationship between them.

### 7.1 Project — The Root Entity
The Project is the universe boundary. Every Asset, every piece of Knowledge, every Job, every Memory entry, every Agent run belongs to exactly one Project. A Project represents one brand, client, or initiative. Cross-Project references do not exist at the data layer — if two Projects need to share something, it happens through an explicit export/import or a shared Blueprint, never through implicit coupling.

### 7.2 Organization, Team, and Permissions
An Organization contains Members and one or more Projects. Roles (Owner, Admin, Editor, Reviewer, Viewer) are assigned at the Organization level and can be scoped down to individual Projects. Permissions are additive and explicit: a Member has no capability by default until a Role grants it. Invitations create pending Members with no access until accepted. All permission changes are recorded in the Audit Log, which is itself a projection of the Memory Timeline scoped to identity and access events.

### 7.3 Knowledge
The persistent understanding ContentCompiler has of a Project: Brand Identity (voice, values, visual identity, positioning), Audience Personas, and Competitor Profiles. Knowledge is not a document — it is structured, queryable data that every Agent consults before producing output. Knowledge evolves through direct human edits and through Agent proposals that pass Human Review before being committed.

### 7.4 Asset, Artifact & AssetGraph
An **Asset** (formally referred to at the platform level as an **Artifact**) is any produced or reusable unit of media, prompt, or template: a video, a script, a hook, a voice profile, a brand logo, a prompt graph. Assets are connected through the AssetGraph — a relationship layer tracking exactly which Assets were derived from, referenced by, or composed into which other Assets. This graph is what makes "where did this hook come from" and "what would break if I change this logo" answerable questions rather than tribal knowledge.

### 7.5 Blueprint
A reusable, installable business package: a complete starting configuration bundling Knowledge templates, Workspace layouts, Agent configurations, and starter Assets for a specific business type (Restaurant, Real Estate, Agency). Installing a Blueprint into a new Project is the fastest path from zero to a working content operation.

### 7.6 Pipeline
An internal directed acyclic graph representing how a single Agent reasons through a task — for example, Research's Query → Scrape → Filter → Summarize sequence. Pipelines are strictly internal to Agent execution. They are never exposed to end users as something to build; that is the distinct role of the Automation Engine (Section 19).

### 7.7 Job
The unit of work the Execution Kernel schedules and runs. Every Agent invocation, every Pipeline execution, every background task is a Job. Jobs have a lifecycle (Queued → Running → Paused → Completed/Failed/Cancelled), a Project scope, an initiating actor (human or automation rule), and a full Event trace.

### 7.8 Memory Timeline
An append-only, versioned record of every meaningful change in a Project: Knowledge edits, Asset creations, Agent decisions, Human Review outcomes, permission changes. The Memory Timeline is the mechanism behind undo, audit, context assembly for Agents, and the Activity Center. Nothing in ContentCompiler is truly deleted — it is superseded, and the prior state remains reachable in the Timeline.

### 7.9 Workspace
A purpose-built environment scoped to a Project's active lifecycle stage — Research, Strategy, Production, Publishing, Analytics — each with its own layout, tools, and views. Workspaces are how the Workspace-first philosophy (2.14) becomes concrete: a user doesn't navigate "pages," they move between Workspaces.

### 7.10 Automation
A user-composed logic flow using visual `When → If → Then` primitives, distinct from an Agent's internal Pipeline. Automations are the user-facing equivalent of a Pipeline: they trigger Agents, chain their outputs, and connect to external Plugin actions, but they are visible, editable, and owned by the user rather than hidden inside an Agent's reasoning. See Section 19 for the full Automation Engine specification.

### 7.11 Domain Invariants
Every Domain entity enforces its own invariants regardless of caller — these are not UI-layer validation rules that can be bypassed by a different entry point. Representative invariants: a Project cannot be deleted while it has Members other than its Owner; an Asset version cannot be edited in place, only superseded; a Job cannot transition from `Completed` back to `Running`; a Knowledge diff cannot be committed without a recorded proposing actor. Invariant violations raise Domain Errors (Section 27.3) and are rejected before any Event is produced.

### 7.12 Revision
A **Revision** is a proposed change to an Artifact or Knowledge entity. It is the formal Domain abstraction representing what users commonly call a "draft." Every Revision is subject to the Human-in-the-loop Review Model (Section 12.12) before being committed to the canonical state.

---

## 8. The Application Layer

The Application Layer is the sole coordinator between what the user (or an Agent) wants to happen and what the Domain and Execution Kernel actually do about it. Nothing outside this layer is permitted to mutate Project state.

### 8.1 Commands
Commands represent an intent to change state: `CreateProject`, `UpdateKnowledge`, `ApproveRevision`, `InstallBlueprint`. Every Command is validated against Domain invariants before execution, is authorized against the caller's Role and Permissions, and produces one or more Events on success. Commands are the only entry point for mutation — the UI, Agents, Plugins, and Automations all express intent as Commands, never as direct writes.

### 8.2 Queries
Queries represent a read: `GetProjectTimeline`, `ListAssetsByTag`, `SearchKnowledge`. Queries are read-optimized and may be served from denormalized projections rather than the canonical Event Store, since they never mutate state and can be rebuilt from it at any time.

### 8.3 Use Cases
A Use Case composes one or more Commands and Queries into a coherent user-facing operation — for example, "Approve a script draft" is a Use Case that queries the pending draft (Revision), validates reviewer permission, executes the `ApproveRevision` Command, and triggers the downstream Automation check. Use Cases are where product behavior lives; Commands and Queries remain narrow and composable.

### 8.4 CQRS as a Structural Choice
Command and Query responsibility are separated deliberately, not as an optimization detail (see ADR-007). Write paths go through strict Domain validation and produce Events. Read paths are denormalized projections tuned for the UI's actual access patterns (timelines, graphs, search). This is what lets the Presentation Layer stay fast even as the underlying Event Store grows into the millions of records per Project.

### 8.5 Transactions and Consistency
A single Command executes within one transactional boundary against the Domain and Event Store. Anything requiring multiple steps across systems — for instance, "approve a draft, then dispatch a publishing Job" — is expressed as a Use Case that commits the first transaction, then dispatches a Job as a *separate*, independently-retryable unit of work. The Application Layer never holds a transaction open across a network or Kernel boundary.

### 8.6 Job Dispatching
When a Use Case needs background or AI work, the Application Layer dispatches a Job to the Execution Kernel and returns immediately. The Kernel owns everything about how that Job actually runs; the Application Layer's responsibility ends at "this Job now exists and is queued," and resumes when the Kernel emits completion Events back into the Event Store.

### 8.7 Internal APIs
Every Command, Query, and Use Case is exposed as a versioned internal API contract. Desktop UI, a future Web client, a CLI, and Plugins all call the identical contract. This is the mechanical enforcement of the API-first Philosophy (2.12): there is no privileged internal shortcut available to first-party code that isn't equally available to a third-party Plugin.

### 8.8 Validation and Authorization
Validation (is this input structurally and semantically valid?) is a Domain concern invoked by the Application Layer. Authorization (is this actor allowed to do this, to this Project?) is an Application Layer concern evaluated before any Domain logic runs, using the Organization/Team/Permissions model from Section 7.2. A Command that fails authorization never reaches the Domain layer at all.

### 8.9 Dependency Injection
The Application Layer depends on interfaces, not implementations, for everything infrastructural: the Event Store, the Provider Router, the Plugin Registry. Concrete implementations are wired in at application startup. This is what allows the same Application Layer code to run against local SQLite in the Desktop app and, eventually, a cloud-hosted store, without a single Use Case changing.

---

## 9. API Design Principles

This section governs the shape of every Command, Query, Event, and DTO in the system — first-party and Plugin-facing alike, since both are the same contract (ADR-005).

### 9.1 Commands
A Command is a named, versioned, immutable request to change state, carrying exactly the fields required to perform that change and the identity of the actor issuing it. Commands are never partial — a Command either fully succeeds (producing Events) or fully fails (producing a typed Error), never leaving a partially-applied state.

### 9.2 Queries
A Query is a named, versioned, side-effect-free request for data, returning a DTO shaped for its specific caller need rather than a raw Domain entity dump. Queries never expose internal Domain object references — only serializable DTOs.

### 9.3 Events
An Event is an immutable, past-tense fact: `AssetApproved`, `KnowledgeDiffProposed`, `JobCompleted`. Events carry a schema version, a Trace ID, a Project scope, a timestamp, and a payload. Events are the only mechanism by which the Application Layer, Execution Kernel, and subscribers communicate asynchronously — see Section 24 for the full Event-Driven Architecture.

### 9.4 DTOs and Contracts
Data Transfer Objects are the only shape that crosses a layer or process boundary. A DTO is a plain, versioned, serializable structure with no behavior — Domain entities never cross the Application Layer's public boundary directly. Every DTO has an explicit contract test (Section 30.3) verifying it hasn't silently changed shape.

### 9.5 Versioning and Compatibility
Commands, Queries, Events, and DTOs are independently versioned. A new field is always additive and optional by default; a breaking change requires a new major version published alongside the old one, with the old version supported for a minimum deprecation window before removal — this window is published in the SDK changelog (Section 6.12) so third-party Plugin authors have a guaranteed runway.

### 9.6 Pagination
Every Query returning a collection is paginated by default using cursor-based pagination, not offset-based — offsets silently produce incorrect results against a live, append-only Event-sourced system as new Events arrive mid-pagination.

### 9.7 Streaming
Queries and Job results that are inherently incremental (LLM token streams, live Execution Graph updates) are exposed as typed Event streams rather than polled — the same Event Bus subscription mechanism used for all Job observability (Section 12.6, Section 24).

### 9.8 Validation
Every Command payload is validated at two levels: structural validation (types, required fields) at the API boundary before the Command is even constructed, and semantic validation (Domain invariants) inside the Domain layer itself. A Command that fails structural validation never reaches authorization or Domain logic.

### 9.9 Authentication and Authorization
Every API call — from the Desktop UI, a Plugin, or a future Web/CLI/Mobile client — carries an authenticated actor identity. Authorization is evaluated per-Command and per-Query against that actor's Role and Permissions (Section 7.2) and, for Plugins, against the Plugin's own granted permission scopes (Section 17.4) — a Plugin acting on behalf of a user is still bound by the tighter of the two.

### 9.10 Idempotency
Every Command carries an idempotency key. Re-submitting the same Command with the same key (for example, after a client-side retry following a network timeout) is guaranteed not to produce duplicate Events — the Application Layer detects the repeat and returns the original result. This is what makes Kernel-level retries (Section 12.4) and offline-sync replay (Section 25.7) safe by construction rather than by convention.


---

## 10. Execution Architecture: The Execution Kernel

The Execution Kernel is infrastructure, not product. It knows about Jobs, Workers, Queues, and Events — nothing about Projects, Knowledge, or Assets (ADR-003). This ignorance is deliberate: it is what makes the Kernel independently scalable and testable.

### 10.1 Job Queue & Scheduler
Every Job enters a durable queue with a priority, a Project scope, and a declared resource budget (token ceiling, time ceiling, cost ceiling). The Scheduler assigns Jobs to Workers based on priority, current concurrency limits, and per-Project fairness — no single Project's automation storm can starve another Project's interactive request.

### 10.2 Job Classes
Jobs are scheduled differently depending on class:
- **Interactive Jobs** — user is actively waiting (e.g., "regenerate this hook now"); highest scheduling priority, tightest timeout, always foreground.
- **Foreground Jobs** — initiated by a direct user action but not blocking the UI (e.g., "generate 10 ideas"); high priority, progress-visible.
- **Background Jobs** — scheduled or automation-triggered (e.g., nightly Analytics sync); lowest priority, longest allowable timeout, run opportunistically against idle capacity.
- **Batch Jobs** — a set of related Jobs dispatched together (e.g., generating a week's worth of scripts); scheduled as a group with shared budget accounting and independent per-item retry.
- **Long-Running Jobs** — Jobs whose Pipeline may span minutes to hours (large research sweeps, multi-asset video renders); these checkpoint state at each Pipeline step so they are pausable and resumable without re-running completed work.

### 10.3 Worker Lifecycle
A Worker moves through: Idle → Claimed (assigned a Job) → Executing (running Pipeline steps) → Reporting (emitting completion Events) → Idle. Workers are stateless between Jobs by contract — all state a Job needs is loaded from the Event Store and Knowledge at Job start, and all state produced is emitted as Events at Job completion. This statelessness is what makes Workers horizontally scalable and safely restartable.

### 10.4 Concurrency and Priority
The Kernel enforces both a global concurrency ceiling (total simultaneous Jobs across the system) and a per-Project ceiling (preventing one Project from consuming the entire Worker pool). Within those ceilings, priority is resolved first by Job class (10.2), then by declared urgency, then by queue arrival order (FIFO within a priority tier).

### 10.5 Cancellation, Pause, and Resume
Jobs can be cancelled by the user at any point, paused for Human Review, and resumed later from the exact paused state — because the Job's state is reconstructable entirely from its Event history, not from in-memory Worker state. A paused Job releases its Worker back to the pool immediately; it does not hold execution capacity while waiting on a human.

### 10.6 Retries and State Recovery
Every Job step is idempotent by contract (Section 9.10), which allows the Kernel to retry a failed step without re-running successful prior steps. If a Worker crashes mid-Job, the Job is not lost: on restart, the Kernel replays the Job's Events to reconstruct its last known state and resumes from there. This makes crash recovery a property of the Event-sourced design (ADR-002) rather than a special-cased recovery script. Retry policy follows exponential backoff with a maximum attempt ceiling declared per Job type; exhausting retries transitions the Job to `Failed` with its full trace preserved, never a silent drop.

### 10.7 Streaming
When a Job requires LLM inference, the Worker calls the Intelligent Provider Router rather than a specific provider SDK directly. Streaming tokens are relayed back through the Event Bus in real time, which is how the UI's Observability suite shows a Pipeline "thinking" live rather than only showing a final result.

### 10.8 Health, Timeouts, and Diagnostics
The Kernel continuously tracks provider health (latency, error rate) and Worker pool saturation. Every Job carries a hard timeout appropriate to its class (10.2); a Job that exceeds it is cancelled cleanly and reported as a failure with full trace. The Kernel exposes a Diagnostics surface (Section 26.20) reporting queue depth, Worker utilization, and per-Project throughput for operational visibility independent of any single Job.

---

## 11. Provider Router

The Intelligent Provider Router is the single point through which every LLM call passes, regardless of which Agent or Plugin initiated it.

### 11.1 Provider Registry
A registry of configured providers — Anthropic, OpenAI, Gemini, OpenRouter, and Local Models — each declaring its supported model tiers, context limits, streaming capability, and current health status. The Registry is the Router's source of truth for what is available to route to at any moment.

### 11.2 Selection Algorithm
For each inference request, the Router evaluates, in order: (1) any Project-level Quality Policy pin (11.5) that forces a specific provider/model; (2) the Job's declared quality and latency requirements against currently healthy providers; (3) remaining budget for the Project/Organization (11.3); (4) live latency and health signals (11.6). The first provider satisfying all applicable constraints is selected; ties are broken toward the lowest-cost healthy option.

### 11.3 Budget Routing
The Router respects per-Project and per-Organization spend ceilings, downgrading to cheaper models when a budget is near its limit rather than blocking outright, and surfacing a budget-warning Event well before a hard ceiling is reached so a human can intervene.

### 11.4 Fallback & Failover
The Router automatically retries against a secondary provider when the primary is degraded or rate-limited, transparently to the calling Agent — the Agent's Pipeline never needs to know which provider actually served a given step.

### 11.5 Quality Routing
A Project can pin specific Agents to specific providers or model tiers when output consistency matters more than cost — for example, pinning the Script Agent to a specific model once brand voice calibration has been tuned against it. Quality Policies are themselves versioned Project configuration, not hardcoded.

### 11.6 Health Monitoring
The Router tracks rolling latency and error-rate windows per provider, feeding both the Selection Algorithm (11.2) and the Error Dashboard (Section 15). A provider that trips its error-rate threshold is temporarily removed from routing consideration and probed periodically for recovery, rather than being permanently blacklisted.

### 11.7 Caching
The Router deduplicates identical or near-identical prompts within a time window to avoid redundant spend, using a content-addressed cache keyed on the fully-assembled prompt (including Knowledge context) — a cache hit bypasses provider calls entirely and is reported distinctly in the Cost & Usage System.

### 11.8 Cost and Latency Optimization
Interactive and Foreground Jobs (10.2) bias the Selection Algorithm toward the fastest healthy provider; Background and Batch Jobs bias toward the most cost-efficient provider, since neither is latency-sensitive to a waiting human.

### 11.9 Cost & Usage System
A dedicated read model over the Kernel's Event stream, aggregating Tokens, Money, Latency, Cache Hits, and Request counts by Project, Agent, Workflow, and User. This is what powers budget alerts, per-client cost reporting for agencies, and the Cost Dashboard (Section 15).


---

## 12. Agent Framework

Before defining the fourteen specific Agents (Section 13), this section defines the generic contract every Agent — present or future, first-party or Plugin-contributed — must implement. This contract is what allows the Kernel, the Review system, and Observability to treat every Agent uniformly, regardless of what it actually does.

### 12.1 Mission
A one-sentence, non-overlapping statement of the Agent's single responsibility. If an Agent's Mission can be split into two independent sentences joined by "and," it should be two Agents.

### 12.2 Responsibilities and Limitations
An explicit list of what the Agent does, and — equally important — an explicit list of what it deliberately does not do, to prevent scope creep into neighboring Agents' territory (e.g., the Script Agent drafts; it does not decide whether an idea is worth drafting — that is the Idea Agent's job).

### 12.3 Lifecycle
Every Agent invocation moves through: `Dispatched` → `Context Assembling` → `Running` (executing its Pipeline) → `Awaiting Review` (if its Permissions require it) → `Committed` or `Rejected`. This lifecycle is uniform across all Agents and is what the Execution Graph (Section 15.1) visualizes regardless of Agent type.

### 12.4 Pipeline
The Agent's internal directed acyclic graph of reasoning steps (Section 7.6). The Pipeline is private to the Agent's implementation — the Kernel executes it as an opaque sequence of steps, observable but not interpretable by anything outside the Agent.

### 12.5 Memory
Every Agent declares which parts of the Memory Engine it reads (Knowledge, prior Assets, Timeline entries) and which it writes (proposals, new Assets, reports). An Agent may never write to a Memory surface it hasn't declared — this declaration is enforced by the Permissions system (12.6), not left as convention.

### 12.6 Permissions
The exact set of Commands an Agent is authorized to issue through the Application Layer, and whether each requires Human Review before commit. Permissions are the mechanical enforcement of the AI Principles (2.8): an Agent's code may attempt any Command, but the Application Layer rejects anything outside its declared Permission set exactly as it would for an under-privileged human user.

### 12.7 Events
The set of typed Events an Agent emits over its lifecycle — at minimum a start and a terminal (success/failure) Event, with intermediate Events for anything meaningful to Observability or downstream Automations.

### 12.8 Job Types
The Kernel Job type(s) an Agent registers, distinguishing scheduled/background invocations from user-triggered ones, and foreground/interactive from long-running (Section 10.2).

### 12.9 Configuration
Per-Project, per-Agent configuration: which model tier it's pinned to (if any, via Provider Router Quality Policies, Section 11.5), its trust level (12.11), and any Agent-specific tunables declared in its own configuration schema.

### 12.10 Inputs and Outputs
A typed contract for what the Agent consumes and produces, expressed as DTOs (Section 9.4) — never raw Domain entities — so an Agent's Pipeline internals can change freely without breaking anything that depends on it.

### 12.11 Trust Model
Every Agent action class starts at the lowest trust level: **Propose-Only**, requiring Human Review for every output. A Project owner can explicitly elevate specific action classes to **Auto-Commit** (no review required) once an Agent has demonstrated reliability for that Project — this elevation is itself a recorded, reversible Command, never a silent default that creeps upward.

### 12.12 Review Model
For any action class still at Propose-Only trust, the Agent's output enters the Human Review queue via the Review Agent's packaging (Section 13.12), exposing Approve, Reject, and Edit. A Reject is fed back into the Agent's next invocation as negative context, not silently discarded.

### 12.13 Failure Behavior
Every Agent must define what happens on partial failure — whether partial output is preserved (the default, per the Graceful Degradation principle, Section 26.11) or discarded, and how failures are surfaced to the Activity Center. Silent failure is never acceptable under this contract.

### 12.14 Capabilities Declaration
An Agent declares, in machine-readable form, the Tools it uses (search, scrape, Knowledge Graph query, Plugin actions) so that Observability, Cost tracking, and Security review can reason about an Agent's full reach without reading its implementation.


---

## 13. Agent Ecosystem

Each Agent below implements the generic contract defined in Section 12. Agents never manipulate the Domain directly; every effect an Agent produces is expressed as a Command through the Application Layer, exactly like a human-initiated action.

### 13.1 Research Agent
- **Mission:** Turn a research question or monitoring trigger into structured, sourced findings.
- **Inputs:** A query or topic, Project Knowledge (for context on what's already known), optional source constraints.
- **Outputs:** A structured Research Finding Asset with sources, key claims, and confidence notes.
- **Internal Pipeline:** Query → Scrape → Filter → Summarize.
- **Tools:** Web search, page fetch, source credibility scoring.
- **Memory:** Reads existing Knowledge to avoid redundant research; writes findings back as candidate Knowledge updates.
- **Events:** `research.started`, `research.source_found`, `research.completed`.
- **Job Types:** `research.query` (foreground), `research.monitor` (scheduled background).
- **Permissions:** Read Knowledge; propose Knowledge updates (requires Human Review to commit).
- **Failure Recovery:** Partial findings are preserved and surfaced even if the Job times out mid-scrape; a failed source is skipped, not fatal to the Job.

### 13.2 Knowledge Agent
- **Mission:** Curate and maintain the Project's Knowledge Graph as the single source of brand truth.
- **Inputs:** Research findings, direct human edits, Analytics signals.
- **Outputs:** Proposed Knowledge diffs (Brand Identity, Personas, Competitor Profiles).
- **Internal Pipeline:** Ingest → Reconcile → Diff → Propose.
- **Tools:** Knowledge Graph read/write interface, semantic diffing.
- **Memory:** Owns the canonical Knowledge Graph; every accepted diff becomes a new Memory Timeline entry.
- **Events:** `knowledge.diff_proposed`, `knowledge.diff_accepted`, `knowledge.diff_rejected`.
- **Job Types:** `knowledge.reconcile`.
- **Permissions:** Propose-only on Knowledge; cannot self-approve its own diffs.
- **Failure Recovery:** Conflicting diffs are queued for Human Review rather than auto-merged.

### 13.3 Strategy Agent
- **Mission:** Convert Knowledge and Research into a structured content matrix and positioning strategy.
- **Inputs:** Knowledge Graph, Research findings, prior Analytics performance.
- **Outputs:** A Content Strategy Asset (matrix of themes, formats, cadence, target personas).
- **Internal Pipeline:** Synthesize → Prioritize → Structure.
- **Tools:** Knowledge Graph query, content matrix templates.
- **Memory:** Reads Knowledge and Analytics; writes Strategy Assets to the AssetGraph.
- **Events:** `strategy.draft_created`.
- **Job Types:** `strategy.build`.
- **Permissions:** Read Knowledge, Analytics; write Strategy Assets (draft state only).
- **Failure Recovery:** A partial matrix is saved as a draft rather than discarded on interruption.

### 13.4 Idea Agent
- **Mission:** Generate concrete, produceable content ideas grounded in Strategy and Knowledge.
- **Inputs:** Strategy Asset, Knowledge Graph.
- **Outputs:** Idea Assets, each linked to the Strategy theme it fulfills.
- **Internal Pipeline:** Knowledge → Reasoning → Decision → Output.
- **Tools:** Knowledge Graph query, AssetGraph linkage.
- **Memory:** Reads Strategy and Knowledge; writes Idea Assets.
- **Events:** `idea.generated`, `idea.discarded`.
- **Job Types:** `idea.generate` (batch), `idea.refine` (single).
- **Permissions:** Read Strategy, Knowledge; write Idea Assets (draft state).
- **Failure Recovery:** Ideas generate independently within a batch; one failed idea does not fail the batch.

### 13.5 Script Agent
- **Mission:** Draft full content scripts from an approved Idea, in the Project's established brand voice.
- **Inputs:** Idea Asset, Knowledge (voice/tone), relevant Prompt Assets.
- **Outputs:** Script draft Asset.
- **Internal Pipeline:** Outline → Draft → Voice-check → Finalize.
- **Tools:** Prompt Asset Graph, voice consistency checker.
- **Memory:** Reads Knowledge and prior accepted Scripts for voice calibration; writes Script Assets.
- **Events:** `script.drafted`, `script.voice_flagged`.
- **Job Types:** `script.draft`.
- **Permissions:** Read Knowledge, Idea Assets; write Script Assets (draft state, requires Human Review to finalize).
- **Failure Recovery:** Voice-check failures produce a flagged draft for human attention rather than a silently degraded script.

### 13.6 Publishing Agent
- **Mission:** Deliver an approved Asset to its destination platform.
- **Inputs:** Approved Asset, target platform credentials (via Plugin).
- **Outputs:** Publish confirmation, platform metadata (post ID, URL).
- **Internal Pipeline:** Format → Authenticate → Delivery.
- **Tools:** Platform Plugins (via Plugin SDK), formatting adapters.
- **Memory:** Writes publish events to the Memory Timeline and links the published Asset to its live URL.
- **Events:** `publish.attempted`, `publish.succeeded`, `publish.failed`.
- **Job Types:** `publish.deliver`.
- **Permissions:** Requires an explicit human Approve action; cannot run autonomously unless a Project has enabled trusted automation for that platform.
- **Failure Recovery:** Failed delivery retries with backoff; after exhausting retries, surfaces to the Activity Center as an actionable error, never a silent drop.

### 13.7 Analytics Agent
- **Mission:** Ingest platform performance data and surface signal back into Strategy and Knowledge.
- **Inputs:** Platform Plugin analytics feeds.
- **Outputs:** Performance summaries, flagged anomalies, Strategy-relevant signals.
- **Internal Pipeline:** Ingest → Normalize → Detect → Report.
- **Tools:** Analytics Plugins, statistical anomaly detection.
- **Memory:** Writes performance data to the Memory Timeline; can trigger the Strategy Agent via Automation.
- **Events:** `analytics.synced`, `analytics.anomaly_detected`.
- **Job Types:** `analytics.sync` (scheduled).
- **Permissions:** Read-only on platform data; write-only on Analytics summaries.
- **Failure Recovery:** A failed sync from one platform does not block syncs from others; each platform source is independently retried.

### 13.8 Memory Agent
- **Mission:** Maintain the health and retrievability of the Memory Timeline and Knowledge embeddings.
- **Inputs:** Raw Event stream.
- **Outputs:** Compacted snapshots, refreshed embeddings, pruned low-value context.
- **Internal Pipeline:** Collect → Embed → Compact → Index.
- **Tools:** Vector store, embedding models (via Provider Router).
- **Memory:** Owns the embedding index and snapshot layer; never rewrites raw Events, only their derived projections.
- **Events:** `memory.snapshot_created`, `memory.index_refreshed`.
- **Job Types:** `memory.maintain` (scheduled background).
- **Permissions:** Read all Events; write only to derived indexes, never to canonical Event Store.
- **Failure Recovery:** Indexing failures degrade retrieval quality gracefully rather than blocking any user-facing action; a failed pass is simply retried on the next scheduled cycle.

### 13.9 QA Agent
- **Mission:** Check drafted Assets against Project quality rules before they reach Human Review.
- **Inputs:** Draft Assets, Project-defined QA rules (fact accuracy flags, banned terms, formatting rules).
- **Outputs:** QA report attached to the draft.
- **Internal Pipeline:** Rule-check → Consistency-check → Report.
- **Tools:** Rule engine, Knowledge Graph cross-reference.
- **Memory:** Reads Knowledge for factual consistency; writes QA reports, never mutates the Asset itself.
- **Events:** `qa.passed`, `qa.flagged`.
- **Job Types:** `qa.check` (auto-triggered on draft creation).
- **Permissions:** Read-only on Assets and Knowledge; write-only on QA reports.
- **Failure Recovery:** An inconclusive check is reported as "needs human attention," never silently passed.

### 13.10 Planner Agent
- **Mission:** Turn approved Ideas and Strategy cadence into a scheduled Calendar.
- **Inputs:** Idea Assets, Strategy cadence rules, existing Calendar state.
- **Outputs:** Calendar entries linking Ideas to production and publish dates.
- **Internal Pipeline:** Prioritize → Slot → Balance → Schedule.
- **Tools:** Calendar read/write interface.
- **Memory:** Reads Strategy, Ideas; writes Calendar entries.
- **Events:** `plan.scheduled`, `plan.rebalanced`.
- **Job Types:** `plan.build`.
- **Permissions:** Write access to Calendar only; cannot alter Ideas or Strategy directly.
- **Failure Recovery:** A scheduling conflict is surfaced as a flagged entry rather than silently overwriting an existing slot.

### 13.11 Asset Agent
- **Mission:** Manage the lifecycle of media Assets — organizing, tagging, and linking them within the AssetGraph.
- **Inputs:** Newly produced or uploaded Assets.
- **Outputs:** Enriched Asset metadata, AssetGraph relationships.
- **Internal Pipeline:** Classify → Tag → Link → Index.
- **Tools:** AssetGraph read/write, semantic tagging.
- **Memory:** Writes Asset metadata and relationships; never alters Asset content itself.
- **Events:** `asset.indexed`, `asset.linked`.
- **Job Types:** `asset.process` (auto-triggered on Asset creation/import).
- **Permissions:** Read Assets; write Asset metadata and AssetGraph edges only.
- **Failure Recovery:** Classification failure leaves an Asset in an "unclassified" state visible in the UI, never blocks its usability.

### 13.12 Review Agent
- **Mission:** Prepare drafts for efficient Human Review by surfacing diffs, risk flags, and relevant context in one place.
- **Inputs:** Draft Asset, its QA report, its Knowledge lineage.
- **Outputs:** A structured Review Package (diff view, flags, context summary).
- **Internal Pipeline:** Assemble → Diff → Summarize.
- **Tools:** Diff engine, Knowledge lineage query.
- **Memory:** Read-only across Assets, QA reports, and Knowledge; writes only the Review Package.
- **Events:** `review.package_ready`.
- **Job Types:** `review.prepare` (auto-triggered before a draft enters the Human Review queue).
- **Permissions:** Read-only everywhere it touches.
- **Failure Recovery:** If context assembly partially fails, the Review Package ships with what succeeded and a visible note on what's missing, rather than blocking review entirely.

### 13.13 Workflow Agent
- **Mission:** Execute user-authored Automations (When → If → Then flows), invoking other Agents and Plugin actions as steps.
- **Inputs:** An Automation definition, its trigger event.
- **Outputs:** Downstream Commands and Job dispatches per the Automation's defined steps.
- **Internal Pipeline:** Trigger-match → Condition-evaluate → Action-dispatch.
- **Tools:** Application Layer Command dispatch, Plugin action invocation.
- **Memory:** Reads Automation definitions; writes execution logs to the Memory Timeline.
- **Events:** `automation.triggered`, `automation.step_completed`, `automation.failed`.
- **Job Types:** `automation.run`.
- **Permissions:** Scoped exactly to what the specific Automation's owner has authorized — never broader.
- **Failure Recovery:** A failed step halts only that Automation run and reports precisely which step failed; it never partially applies a Then-branch silently.

### 13.14 Marketplace Agent
- **Mission:** Assist with discovery, compatibility-checking, and safe installation of Blueprints, Plugins, and Packs from the Marketplace.
- **Inputs:** A user's search intent or an install request.
- **Outputs:** Ranked recommendations, compatibility reports, install confirmations.
- **Internal Pipeline:** Search → Score → Validate → Recommend.
- **Tools:** Marketplace Registry query, Plugin/Blueprint manifest validation.
- **Memory:** Reads Marketplace Registry; writes nothing to Project state directly (installation itself always goes through an explicit human-confirmed Command).
- **Events:** `marketplace.recommended`, `marketplace.install_validated`.
- **Job Types:** `marketplace.search`, `marketplace.validate`.
- **Permissions:** Read-only on the Registry; cannot install anything without explicit human confirmation.
- **Failure Recovery:** A manifest that fails validation is never installed, and the failure reason is shown verbatim to the user.


---

## 14. Plugin Ecosystem & MCP

Plugins are the mechanism by which ContentCompiler extends beyond what first-party engineering can build alone. First-party integrations use the exact same Plugin SDK as third parties, per ADR-005 — there is no privileged internal-only extension path.

### 14.1 Plugin Manifest
Every Plugin declares itself through a manifest: identity, version, required Permissions, declared Actions, Triggers, UI Panels, Commands, Settings schema, and compatibility range against the platform's Plugin SDK version. The manifest is the contract the Plugin Registry validates before a Plugin is ever allowed to run.

### 14.2 Plugin Registry & Marketplace
The Registry is the canonical index of all known Plugins, their versions, and their manifests. The Marketplace is the user-facing discovery and distribution surface built on top of the Registry, where Plugins are browsed, rated, installed, and updated.

### 14.3 Plugin Lifecycle
Install → Configure → Enable → Run → Update → Disable → Uninstall. Each transition is an explicit, auditable Command. An installed-but-disabled Plugin consumes no runtime resources and cannot execute Actions or Triggers.

### 14.4 Plugin Sandboxing & Permissions
Plugins execute in an isolated boundary with no ambient access to the host system, other Plugins, or Project data beyond what their manifest explicitly requests and the user explicitly grants at install time. A Plugin requesting Publishing credentials cannot, by that grant alone, read Knowledge or Memory — each capability is its own permission scope.

### 14.5 Plugin Surfaces
A Plugin can expose any combination of: **Actions** (callable operations, e.g., "post to TikTok"), **Triggers** (events a Plugin can raise into Automations, e.g., "new comment received"), **UI Panels** (custom views embedded in a Workspace), **Assets** (new Asset types the Plugin understands), **Agent Skills** (capabilities an Agent can invoke through the Plugin), **Capabilities** (abstract platform capabilities the Plugin provides, e.g. "publishing", used for Blueprint resolution), **Authentication** (credential flows for the external service), **Settings** (a configuration schema rendered natively in the product's settings UI), **Commands** (entries surfaced in the Global Command Palette), and **Storage** (a private, sandboxed key-value store scoped to that Plugin and Project).

### 14.6 Model Context Protocol (MCP) Support
The Plugin System includes a full MCP SDK, Registry, and Discovery mechanism. Any MCP Server — first-party or third-party — behaves as a native Plugin the moment it's connected: its tools appear as Actions, its resources as readable context, with no bespoke integration work required. MCP is treated as a first-class Plugin transport, not a bolted-on protocol.

### 14.7 Workspace SDK
Beyond individual UI Panels, a Plugin can register an entire custom Workspace (defined by a Workspace Manifest, Section 38.16) — for example, a "TikTok Workspace" exposing its own views, Commands, and Asset types, appearing in the Navigation Tree alongside first-party Workspaces (Research, Strategy, Production). This is the extension point that allows the product's surface area to grow without every new capability requiring a first-party release.

---

## 15. Plugin SDK Specification

This section is the precise contract a Plugin author builds against. It exists because "Plugin System" in Section 14 describes what Plugins can do; this section describes exactly how a Plugin developer interacts with the platform to do it.

### 15.1 Lifecycle (Developer View)
A Plugin ships as a package containing its manifest (15.2), its compiled Action/Trigger/Panel implementations, and any bundled Assets or Settings schema. The SDK CLI validates the manifest locally before publishing to the Registry. Once published, the Lifecycle states from Section 14.3 apply per-installation, per-Project.

### 15.2 Manifest Schema
The manifest declares: `id`, `name`, `version` (semver), `sdkCompatibilityRange`, `permissions` (an explicit array of scoped capability requests — e.g., `publishing:tiktok`, `knowledge:read`), `providedCapabilities` (abstract capabilities the Plugin provides, used for Blueprint dependency resolution), `actions[]`, `triggers[]`, `panels[]`, `commands[]`, `settingsSchema`, and `authentication` (declared credential flow type, if any). No field is inferred; everything a Plugin can do is enumerated in the manifest.

### 15.3 Discovery
The Marketplace Agent (13.14) and the Marketplace UI both query the Registry via the same public search API a Plugin author's own tooling can use to verify how their Plugin will be discovered — there is no separate internal ranking signal unavailable to third parties.

### 15.4 Registration
On install, the Application Layer records a `PluginInstalled` Event scoped to the Project, capturing the exact manifest version and the exact permission grants the user approved — a subsequent Plugin update requesting broader permissions requires a fresh, explicit re-approval, never a silent permission expansion.

### 15.5 Permissions (Developer View)
Permissions are requested per-capability in the manifest and granted per-capability by the user at install or upgrade time. A Plugin's runtime calls are checked against its granted set on every invocation — there is no cached "already trusted" bypass.

### 15.6 Sandbox
Plugin code executes in an isolated runtime with no filesystem access, no direct network access outside declared Action endpoints, and no ability to import or call other Plugins' code or storage. All platform interaction happens through the SDK's provided client, which is itself a thin wrapper over the Application Layer's public API (Section 8.7).

### 15.7 Storage
Each Plugin receives a private, sandboxed key-value store scoped to `(Plugin, Project)`. No Plugin can read another Plugin's storage, and a Plugin's storage for one Project is invisible to its instance running in another Project.

### 15.8 Commands, Panels, Actions, Triggers, Assets
- **Commands** register entries in the Global Command Palette (Section 20.2).
- **Panels** register custom UI surfaces mountable within a Workspace, styled via the shared Design System (Section 21).
- **Actions** are callable, typed operations other parts of the system (Automations, Agents with the right Permissions) can invoke.
- **Triggers** are events a Plugin can raise that Automations can subscribe to.
- **Assets** declare new Asset types the platform's Asset System (Section 22) should recognize, including their type-specific metadata schema.

### 15.9 Authentication
Plugins requiring external service credentials declare an `authentication` flow (typically OAuth) in their manifest; the platform hosts the credential exchange and stores the resulting token in the encrypted Secrets store (Section 26.6) — the Plugin's own code never sees the raw credential, only an opaque handle it can use to make authenticated Action calls.

### 15.10 Versioning, Compatibility, and Migration
Plugins declare an `sdkCompatibilityRange`. The platform refuses to enable a Plugin whose declared range doesn't include the running SDK version, rather than attempting a best-effort load. When a Plugin publishes a new version, installed instances upgrade only on explicit user action (or organization-configured auto-update policy), and a Plugin can declare a `migrate()` step invoked once at upgrade time to transform its own private Storage schema — the platform never inspects or transforms Plugin storage on its behalf.


---

## 16. Blueprint Ecosystem & Marketplace

Blueprints turn "start a new Project" from a blank-page problem into a one-click operation.

### 16.1 Blueprint Structure
A Blueprint bundles: starter Knowledge (brand voice templates, persona archetypes), a preconfigured Workspace layout, a default Agent configuration (which Agents are active, their default trust levels), and starter Assets (prompt templates, example scripts) — all scoped to a specific business archetype such as Restaurant, Real Estate, or Agency.

### 16.2 Versioning & Publishing
Blueprints are semantically versioned. Publishing a new version does not retroactively alter Projects built from an older version — a Project that installed a Blueprint owns an independent copy of what it received, not a live link back to the Blueprint definition.

### 16.3 Dependencies, Inheritance, and Overrides
A Blueprint can declare dependencies on specific Plugins, other Blueprints, or abstract **Capabilities** (e.g., "publishing", "analytics"). Once installed, every element a Blueprint provided is fully editable within the Project — installation is inheritance-by-copy, not a locked template; any local edit is an explicit override that survives even if the source Blueprint updates.

### 16.4 Migration & Updates
When a Blueprint publishes a new version, Projects built from an earlier version can optionally pull a Migration — a scoped, previewable diff of what changed, applied only to elements the Project hasn't already overridden locally.

### 16.5 Distribution & Marketplace
The Marketplace is the single global distribution hub for Blueprints, Plugins, Prompt Packs, Agent Packs, Workflow Packs, and Themes. Every distributable artifact in ContentCompiler — regardless of type — goes through the same discovery, rating, and installation flow.

---

## 17. Blueprint Specification

This section is the precise, installable format behind Section 16's product description.

### 17.1 Manifest
A Blueprint manifest declares: `id`, `name`, `version` (semver), `businessArchetype`, `requiredCapabilities[]` (abstract capabilities the Blueprint needs to function), `dependencies[]` (specific Plugins/Blueprints required), `contributedCommands[]` (Commands the Blueprint adds to the platform), `contributedEvents[]` (Events the Blueprint can emit), and `variables[]` — user-supplied inputs collected at install time (e.g., business name, primary language) that parameterize the bundled content.

### 17.2 Bundled Assets and Knowledge
The manifest references a set of starter Asset definitions and Knowledge seed data, each expressed with `{{variable}}` placeholders resolved against the `variables[]` collected at install (17.1) — a Blueprint is a template over the Asset and Knowledge schemas defined in Section 22 and Section 7.3, not a separate content format.

### 17.3 Variables
Variables are typed (`text`, `choice`, `color`, `assetReference`) and can be marked required or optional with defaults. The install flow renders a short, generated form from this schema — no Blueprint author writes custom install UI.

### 17.4 Installation
Installing a Blueprint is a single Application Layer Use Case: validate the manifest and dependencies, collect variable values, materialize the templated Assets and Knowledge as real, independently-owned Project data (per the inheritance-by-copy rule, 16.3), and record one `BlueprintInstalled` Event capturing the exact source version for future Migration diffing (17.6).

### 17.5 Dependencies and Overrides
Declared Plugin dependencies are installed (with the user's explicit permission approval, Section 15.5) as a precondition of Blueprint installation completing. Declared Blueprint dependencies are recursively resolved and installed in dependency order. Post-install, every materialized element carries a provenance marker (source Blueprint + version) used only for Migration diffing — it never restricts subsequent local editing.

### 17.6 Migration
A Migration is a diff between two Blueprint versions, computed by the publisher and validated by the Marketplace Agent (13.14) before being offered to installed Projects. The diff is filtered per-Project to exclude anything the Project has locally overridden since install, so a Migration never silently clobbers a user's customization.

### 17.7 Publishing and Marketplace Metadata
Publishing a Blueprint to the Marketplace requires manifest validation, a declared `businessArchetype` category, a changelog entry per version, and — for public Marketplace listing — a review pass verifying the manifest's declared Plugin dependencies are themselves published and compatible. Marketplace metadata (ratings, install counts, screenshots) is tracked separately from the manifest itself and never affects installed Projects retroactively.

---

## 18. Automation Engine

The Automation Engine is the user-facing counterpart to an Agent's private internal Pipeline (Section 7.6): visible, editable, and owned by the user, composed from `When → If → Then` primitives.

### 18.1 Nodes
An Automation is a graph of typed nodes: **Trigger nodes** (a Project Event, a schedule, a Plugin-raised Trigger), **Condition nodes** (evaluating an expression against available context), **Action nodes** (dispatching a Command, invoking an Agent Job, or calling a Plugin Action), and **Human Approval nodes** (pausing the graph for explicit sign-off, mirroring the Agent Trust Model's Review checkpoint, Section 12.12).

### 18.2 Edges
Edges connect nodes and carry the data contract flowing between them — the output DTO shape of the upstream node must satisfy the input DTO shape the downstream node declares, checked at Automation save-time, not first discovered at run-time.

### 18.3 Conditions, Variables, and Expressions
Condition nodes evaluate a small, sandboxed expression language over: Trigger payload fields, Project Knowledge lookups, and user-defined Automation Variables (named values scoped to a single Automation run, set by upstream nodes and read by downstream ones). The expression language deliberately has no side effects — it can only branch, never mutate.

### 18.4 Execution
An Automation run is itself a Kernel Job (Job type `automation.run`, Section 13.13), executed by the Workflow Agent, which walks the graph from its triggered node, evaluating Conditions and dispatching Actions in order, respecting the graph's declared parallel branches (18.6).

### 18.5 Scheduling
A schedule-Trigger node uses the same Job scheduling and priority model as any other Job (Section 10), classed as Background by default — a scheduled Automation does not compete with interactive user work for Worker capacity.

### 18.6 Loops and Parallel Branches
The graph format supports bounded loops (iterating over a collection with an explicit maximum iteration count, preventing runaway execution) and explicit parallel branches (multiple Action nodes dispatched concurrently from one Condition outcome, with the graph's next node waiting on all branches to complete before proceeding).

### 18.7 Failures
A failed Action node halts only its branch; sibling parallel branches continue unless the Automation explicitly declares a shared failure policy. Every failure is reported with the exact node that failed and its error (Section 27), and never causes a downstream Then-branch to apply partially.

### 18.8 Human Approval
An Automation can insert an explicit Human Approval node at any point, pausing exactly like a paused Job (Section 10.5) and resuming from that exact graph position once a human responds — approvals within an Automation use the identical Review UI as Agent output review (Section 20.7), so users learn one review pattern, not two.

### 18.9 Observability
Every Automation run produces a live Execution Graph identical in kind to an Agent's Pipeline visualization (Section 15.1), since both are Kernel Jobs emitting the same structured Events — a user inspects "what did this Automation actually do" with the same tool they use to inspect "what did this Agent actually do."


---

## 19. Asset System & Prompt Asset Graphs

### 19.1 Asset Types
Images, Videos, Audio, Voice Profiles, Hooks, B-roll, Logos, Templates, and Prompt Assets. Every Asset type shares the same base capabilities — versioning, tagging, collections, and AssetGraph participation — while carrying type-specific metadata (a Voice Profile carries tone descriptors; a Video carries duration and resolution).

### 19.2 The Prompt Asset Graph
Prompts are not static strings. A Prompt Asset is a structured graph containing: System Prompt, Instructions, Variables, Examples, Schemas, Rules, Memory References, and Output Contracts. This structure is what allows a Prompt Asset to be versioned, diffed, and reused across Agents — a Script Agent and a Research Agent can share a Knowledge-reference component without duplicating logic.

### 19.3 Versioning
Every Asset carries a full version history. Editing an Asset never destroys the prior version; it creates a new version linked to the prior one, viewable as a diff, and reachable through the Memory Timeline exactly like any other change.

### 19.4 Tagging & Collections
Tags are freeform and Project-scoped; Collections are curated, ordered groupings (e.g., "Q3 Refrigeration Campaign") that can mix Asset types. Both are metadata layers on top of the AssetGraph, not separate storage systems.

### 19.5 The AssetGraph Itself
The AssetGraph tracks exact usage of Assets across the Project: which Prompt Asset generated which Script, which Script referenced which Hook, which Video used which Voice Profile. This graph is what answers "what depends on this" before a destructive edit, and "where did this come from" during Review.

### 19.6 Semantic Search
Every Asset is embedded and indexed by the Memory Engine (Section 20), enabling natural-language search across the entire Asset library — "find hooks like this one" or "show me every script that used this persona" — rather than tag-exact-match search alone.

---

## 20. Memory & Knowledge Engine

### 20.1 Knowledge Graph
The structured representation of everything ContentCompiler knows about a Project's brand, audience, and competitive landscape (Section 7.3). It is queried by nearly every Agent and is the primary grounding context for generation.

### 20.2 Timeline & Event Store
The append-only ledger underlying the entire Memory-first Philosophy (2.16). Every Command that succeeds produces one or more Events; the Timeline is the human-readable projection of that Event Store, filterable by Project, Agent, Asset, or actor.

### 20.3 Embedding Pipeline
Newly created or edited Knowledge, Assets, and Timeline entries enter an embedding queue processed by the Memory Agent (13.8): content is chunked to an appropriate granularity, embedded via the Provider Router's embedding model class, and written to the vector store alongside a pointer back to its canonical Event Store record — the vector store never holds content that isn't also traceable to a canonical source.

### 20.4 Indexing
Two indexes are maintained in parallel: the vector index (semantic similarity) and the Search Index (Section 23.5, lexical/metadata match). Both are rebuildable from the Event Store, per the CQRS/ADR-007 principle that no derived index is ever treated as a second source of truth.

### 20.5 Context Assembly
When an Agent begins a Job, the Application Layer assembles exactly the context that Agent's declared Memory contract (Section 12.5) requires — relevant Knowledge, relevant prior Assets, relevant Memory entries — via retrieval rather than dumping the entire Project history into every prompt. This keeps Agent context both relevant and within provider context limits.

### 20.6 Relevance Scoring and Semantic Retrieval
Retrieval combines vector similarity, recency, and — once available — the Learning signal (20.10) from prior accept/reject outcomes, so an Agent's context favors what has actually proven useful for that Project over time, not just what is textually similar.

### 20.7 Snapshots
Periodic compacted representations of Project state, produced by the Memory Agent, so that reconstructing "what did this Project look like on this date" doesn't require replaying the entire Event history from Project creation — a performance necessity as Projects accumulate years of history.

### 20.8 Memory Aging, Pruning, and Retention
Not all Memory is equally valuable indefinitely. Low-relevance, low-recency embeddings are candidates for pruning from the *retrieval* index — this never deletes the underlying Event (which remains permanently in the Event Store per the Memory-first Philosophy), it only deprioritizes it from active Context Assembly. Retention policy (how aggressively to prune) is configurable per-Project, defaulting to conservative.

### 20.9 Compaction
The Memory Agent periodically compacts long, low-density Timeline stretches (e.g., many small automated sync Events) into summarized Snapshot entries for retrieval purposes, while — again — leaving the raw Events themselves untouched and fully replayable.

### 20.10 Learning & Evolution
Accepted vs. rejected Agent outputs, and their downstream Analytics performance, feed back into how future Context Assembly is weighted for that Project — not as opaque model fine-tuning, but as transparent, inspectable retrieval-weighting adjustments recorded in the Memory Timeline like any other change.


---

## 21. Event-Driven Architecture

Events (Section 9.3) are the connective tissue of the entire platform. This section defines the taxonomy and mechanics governing them.

### 21.1 Event Taxonomy
- **Domain Events** — facts about Domain state changes, produced by successful Commands (`AssetVersionCreated`, `KnowledgeDiffAccepted`).
- **Application Events** — facts about orchestration, not Domain state (`UseCaseStarted`, `AuthorizationDenied`).
- **Kernel Events** — facts about Job execution (`JobQueued`, `JobStepCompleted`, `WorkerCrashed`).
- **Plugin Events** — facts a Plugin raises through its declared Triggers (`plugin.tiktok.comment_received`).
- **Automation Events** — facts about Automation graph execution (`automation.node_executed`).
- **UI Events** — ephemeral, client-local interaction events (hover, focus, panel resize) that never cross into the Event Store; these are the one category deliberately excluded from persistence, since they carry no product-meaningful state.

### 21.2 The Event Bus
A single logical bus carries every non-UI Event category. Producers (Application Layer, Execution Kernel, Plugins) publish; consumers (Query projections, the Memory Timeline, Observability, Automations, the Cost & Usage System) subscribe. No consumer is privileged — the same bus and the same Event shape serve product features and operational tooling alike.

### 21.3 Subscriptions
A subscription declares an Event type filter and a Project scope filter. Subscribers are either **durable** (must not miss an Event — e.g., the Query projection rebuilder, which tracks its own consumption offset and resumes exactly where it left off) or **ephemeral** (best-effort, live UI updates, where a missed Event is superseded by the next state refresh regardless).

### 21.4 Replay
Because the Event Store is canonical and append-only (ADR-002), any durable subscriber can replay from any historical offset — this is the mechanism behind rebuilding a corrupted Query projection, backfilling a newly-added Search Index field, or reconstructing Project state for a support investigation, without any special-cased recovery tooling.

### 21.5 Ordering
Events are strictly ordered within a single Project (a monotonic per-Project sequence number), but ordering across different Projects is not guaranteed or meaningful, since Projects are fully isolated (Section 7.1). Consumers must not assume global ordering, only per-Project ordering.

### 21.6 Consistency
The Event Store itself is strongly consistent — a Command's Events are durably committed before the Command returns success. Everything downstream of the Event Store (Query projections, Search Index, vector index) is eventually consistent, with a bounded, monitored lag. The UI is built to tolerate this explicitly: an action's own confirmation comes from the Command's direct response, never from re-querying a projection that may not have caught up yet.

---

## 22. State Management Architecture

ContentCompiler has six distinct categories of state, each with a different owner, lifetime, and synchronization strategy. Conflating them is a primary source of bugs in systems of this complexity, so each is treated as architecturally distinct.

### 22.1 UI State
Ephemeral, client-local, never persisted beyond the current session: which panel is focused, scroll position, an unsaved form draft. Owned entirely by the Presentation Layer; never reaches the Application Layer.

### 22.2 Application State
In-memory orchestration state within a single Use Case's execution — for example, the intermediate result of a multi-step Use Case before its final Command commits. Scoped to the lifetime of that Use Case call; never persisted independently of the Events it eventually produces.

### 22.3 Server (Local) State
The durable, canonical state living in the Event Store and its projections (Section 12, Storage Architecture). This is "server state" in the conventional sense even though, per the Local-first strategy (ADR-004), the "server" is the local SQLite/vector store on-device.

### 22.4 Job State
The execution state of a Kernel Job (Section 10.3): its current lifecycle stage, its Pipeline step progress, its accumulated partial output. Reconstructable entirely from Kernel Events, per Section 10.6 — Job State is never held only in Worker memory.

### 22.5 Workflow State
The execution state of a running Automation graph (Section 18.4): which node is active, what Variables have been set. Structurally identical to Job State, since an Automation run *is* a Job, but tracked with graph-position semantics specific to the Automation Engine.

### 22.6 Memory State
The Memory Timeline and its derived indexes (Section 20) — the longest-lived state category, spanning the entire life of a Project.

### 22.7 Synchronization
Server (Local) State and Memory State are the only categories that participate in Cloud Sync (2.11). Sync operates by replicating committed Events, not by replicating derived projections — each device rebuilds its own projections locally from the synced Event stream, which is both bandwidth-efficient and immune to projection-schema drift between devices running different app versions.

### 22.8 Offline Synchronization and Conflict Resolution
While offline, Commands still execute fully locally (per Offline-first, 2.10) and produce local Events with a per-device provisional ordering. On reconnect, the sync layer merges provisional Events into the canonical per-Project sequence (21.5). Genuine conflicts — two devices editing the same Knowledge field offline — are resolved via a deterministic last-writer-wins policy at the field level, with the losing write preserved, not discarded, as a superseded Memory Timeline entry the user can recover, per the Memory-first Philosophy (2.16). Structural conflicts (e.g., two devices renaming the same Asset differently) surface as an explicit merge prompt rather than a silent automatic resolution.

### 22.9 Undo / Redo
Because every mutation is an Event, Undo is implemented as issuing a new, compensating Command that reverses the effect of a prior one — never as literally deleting the prior Event. This means Undo is itself fully auditable and Redo is simply undoing the Undo. Undo scope follows the Workspace the user is currently in: undoing in the Production Workspace only offers to reverse Production-scoped Commands, keeping the mental model local and predictable.

---

## 23. Error Architecture

### 23.1 Error Hierarchy
All errors in the system derive from one root distinction — **Recoverable** vs. **Fatal** — and are further classified by origin:
- **Domain Errors** — an invariant violation (Section 7.11) caught before any Event is produced; always Recoverable, always reported with the specific invariant that failed.
- **Infrastructure Errors** — a storage, filesystem, or local-resource failure; may be Recoverable (transient) or Fatal (disk full, corrupted local database) depending on cause.
- **Provider Errors** — an LLM Provider failure (timeout, rate limit, content policy rejection); handled first by the Provider Router's Fallback logic (Section 11.4) and only surfaced to the user if every fallback is exhausted.
- **Plugin Errors** — a failure inside a Plugin's sandboxed execution; always contained to that Plugin's Action/Job and never allowed to crash the host process, per the Sandbox guarantee (Section 15.6).
- **User Errors** — invalid input or an unauthorized action attempt; always Recoverable, always reported with actionable correction guidance, never a raw internal error code.

### 23.2 Recoverable vs. Fatal
A Recoverable error leaves the system in a known-consistent state and can be retried, corrected, or dismissed by the user without restarting anything. A Fatal error indicates the system can no longer guarantee consistency for the affected scope (typically a specific Job or Plugin sandbox, almost never the whole application, by design) and requires that scope to be torn down and restarted rather than continued.

### 23.3 Domain Errors
Raised exclusively by Domain invariant checks (Section 7.11), carrying a stable, versioned error code and the specific field/rule that failed — never a free-text-only message, so that Presentation, Plugins, and Automations can branch on error type programmatically rather than string-matching.

### 23.4 Retry Strategy
Retry eligibility is declared per error type, not decided ad hoc at the call site: Provider Errors and transient Infrastructure Errors are retryable under the Kernel's exponential backoff policy (Section 10.6); Domain Errors and User Errors are never retried automatically, since retrying an invalid Command produces the identical invalid result.

### 23.5 Error Propagation
An error produced deep in a Pipeline step propagates up as a typed result attached to that step's Event, not as an unhandled exception crossing a layer boundary. The Application Layer translates any error reaching it into the appropriate Command/Query failure response; the Presentation Layer never receives a raw stack trace, only a typed, actionable Error DTO.

### 23.6 Error Visualization
Errors surface in three coordinated places depending on severity and audience: inline in the UI at the point of action (User Errors), in the Activity Center as a persistent, actionable item (Recoverable failures needing follow-up, e.g., a failed Publish), and in the Error Dashboard (Section 15) aggregated by Agent/Provider/Plugin for operational trend visibility — the same underlying Event, three different views, never three different sources of truth.


---

## 24. Cross-Cutting Concerns

These concerns apply horizontally across every layer (Section 5.1) rather than belonging to any single one. Each is implemented once, centrally, and consumed everywhere — no layer or package reimplements its own logging, its own retry policy, or its own secrets handling.

### 24.1 Logging
Structured, leveled logging (`debug`/`info`/`warn`/`error`) tagged with Trace ID, Project scope, and originating layer. Logs are a diagnostic surface, distinct from Events — a log line is not a fact the product reasons about, while an Event is.

### 24.2 Metrics
Numeric, aggregable measurements (latency histograms, Job throughput, cache hit rate) emitted alongside Events without requiring a full Event Store write for high-frequency operational data — metrics favor cheap aggregation over durability.

### 24.3 Tracing
Every Job, Command, and Automation run carries a Trace ID propagated through every step it touches, including into Provider calls and Plugin invocations. Tracing is what makes the Execution Graph (Section 12.3) and the Observability dashboards (Section 15) possible.

### 24.4 Caching
Two independent caching layers exist by design and are never conflated: the Provider Router's response cache (Section 11.7, correctness-sensitive, keyed on exact prompt content) and the Query projection cache (Section 26.2, freshness-sensitive, invalidated on new Events).

### 24.5 Configuration
Layered configuration resolution: platform defaults → Organization-level settings → Project-level settings → user-local overrides, each layer able to override the one before it. Configuration is itself versioned and changes to it are recorded as Events, consistent with the Memory-first Philosophy.

### 24.6 Secrets
Credentials (Provider API keys, Plugin OAuth tokens) are held in an encrypted local Secrets store, never in Configuration, never in logs, and never passed into Agent prompt context — only opaque handles are passed to the code paths that need to make authenticated calls (Section 15.9).

### 24.7 Localization
All user-facing strings are resolved through a localization layer keyed by locale, with Egyptian Arabic and other RTL locales as first-class targets, not an afterthought — RTL layout mirroring is a Design System token concern (Section 25.9), not a per-component hack.

### 24.8 Accessibility
Every Design System component (Section 25) meets WCAG 2.1 AA at minimum: full keyboard operability, screen-reader-appropriate semantics, and color contrast tokens that are enforced, not merely suggested, at the token-definition level.

### 24.9 Feature Flags
Every new capability ships behind a Project- or Organization-scoped flag, resolved through the same Configuration layering (24.5), allowing staged rollout and instant kill-switching without a deploy.

### 24.10 Rate Limiting
Applied at two levels: outbound (the Provider Router's rate limiting per provider, Section 11.6) and inbound (protecting the Application Layer's API from any single Plugin or Automation issuing an excessive Command volume, with per-actor limits enforced at the API boundary).

### 24.11 Resilience, Timeouts, and Circuit Breakers
Every outbound call (Provider, Plugin Action, external Marketplace fetch) carries a declared timeout. Repeated failures against a specific Provider or Plugin endpoint trip a circuit breaker, which stops issuing new calls to that endpoint for a cooldown window and fails fast instead of queuing up doomed retries — protecting overall system responsiveness even when one dependency is unhealthy.

### 24.12 Retry Policies
Governed by Section 23.4: retry eligibility is a property of the error type, and retries always use exponential backoff with jitter and a declared maximum attempt count, never unbounded retry loops.

### 24.13 Graceful Degradation
The system's default posture on partial failure is to preserve and surface whatever succeeded rather than discard it — this principle recurs throughout Section 13's per-Agent Failure Recovery definitions and is codified here as a platform-wide default any new Agent or Plugin must follow unless explicitly justified otherwise.

### 24.14 Error Handling and Validation
Governed by Section 9.8 (structural + semantic validation) and Section 23 (Error Architecture) in full.

### 24.15 Auditing
The Audit Log (Section 7.2) is a filtered projection of the Memory Timeline, not a separately-maintained log — this guarantees the audit trail can never drift from what actually happened, since both are views over the identical Event Store.

### 24.16 Security
Governed in full by Section 27.

### 24.17 Privacy
Project data is local-first by default (ADR-004); Cloud Sync is opt-in and encrypted in transit and at rest. Plugins can only access the specific data categories their granted Permissions cover (Section 15.5), and no Plugin, Agent, or Automation can export Project data to an external destination without that capability being an explicit, user-approved permission grant.

### 24.18 Telemetry
Aggregate, anonymized product usage telemetry (which Workspaces are used, which Agents run most often) is opt-in at the Organization level, entirely separate from Project content data, and never includes Knowledge, Asset content, or Memory Timeline entries.

### 24.19 Health Checks
The Execution Kernel (24.20/Section 10.8), the Provider Router (Section 11.6), and each installed Plugin expose a health status consumed by the Diagnostics surface — a Plugin that fails its health check is automatically flagged in the UI before a user hits a confusing runtime failure.

### 24.20 Diagnostics
A dedicated internal surface (accessible from Settings) aggregating queue depth, Worker utilization, Provider health, Plugin health, and Storage integrity checks — the operational counterpart to the product-facing Observability dashboards in Section 15, intended for troubleshooting rather than daily use.


---

## 25. Storage Architecture

Storage is deliberately polyglot: each store is chosen for the access pattern it serves, not forced into a single technology.

### 25.1 Relational Store (SQLite)
Holds structured, transactional data: Projects, Organizations, Teams, Members, Jobs, Asset metadata, Cost Tracking records, and denormalized Query projections. SQLite is chosen specifically because it enables genuine offline-first operation with zero external server dependency.

### 25.2 Graph & Vector Store (Local)
Holds the Knowledge Graph, the AssetGraph, and embeddings powering semantic retrieval across Knowledge, Assets, and Memory. This store is optimized for relationship traversal and similarity search, patterns the relational store handles poorly.

### 25.3 Event Store
The canonical, append-only source of truth powering the Memory Timeline, the Activity Center, and all rollback/undo capability. The relational store's Query projections are derived *from* the Event Store and can always be rebuilt from it — the Event Store, not the projections, is authoritative.

### 25.4 Blob Storage
Raw media (video, audio, image files) is stored as content-addressed blobs, referenced by Asset metadata rows in the relational store rather than embedded in them — keeping the relational store fast regardless of how much raw media a Project accumulates.

### 25.5 Search Index
A denormalized full-text and metadata index over Assets, Knowledge, and Timeline entries, kept in sync with the Event Store, powering the Global Search experience described in Section 26.

### 25.6 Caching
An in-memory layer in front of both the Query projections and the Provider Router's response cache (Section 11.7), reducing both UI latency and redundant provider spend.

### 25.7 Migration
Schema migrations for the relational store are forward-only, versioned, and applied automatically on application startup against the local database; migrations never require the Event Store to be replayed, since the relational store is only a projection of it. A migration that fails halts startup with a clear diagnostic rather than proceeding against an inconsistent schema.

### 25.8 Backup and Restore
The Event Store is the minimum sufficient backup artifact — backing it up (locally, or via Cloud Sync) is sufficient to fully reconstruct every other store, since everything else is derived. Backup is continuous via Cloud Sync where enabled, and available as an explicit local export otherwise. Restore replays the Event Store into a fresh local database, rebuilding all projections, the vector index, and the Search Index from scratch.

### 25.9 Encryption
Local storage is encrypted at rest using the platform's Secrets-managed key (Section 24.6); Cloud Sync payloads are encrypted in transit and at rest independently, such that the sync provider never holds plaintext Project content.

---

## 26. UI Architecture

ContentCompiler's interface is built to the standard of a premium desktop application, not a web form suite.

### 26.1 Workbench
The top-level shell hosting the Navigation Tree, the active Workspace, and global chrome (Command Palette trigger, Notification Center, account/Organization switcher). The Workbench itself holds no product logic — it is a layout host.

### 26.2 Workspace Lifecycle
A Workspace (Section 7.9) is instantiated when navigated to, hydrated from its relevant Query projections, and torn down (releasing subscriptions, not data) when navigated away from — Workspace switching is designed to be near-instant because it never re-fetches from the Event Store directly, only from already-warm Query projections and their live subscriptions.

### 26.3 Canvas
The direct-manipulation surface used by node-based views (Pipeline/Automation visualization, the AssetGraph explorer): pan, zoom, select, and connect, built on a shared canvas primitive so every graph-shaped view in the product behaves identically.

### 26.4 Panels, Inspector, and Docking
Content within a Workspace is composed of dockable Panels; selecting any object opens its details in the Inspector, a consistent right-hand panel across every Workspace and every Plugin-contributed Panel. Docking layout (which Panels are visible, and where) is per-Workspace, per-user state — UI State (Section 22.1), not synced Project data.

### 26.5 Layout Engine
A constraint-based docking layout engine manages Panel arrangement, resize, and persistence of the user's preferred layout per Workspace. The layout engine is a shared primitive in `ui-components` (Section 6.3), used identically by first-party Workspaces and Plugin-contributed Workspaces (Section 14.7).

### 26.6 Navigation and Window Management
The Navigation Tree (Projects, Brand & Knowledge, Research, Strategy, Blueprints, Ideas, Production, Assets, Calendar, Publishing, Analytics, Memory, Agents, Jobs, Plugins, Settings) is the primary structural navigation. On Desktop, window management follows native OS conventions per platform (Section 33.4) rather than a custom in-app window model.

### 26.7 Selection Model
A single, consistent selection model spans every list, graph, and grid view in the product: click to select, shift-click to range-select, cmd/ctrl-click to multi-select, with the current selection driving what the Inspector displays — implemented once in `ui-components` rather than per-view.

### 26.8 Keyboard Shortcuts
Every primary action reachable from the Command Palette (26.10) also has a discoverable keyboard shortcut, resolved through a single global keymap registry that Plugin-contributed Commands (Section 15.8) register into as well, avoiding shortcut collisions between first-party and Plugin functionality.

### 26.9 Accessibility
Covered fully in Section 24.8; enforced at the shared component level in `ui-components`, not re-implemented per Workspace.

### 26.10 Global Command Palette (⌘K / Ctrl+K)
The universal entry point: search everything, generate, run an Agent, open a Project, switch Workspace, execute an Automation, or launch a Job — all from a single keystroke, without navigating a menu tree.

### 26.11 Global Search
Instant search across Projects, Knowledge, Ideas, Scripts, Assets, Blueprints, Plugins, Memory, Jobs, and Analytics, backed by the Search Index (Section 25.5).

### 26.12 Notification & Activity Center
A global hub surfacing Execution History, Recent Jobs, Errors, Warnings, pending Approvals, Logs, and Timelines — the single place to answer "what has the system been doing."

### 26.13 Theme System
Themes are resolved from the Design System's token layer (Section 27) with Light and Dark mode as the two first-party themes; Plugin-contributed themes (Section 27.9) plug into the identical token contract.

### 26.14 Human-in-the-loop UI
Review is a dedicated, first-class UI mode — not a modal interruption. A pending draft opens in a Diff View with Approve, Reject, and Edit actions directly available, and rejecting or editing feeds immediately back into the originating Agent's context for its next attempt. Automation Human Approval nodes (Section 18.8) use this identical view.

---

## 27. Design System Architecture

### 27.1 Design Tokens
The atomic layer: color, spacing, typography scale, radius, and elevation values, defined once and consumed by every component — never a hardcoded value inside a component implementation.

### 27.2 Components and Variants
Every UI primitive (button, input, panel, table) is defined with an explicit, closed set of variants (e.g., a button's `primary`/`secondary`/`destructive` variants) rather than open-ended prop combinations, keeping the visual language finite and learnable.

### 27.3 Icons
A custom, consistent icon set (`packages/icons`, Section 6.4) drawn at a single stroke weight and grid, versioned alongside the Design System so icon and component visual language never drift apart.

### 27.4 Animation and Motion
Motion is token-driven (duration, easing curves) rather than ad hoc per-component, with a small, deliberate vocabulary of motion patterns (panel enter/exit, node connection draw, streaming-token reveal) reused everywhere that pattern of interaction recurs.

### 27.5 Spacing and Typography
An 8-point spacing scale and a constrained typographic scale (a small number of defined sizes/weights) are the only values components are permitted to use, enforced via the token layer rather than convention alone.

### 27.6 Elevation
A defined set of elevation levels (flat, raised, floating, modal) map to consistent shadow/border tokens, used to communicate the Panel/Inspector/Modal hierarchy consistently across Light and Dark themes.

### 27.7 Dark Mode
Dark Mode is not an inverted color filter — it is an independently-authored token set tuned for the same perceptual contrast and hierarchy as Light Mode, resolved through the same Theme System (26.13).

### 27.8 Theme Inheritance
A theme is a complete token set; a Plugin or Marketplace theme (27.9) can either fully replace the active token set or extend a base theme by overriding a subset of tokens, with unset tokens falling back to the base theme rather than an undefined value.

### 27.9 Plugin Theming
Plugin-contributed UI Panels consume the active theme's tokens exactly as first-party Panels do (Section 27.1) — this is what makes a well-built Plugin visually indistinguishable from core product surfaces, directly serving the Plugin-first Philosophy (2.13).


---

## 28. Observability

Observability exists so that autonomous Agent behavior is never a black box.

### 28.1 Execution Graph
A live, visual rendering of a running Job's internal Pipeline — which step is active, which have completed, which failed — sourced directly from the Kernel's Event stream (Section 10.7, Section 21.2).

### 28.2 Job & Provider Timelines
Chronological views of every Job and every Provider call within a Project, each expandable to its full trace: inputs, outputs, tokens, latency, and cost.

### 28.3 Logs, Metrics, and Tracing
Structured logs and metrics are queryable by Trace ID, Project, Agent, or time range, allowing a specific failure to be isolated without wading through unrelated activity. See Section 24.1–24.3 for the underlying cross-cutting implementation.

### 28.4 Dashboards
The **Cost Dashboard** aggregates spend by Project, Agent, and time. The **Latency Dashboard** surfaces provider and Pipeline performance trends. The **Error Dashboard** surfaces failure rate and root cause by Agent, Provider, and Plugin. All three read from the same Event stream that powers the Memory Timeline — observability data is never a separate, drifting source of truth.

---

## 29. Security Architecture

### 29.1 Identity
Every actor — human Member, Agent, or Plugin — has a distinct identity. Every Command records who initiated it. There is no anonymous mutation path anywhere in the system.

### 29.2 Permissions and RBAC
Roles (Owner, Admin, Editor, Reviewer, Viewer) grant only what they explicitly state (Section 7.2), assignable at the Organization level and scopeable per-Project. RBAC checks happen at the Application Layer before any Domain logic runs (Section 8.8), never as an afterthought at the Presentation Layer.

### 29.3 Plugin Isolation
Covered fully in Section 15.6 (Sandbox): no filesystem access, no cross-Plugin access, no ambient network access outside declared Action endpoints.

### 29.4 Secret Storage
Covered fully in Section 24.6: encrypted local Secrets store, opaque handles only ever exposed to code, raw values never entering logs, prompts, or Agent context.

### 29.5 Encryption
Local storage encryption and Cloud Sync transit/at-rest encryption are covered in Section 25.9. Key material itself is managed through the platform's Secrets subsystem, never hardcoded or stored alongside the data it protects.

### 29.6 Audit Logs
The Audit Log (Section 24.15) is a direct, complete projection of the Memory Timeline filtered to identity- and permission-relevant Events — because every mutation is a Command producing an Event (Section 8, Section 21), the Audit Log cannot silently omit an action the way a hand-maintained log could.

### 29.7 Trust Boundaries
Four concentric trust boundaries exist: (1) the Domain/Application core, fully trusted; (2) first-party Infrastructure and Kernel code, trusted but isolated by layering (Section 5); (3) installed Plugins, sandboxed and permissioned per-capability (Section 15); (4) external Providers and Marketplace content, treated as untrusted network input and validated at every ingress point (manifest validation, Provider response schema checks).

### 29.8 Attack Surface
The primary attack surfaces are: the Plugin sandbox boundary (mitigated by 29.3), the Marketplace ingestion pipeline for third-party Blueprints/Plugins (mitigated by manifest validation and, for public listing, review — Section 17.7), and Cloud Sync's network transport (mitigated by end-to-end encryption, Section 25.9). Each is explicitly owned and independently hardened rather than relying on a single perimeter defense.

### 29.9 Threat Model
The platform assumes: a malicious or buggy Plugin will attempt to exceed its granted permissions (defended by sandboxing and per-call permission checks, not just install-time consent); a compromised Provider response may attempt prompt injection against an Agent (defended by the strict separation between Agent-generated Commands and their required Application Layer authorization — an injected instruction cannot itself grant a Permission it lacks); and a Marketplace listing may misrepresent its own manifest (defended by validation, and by the fact that installed capability is strictly bounded by the granted permission set regardless of what the listing claims).


---

## 30. Performance Architecture

### 30.1 Cold Start
Application startup prioritizes rendering the Workbench shell and the last-active Workspace's cached Query projections before any background reconciliation (Event replay catch-up, index refresh) begins — the user sees a responsive app before the system has necessarily finished fully syncing.

### 30.2 Memory Usage
Workers are stateless and short-lived per Job (Section 10.3), bounding per-Job memory growth; the vector and Search indexes are memory-mapped rather than fully loaded, so index size scales with Project history without a proportional increase in resident memory.

### 30.3 Caching
Governed by Section 24.4 — Provider response caching and Query projection caching are the two dominant performance levers, both invalidated correctly rather than time-boxed guesses.

### 30.4 Virtualization
Any list or grid view capable of exceeding a few hundred rows (Timeline, Asset library, Job history) is virtualized at the rendering layer — only visible rows mount, regardless of how many years of Project history exist underneath.

### 30.5 Lazy and Incremental Loading
Workspaces, Panels, and Plugin-contributed surfaces are code-split and loaded on first navigation, not at application startup; large Asset content (video/audio blobs) loads progressively, with the Inspector showing metadata immediately while the blob streams in.

### 30.6 Background Indexing
Embedding generation (Section 20.3) and Search Index updates (Section 25.5) run as low-priority Background Jobs (Section 10.2), never blocking the interactive path that created the underlying Event.

### 30.7 Scheduling and Rendering
The Kernel's per-Project fairness scheduling (Section 10.1) exists specifically so that background indexing or a scheduled Automation never starves an interactive Job the user is actively waiting on; on the rendering side, the UI's own frame budget is protected by keeping all Job/Automation execution off the main render thread entirely.

### 30.8 Optimization Strategy
Performance work is prioritized by user-perceived latency on Interactive Jobs first, Foreground Jobs second, and Background/Batch throughput third — matching the Job Class priority model (Section 10.2) rather than optimizing uniformly across all paths.

---

## 31. Scalability Strategy

### 31.1 Horizontal Scaling (Today)
Within a single local installation, the Execution Kernel's Worker pool scales with available local CPU/network concurrency, and per-Project fairness (Section 10.1) ensures scaling headroom is shared fairly across a user's Projects.

### 31.2 Vertical Scaling (Today)
Deeper capability per Project — more Agents active, more Automations, more Plugins — is bounded only by Provider budget (Section 11.3) and local Worker concurrency, never by an architectural ceiling on how many Agents/Plugins a single Project can have configured.

### 31.3 Cloud Migration Path
Because the Execution Kernel is already isolated from product concepts (ADR-003) and communicates only through Jobs and Events, migrating Worker execution to a remote, cloud-hosted pool is an infrastructure change to the Kernel's Worker implementation — the Application Layer, Domain, and every Agent definition are unaffected, since they never depended on Workers running locally in the first place.

### 31.4 Remote Workers and Distributed Execution
A future remote Worker pool subscribes to the same durable Job Queue contract (Section 10.1) a local Worker does; Jobs dispatched from a Project remain scoped and fairness-limited identically whether served by a local or remote Worker, since scheduling logic doesn't distinguish between them beyond a declared execution locality preference (useful for keeping sensitive local-only Projects from ever dispatching to remote Workers).

### 31.5 Future Web Architecture
A Web client is, per the API-first Philosophy (2.12), simply a new Presentation Layer implementation calling the identical Application Layer contract the Desktop app uses — no new backend logic, only a new rendering surface with server-hosted (rather than local) Application Layer and storage.

### 31.6 Future Mobile Architecture
The same reasoning applies to Mobile: a lighter-weight Presentation Layer, likely favoring Cloud Sync as its primary storage mode (since mobile devices are less suited to being a Project's canonical local store) rather than Desktop's local-first default — an explicit, intentional deviation permitted because Cloud Sync (Section 22.7) was designed as a first-class replication mode, not a bolt-on.

### 31.7 Future SaaS/Enterprise Architecture
A hosted, multi-tenant SaaS deployment is architecturally a cloud-hosted instantiation of the same Application Layer, Execution Kernel, and Storage contracts, with Organization-level isolation (already present in the Domain model, Section 7.2) extended to full tenant isolation at the infrastructure level — this is additive infrastructure work, not a redesign of product logic, precisely because Section 5's dependency rules kept product logic ignorant of where it's physically hosted.

---

## 32. Testing Strategy

### 32.1 Unit Tests
Cover the Domain layer (Section 7) exhaustively, since it has zero external dependencies — every invariant (7.11) has a corresponding test proving it's enforced regardless of caller.

### 32.2 Integration Tests
Cover Application Layer Use Cases against a real local SQLite/Event Store instance, verifying Commands produce the correct Events and Query projections update correctly — the CQRS boundary (Section 8.4) is exactly where integration tests concentrate.

### 32.3 Contract Tests
Every DTO, Command, Query, and Event schema (Section 9) has a contract test verifying its shape hasn't silently changed; these run against both first-party consumers and the published Plugin SDK client, catching breaking changes before they reach a version boundary (Section 9.5).

### 32.4 End-to-End Tests
Drive the full stack — Presentation through Kernel through Storage — for the platform's critical paths (Section 17's roadmap Exit Criteria are largely expressed as E2E scenarios): create a Project, run an Agent, review and approve output, publish it.

### 32.5 Golden Tests
For Agent output quality specifically: a fixed set of Project/Knowledge fixtures with known-good historical outputs, run against each Agent's Pipeline on every change to detect quality regression, not just functional breakage.

### 32.6 Snapshot Tests
Cover Design System components (Section 27) and shared `ui-components`, catching unintended visual regressions across Light/Dark themes.

### 32.7 Agent Tests
Beyond Golden Tests, each Agent (Section 13) has tests verifying its declared Permissions are actually enforced (it cannot commit an action outside its Trust Model, Section 12.11) and its Failure Recovery behavior matches its specification.

### 32.8 Plugin Tests
The Plugin SDK ships a conformance test suite third-party developers run against their own Plugin — verifying manifest validity, sandbox compliance, and permission-scope correctness before a Plugin is eligible for Marketplace listing.

### 32.9 Load Tests
Exercise the Execution Kernel's Scheduler and Worker pool under high Job volume and concurrent multi-Project fairness contention, verifying the per-Project fairness guarantee (Section 10.1) holds under load rather than only in isolation.

### 32.10 Performance Tests
Track cold start time, Workspace switch latency, and large-Project (multi-year Timeline) query latency as tracked regression benchmarks, not one-off measurements.

### 32.11 Architecture Tests
Automated checks enforcing the Dependency Rules (Section 5) at build time — a Presentation-layer import of a Domain type, for example, fails the build immediately rather than surviving to code review as a discretionary catch.

---

## 33. Documentation Standards

### 33.1 Repository Layout
Documentation lives alongside the code it describes: package-level READMEs for `apps/*`, `packages/*`, `plugins/*`, `blueprints/*`, and `sdks/*` (Section 6), with this Master Architecture Document as the sole cross-cutting reference linked from every package README rather than duplicated into them.

### 33.2 Naming Conventions
Packages, Commands, Queries, and Events follow consistent casing and naming patterns established in Section 9 (`VerbNoun` for Commands, `GetNoun`/`ListNoun` for Queries, past-tense `NounVerbed` for Events) — consistency here is what makes the API contract learnable without a lookup table.

### 33.3 Markdown Standards
All documentation is Markdown, using the same heading hierarchy conventions as this document (H2 for major sections, H3 for subsections), with code/config examples fenced and labeled by language.

### 33.4 ADR Usage
Any decision of comparable weight to those in Section 3 is documented as a new numbered ADR appended to that section, using its exact Context/Decision/Alternatives/Tradeoffs/Rejection-Reasoning form — this is not optional for load-bearing architectural choices.

### 33.5 Decision Documentation
Smaller, package-scoped decisions that don't rise to ADR weight are documented in that package's own README under a "Design Notes" heading, cross-referenced back to the relevant Master Architecture Document section rather than restating it.

### 33.6 Versioning
This document itself is versioned alongside major platform Milestones (Section 34); a Milestone is not considered complete until this document accurately reflects the architecture it shipped.

### 33.7 Contribution Rules
A change that alters anything described in this document — a new Agent, a new Plugin surface, a changed dependency rule — requires this document to be updated in the same change set, not as a follow-up; documentation drift is treated as a build-blocking defect, not a backlog item.


---

## 34. End-to-End Execution Flow

A single walkthrough, tying every layer together:

1. **User Action** — A user interacts with the UI or the Command Palette, expressing intent (e.g., "generate ideas from this week's research").
2. **Application Layer API** — The Presentation Layer dispatches a Command through the Application Layer's internal API; no direct state mutation occurs in the UI itself.
3. **Orchestration** — The Application Layer validates and authorizes the Command, updates canonical state where applicable, and dispatches a Job to the Execution Kernel for anything requiring Agent work.
4. **Kernel Queue** — The Execution Kernel enqueues the Job, assigns it to an available Worker, and begins tracing it.
5. **Agent Execution** — The Worker loads the target Agent's Internal Pipeline, and the Application Layer assembles exactly the Knowledge and Memory context that Pipeline requires (Section 20.5).
6. **Provider Communication** — Each Pipeline step requiring inference calls the Intelligent Provider Router, which selects a provider, manages streaming, and enforces budget and caching policy.
7. **Live Observability** — As Pipeline steps complete, Events stream to the UI in real time, rendering the live Execution Graph (Section 28.1).
8. **Human Review** — If the Job's output requires approval (per the Agent's Trust Model, Section 12.11), execution pauses and the output enters the Review queue with Approve, Reject, and Edit options.
9. **Memory Commit** — On approval (or on completion of an Agent whose output doesn't require review), the result commits to the Memory Timeline as an immutable Event, updating every downstream projection — Search Index, Cost Dashboard, AssetGraph — consistently.

---

## 35. Roadmap: Platform Milestones

The roadmap is organized around comprehensive platform capability, not isolated feature phases. Each Milestone must be genuinely usable end-to-end before the next begins.

### Milestone 1 — Foundation Platform
- **Goal:** Establish the architectural skeleton every later Milestone depends on.
- **Architecture:** Application Layer (Commands/Queries/Use Cases), Execution Kernel (Queue, Worker, basic retry), SQLite relational store, foundational Design System tokens, Dependency Rules enforced via Architecture Tests (Section 32.11) from day one.
- **Deliverables:** A working Project boundary, Command Palette shell, and one end-to-end Job execution path (dispatch → run → complete → Timeline entry).
- **Dependencies:** None — this is the root Milestone.
- **Risks:** Under-scoping the Application Layer's contract now creates expensive rework later; the layering discipline (Section 4.6) must be enforced from the first commit.
- **Exit Criteria:** A Project can be created, a single Job can run end-to-end through the Kernel, and its result is visible in the Memory Timeline.

### Milestone 2 — Knowledge Platform
- **Goal:** Give the system persistent understanding of a Project's brand and world.
- **Architecture:** Knowledge Graph store, Research Agent, Memory Timeline (full Event Store), Global Search foundation, Embedding Pipeline (Section 20.3).
- **Deliverables:** Working Knowledge Graph CRUD via the Application Layer, a functioning Research Agent producing Knowledge proposals, a browsable Memory Timeline.
- **Dependencies:** Milestone 1's Application Layer and Kernel.
- **Risks:** Knowledge Graph schema decisions made here are costly to migrate later; validate the schema against Strategy and Idea Agent needs (Milestone 4) before finalizing.
- **Exit Criteria:** A user can research a topic, review proposed Knowledge updates, and see accepted updates reflected across the Project.

### Milestone 3 — Content Platform
- **Goal:** Enable actual content production with human oversight.
- **Architecture:** Production Workspace, full Asset System and Prompt Asset Graph, Human-in-the-loop Review system, Error Architecture (Section 23) fully wired.
- **Deliverables:** Script Agent and QA Agent operating end-to-end, a working Diff Review UI, versioned Asset storage.
- **Dependencies:** Milestone 2's Knowledge Graph for voice/context grounding.
- **Risks:** Review UX complexity is easy to underestimate; a clunky Review flow undermines the entire Human-in-the-loop Philosophy (2.17).
- **Exit Criteria:** A user can go from an Idea to an approved, versioned Script Asset entirely inside the product.

### Milestone 4 — AI Platform
- **Goal:** Make the Agent ecosystem and automation genuinely autonomous where trusted.
- **Architecture:** Automation Engine (Section 18), full Agent Ecosystem expansion (Section 13) built on the generic Agent Framework (Section 12), Visual Workflow Builder, deep Command Palette integrations.
- **Deliverables:** All fourteen Agents operational, user-composable Automations, live Execution Graph observability.
- **Dependencies:** Milestones 1–3 for the Kernel, Knowledge, and Asset foundations every Agent relies on.
- **Risks:** Automation complexity is real; ship the visual builder with tight scope constraints (bounded loops, Section 18.6) before generalizing it.
- **Exit Criteria:** A user can configure a trigger-based Automation that runs multiple Agents in sequence with correct Human Review checkpoints.

### Milestone 5 — Growth Platform
- **Goal:** Open the platform to third-party extension and team-scale usage.
- **Architecture:** Marketplace, Plugin & MCP Ecosystem (Section 14–15), Blueprint Specification (Section 17), Publishing Plugin integrations, Organization/Team architecture, Analytics.
- **Deliverables:** A public Plugin SDK, a functioning Marketplace with install flows, multi-member Organizations with Roles and Permissions, an Analytics Agent feeding real platform data back into Strategy.
- **Dependencies:** Milestone 4's Automation Engine (Plugins hook into it), Milestone 1's Application Layer (Plugin SDK is a thin client over the same internal API, per ADR-005).
- **Risks:** Plugin sandboxing and permissioning (Section 15.6) must be correct from the first public release — retrofitting security boundaries after third parties have shipped Plugins is far more costly than designing them in from the start.
- **Exit Criteria:** A third-party Plugin can be installed, granted scoped permissions, and successfully publish content through the Publishing Agent, with its activity fully visible in Observability and the Cost & Usage System.

---

## 36. Migration Strategy from V1

1. Isolate V1's Domain and Validators as the seed for the new Domain Layer — they contain real, tested business rules worth preserving even as everything around them is rebuilt.
2. Introduce the Application Layer as the new, sole entry point for all state mutation, retiring any direct-write code paths immediately rather than incrementally.
3. Repurpose V1's Pipelines strictly as internal Agent execution graphs (Section 13) — never re-expose them as user-facing workflows, which is the exact confusion this architecture eliminates by drawing a hard line at the Automation Engine (Section 18).
4. Extract V1's Providers into the Intelligent Provider Router and the Plugin System, replacing ad hoc provider-specific code with the unified routing contract (Section 11).
5. Fully retire V1's Runtime concept, replacing it end-to-end with the Execution Kernel (Section 10) — no hybrid state where both concepts coexist, per ADR-003.

**What to KEEP:** Domain-Driven Design principles; Contracts and Value Objects; validation schemas; existing Pipeline logic, repurposed strictly as internal Agent execution graphs.

**What to REFACTOR:** `providers` into the Intelligent Provider Router and Plugin System; `runtime` into the Execution Kernel; all ad hoc state management into the Application Layer and Event Store.

**What to DELETE:** Hardcoded user-facing workflows; CLI drivers and text-based output paths; any architectural boundary that lets the Runtime dictate user flow or bypass the Application Layer.

**What to BUILD from scratch:** The Application Layer and its internal API contracts; the Design System, Command Palette, and Activity Center; the Visual Workflow Builder, Automation Engine, and Prompt Asset Graph; the Execution Kernel orchestrator, Provider Router, and Observability layer; MCP and Workspace SDK integration; the full Cross-Cutting Concerns implementation (Section 24), which V1 lacked entirely.

---

## 37. Future Vision: The Ten-Year Horizon

ContentCompiler is not a tool a team opens to generate something and closes when they're done. It is the place a team's entire content operation lives, permanently — the way an IDE holds a codebase, or Figma holds a design system. The architecture in this document is deliberately shaped so that every stage of this horizon is additive infrastructure and product surface, never a redesign of what came before — a direct consequence of the strict layering (Section 4), the Kernel/product isolation (ADR-003), and the API-first contract (Section 2.12, Section 8.7) that every future surface builds on.

### 37.1 A Complete Content Operating System
A user opens the desktop app, presses `⌘K`, and installs a Blueprint from the Marketplace in seconds. The Automation Engine notices a shift in Analytics and triggers the Strategy Agent. The Execution Kernel schedules the work quietly in the background, routing every call through the Intelligent Provider Router for the right balance of cost, latency, and quality. The user watches the Pipeline unfold in the Observability suite, and steps in through Human-in-the-loop review to refine a hook in the Diff View.

### 37.2 Marketplace Ecosystem
The Marketplace matures from a first-party distribution channel into a genuine third-party economy — independent developers publishing Plugins, agencies publishing Blueprints for their specific verticals, and prompt engineers publishing Prompt Packs — all validated through the identical manifest and permission model (Section 15, Section 17) that governed the very first first-party Plugin, per ADR-005's guarantee that this path was never a second-class one.

### 37.3 Enterprise Platform
Organizations (Section 7.2) scale from a handful of Members to enterprise-scale teams with fine-grained Role delegation, SSO-integrated identity, per-Project data residency controls, and Organization-wide Audit Logs — all extensions of the identity and permission primitives already present in the Domain model, not a bolted-on enterprise tier with parallel logic.

### 37.4 Team Collaboration Platform
Cloud Sync (Section 22.7) evolves from single-user cross-device continuity into real-time multi-user collaboration within a Project — concurrent editing of Knowledge and Assets, live-visible teammate presence in the Workbench — built on the same Event-sourced conflict resolution model (Section 22.8) already required for offline sync, rather than a separate real-time collaboration engine.

### 37.5 Automation Platform
The Automation Engine (Section 18) grows from single-Project trigger flows into cross-Project, Organization-wide automation — a Blueprint's default Automations becoming reusable, publishable Workflow Packs (Section 16.5) in their own right, still composed from the exact same Node/Edge primitives defined on day one.

### 37.6 AI Operating Platform
The Agent Ecosystem (Section 13) grows beyond content-specific Agents into a general extensible workforce, with the Agent Framework (Section 12) as the stable contract third-party Agent developers build against — exactly as the Plugin SDK opened Plugin development, an eventual Agent SDK opens Agent development, without altering the Trust Model or Review Model that keeps every Agent, however it was authored, accountable to a human.

### 37.7 The Constant Across All of It
Every action, every prompt asset, and every rejected script is permanently recorded in the Memory Timeline — not as a log file no one reads, but as the living, queryable history of how the brand's narrative was built. This is the one property that does not change as the platform grows from a single desktop app to an enterprise-scale AI operating platform: API-first, Project-centric, memory-first, human-governed, and endlessly extensible, built to be the durable operating system for how companies think, create, and remember, for the next decade and beyond.

---

## 38. Engineering Reference Appendix

This appendix is the concrete, lookup-oriented companion to Sections 1–37. Where the body of this document explains *why* the architecture is shaped the way it is, this appendix specifies *exactly* what exists: every catalogued Command, Event, Error, manifest field, and numeric target an engineer needs to build against without inference. Nothing in this appendix introduces a new architectural decision — every entry here is a direct, exhaustive specification of a concept already established in the body, cross-referenced back to its governing section.

**Governing Principle:** ContentCompiler is a generic AI Platform. The Platform Core defines behavior in terms of platform-level abstractions — Artifacts, Revisions, Workflows, Jobs, Knowledge, Automations, Plugins, and Blueprints — never in terms of any single business domain (content, marketing, publishing, etc.). Domain-specific behavior (scripts, publishing, analytics, video production) is contributed exclusively by Blueprints and Plugins through the extension mechanisms defined in Sections 14–18. Wherever a domain-specific example appears in this appendix, it is explicitly labeled as an **Example Blueprint Contribution** or **Example Plugin Extension** and must never be confused with the Platform Core specification.

### 38.1 ADR Index

| ID | Title | Governs |
|---|---|---|
| ADR-001 | Strict Layered Architecture (Presentation → Application → Domain) | Section 4, Section 5 |
| ADR-002 | Event Sourcing for the Memory Timeline | Section 21, Section 25.3 |
| ADR-003 | Execution Kernel Isolated from Product Concepts | Section 10, Section 31.3 |
| ADR-004 | Local-First Storage with Optional Cloud Sync | Section 22.7, Section 25 |
| ADR-005 | Plugins and First-Party Integrations Share One SDK | Section 14, Section 15 |
| ADR-006 | Agents Interact Only Through the Application Layer | Section 12.6, Section 29.9 |
| ADR-007 | CQRS Split Between Commands/Queries | Section 8.4, Section 9 |

Any future decision of comparable architectural weight is appended here as ADR-008 and beyond, per the ADR Usage standard (Section 33.4). No ADR is ever renumbered or removed once published — a reversed decision is recorded as a new ADR that supersedes the prior one by reference, preserving the historical record.

### 38.2 Dependency Matrix (Full)

This restates and extends Section 5.3 to package granularity (Section 6), replacing layer names with concrete packages.

| From \ To | core | application | execution-kernel | agent-engine | plugin-engine | design-system | ui-components | apps/desktop |
|---|---|---|---|---|---|---|---|---|
| core | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| application | ✅ | — | ✅ (dispatch only) | ❌ (via kernel only) | ✅ (interface only) | ❌ | ❌ | ❌ |
| execution-kernel | ❌ | ❌ (events only) | — | ✅ | ❌ | ❌ | ❌ | ❌ |
| agent-engine | ✅ | ❌ (via kernel) | ❌ | — | ❌ | ❌ | ❌ | ❌ |
| plugin-engine | ❌ | ✅ (interface only) | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| design-system | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| ui-components | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — | ❌ |
| apps/desktop | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | — |

A ✅ marked "interface only" or "dispatch only" means the dependency is permitted exclusively through the narrow contract named — a direct import of the target package's internals is forbidden even where a ✅ appears. This table is enforced by the Architecture Tests defined in Section 32.11; any import violating a ❌ cell fails the build.

### 38.3 Package Ownership Matrix

This matrix is the authoritative registry of every package defined in Section 6. If a package exists in Section 6 but is absent here, or exists here but is absent in Section 6, the document is inconsistent and must be corrected before implementation proceeds.

| Package | Owning Team | Responsibility (Section) | Public API Surface |
|---|---|---|---|
| `apps/desktop` | Desktop/Platform | 6.1 | None (leaf app) |
| `packages/design-system` | Design Systems | 6.2 | Tokens, theme provider, motion primitives |
| `packages/ui-components` | Design Systems | 6.3 | Component library, layout engine |
| `packages/icons` | Design Systems | 6.4 | Icon components |
| `packages/application` | Platform/Core | 6.5 | Command/Query/Use Case contract |
| `packages/core` | Platform/Core | 6.6 | Domain types, validators |
| `packages/execution-kernel` | Execution/Infra | 6.7 | Job dispatch interface, Event subscription, Event Bus |
| `packages/agent-engine` | AI/Agents | 6.8 | Agent registration interface, Pipeline format |
| `packages/plugin-engine` | Platform/Extensibility | 6.9 | Plugin SDK, Sandbox supervisor, MCP Registry |
| `plugins/core-plugins` | Integrations | 6.10 | N/A (consumer of plugin-sdk) |
| `blueprints/core-blueprints` | Product/Domain | 6.11 | N/A (consumer of Blueprint manifest schema) |
| `sdks/plugin-sdk`, `sdks/mcp-sdk` | Platform/Extensibility | 6.12 | Full public developer-facing API |

**Note on sub-capabilities within packages:** Several body sections reference internal engines — the Layout Engine (Section 26.5) within `ui-components`, Observability tracing (Section 24) within `execution-kernel`, the Search Index (Section 25.5) built by `application`, and Context Assembly (Section 20.5) within `agent-engine`. These are internal capabilities of their owning packages, not separate packages, and do not require their own rows in this matrix. A capability is elevated to a separate package only when it must be independently versioned and consumed by multiple other packages — this has not been determined necessary for any of the above as of this document version.

### 38.4 Public Package APIs

A package's **Public API** is the subset of its exports that any other package (or, for SDK packages, any third party) is permitted to depend on, versioned per Section 9.5. Public API surfaces:

- `packages/core` — Domain entity types, value objects, validator functions, invariant error types.
- `packages/application` — Command classes, Query classes, Use Case entry points, DTO types.
- `packages/execution-kernel` — `dispatchJob()`, `subscribeToEvents()`, Job status DTOs, Event Bus subscription interface.
- `packages/agent-engine` — `registerAgent()`, Pipeline step definition types, Agent contract interface (Section 12).
- `packages/plugin-engine` / `sdks/plugin-sdk` — manifest types, Action/Trigger/Panel/Command/Storage client APIs (Section 15).
- `packages/design-system` — token exports, `ThemeProvider`, motion primitive functions.
- `packages/ui-components` — all exported components and the layout engine's public hooks.

### 38.5 Internal Package APIs

A package's **Internal API** is used only within that package or by packages explicitly permitted in the Dependency Matrix (38.2), and carries no compatibility guarantee — it may change in any release without a version bump.

- `packages/application` internal: DI container wiring, transaction boundary helpers, Search Index projection builder.
- `packages/execution-kernel` internal: Scheduler, Worker pool manager, retry/backoff policy engine, Observability trace collector.
- `packages/plugin-engine` internal: sandbox process supervisor, permission-scope enforcement checks, MCP discovery resolver.
- `packages/ui-components` internal: layout engine's constraint-solving internals (Section 26.5).
- `packages/agent-engine` internal: Context Assembly pipeline, memory retrieval scoring.

### 38.6 Event Catalog

All Events follow the naming convention `domain.fact_past_tense` (Section 33.2). This catalog specifies the **Platform Core Events** — the events that the platform itself emits as part of its fundamental operation. These events describe generic platform-level behavior (artifacts being created, workflows executing, revisions being reviewed) and do not encode assumptions about any specific business domain.

Blueprints and Plugins contribute additional domain-specific Events through the extension mechanisms defined in Sections 14–18. Those contributed Events follow the identical naming convention and are appended to this catalog when their contributing Blueprint or Plugin is documented, but they are never part of the Platform Core specification.

#### 38.6.1 Platform Core Events

| Event | Category (21.1) | Producer | Consumed By |
|---|---|---|---|
| `project.created` | Domain | Application Layer | Memory Timeline, Search Index |
| `project.archived` | Domain | Application Layer | Memory Timeline, Search Index |
| `artifact.created` | Domain | Application Layer | Memory Timeline, Search Index, AssetGraph |
| `artifact.updated` | Domain | Application Layer | Memory Timeline, Search Index |
| `artifact.deleted` | Domain | Application Layer | Memory Timeline, Search Index, AssetGraph |
| `artifact.version_created` | Domain | Application Layer / Agent | Memory Timeline, AssetGraph |
| `artifact.review_requested` | Domain | Application Layer / Agent | Human Review UI, Activity Center |
| `artifact.review_completed` | Domain | Application Layer (Reviewer) | Memory Timeline, downstream Automations |
| `artifact.indexed` | Domain | Application Layer | AssetGraph, Search Index |
| `artifact.linked` | Domain | Application Layer | AssetGraph |
| `knowledge.diff_proposed` | Domain | Agent (via Application Layer) | Human Review, Memory Timeline |
| `knowledge.diff_accepted` | Domain | Application Layer | Memory Timeline, Context Assembly |
| `knowledge.diff_rejected` | Domain | Application Layer | Memory Timeline |
| `workflow.started` | Automation | Application Layer | Observability, Memory Timeline |
| `workflow.step_completed` | Automation | Execution Kernel | Observability, Memory Timeline |
| `workflow.completed` | Automation | Execution Kernel | Observability, Memory Timeline |
| `workflow.failed` | Automation | Execution Kernel | Activity Center, Error Dashboard |
| `execution.started` | Kernel | Execution Kernel | Observability |
| `execution.step_completed` | Kernel | Execution Kernel | Observability |
| `execution.completed` | Kernel | Execution Kernel | Memory Timeline, Observability |
| `execution.failed` | Kernel | Execution Kernel | Activity Center, Error Dashboard |
| `revision.proposed` | Domain | Agent (via Application Layer) | Human Review UI |
| `revision.approved` | Domain | Application Layer (Reviewer) | Memory Timeline, downstream Agent |
| `revision.rejected` | Domain | Application Layer (Reviewer) | Memory Timeline, originating Agent |
| `revision.edited` | Domain | Application Layer (Reviewer) | Memory Timeline |
| `memory.snapshot_created` | Kernel | Memory Agent | Storage |
| `memory.index_refreshed` | Kernel | Memory Agent | Search, Context Assembly |
| `plugin.installed` | Application | Application Layer | Audit Log |
| `plugin.uninstalled` | Application | Application Layer | Audit Log |
| `plugin.permission_granted` | Application | Application Layer | Audit Log |
| `blueprint.installed` | Application | Application Layer | Memory Timeline, Audit Log |
| `blueprint.migrated` | Application | Application Layer | Memory Timeline |
| `automation.triggered` | Automation | Application Layer | Observability, Memory Timeline |
| `automation.step_completed` | Automation | Execution Kernel | Observability |
| `automation.failed` | Automation | Execution Kernel | Activity Center, Error Dashboard |
| `job.queued` | Kernel | Execution Kernel | Observability, Cost & Usage System |
| `job.step_completed` | Kernel | Execution Kernel | Observability |
| `job.completed` | Kernel | Execution Kernel | Observability, Cost & Usage System |
| `job.failed` | Kernel | Execution Kernel | Observability, Cost & Usage System |
| `worker.crashed` | Kernel | Execution Kernel | Diagnostics |
| `budget.warning_raised` | Kernel | Provider Router | Cost Dashboard, Activity Center |
| `member.invited` | Application | Application Layer | Audit Log |
| `member.role_changed` | Application | Application Layer | Audit Log |

#### 38.6.2 Example Blueprint Contribution Events

The following Events are examples of what a domain-specific Blueprint (such as a Content Marketing Blueprint) might contribute through the Blueprint extension mechanism (Section 17). These are **not** part of the Platform Core — they are contributed by Blueprints and Plugins that register them at install time.

| Event | Contributing Blueprint/Plugin | Description |
|---|---|---|
| `strategy.draft_created` | Content Strategy Blueprint | A strategy document artifact was drafted by the Strategy Agent |
| `idea.generated` | Ideation Blueprint | A new content idea was produced by the Idea Agent |
| `idea.discarded` | Ideation Blueprint | A content idea was rejected during review |
| `script.drafted` | Script Production Blueprint | A script artifact was drafted by the Script Agent |
| `script.voice_flagged` | Script Production Blueprint | A script's tone-of-voice diverged from brand guidelines |
| `publish.attempted` | Publishing Plugin | A publish action was initiated via Plugin Action |
| `publish.succeeded` | Publishing Plugin | An artifact was successfully delivered to an external platform |
| `publish.failed` | Publishing Plugin | A publish delivery failed |
| `analytics.synced` | Analytics Plugin | Performance data was pulled from an external analytics source |
| `analytics.anomaly_detected` | Analytics Plugin | A statistically significant performance deviation was detected |
| `plan.scheduled` | Calendar Planning Blueprint | A calendar entry was scheduled by the Planner Agent |
| `qa.passed` / `qa.flagged` | QA Blueprint | Quality assurance check passed or flagged an issue |

These contributed Events are emitted through the Application Layer's standard Event dispatch mechanism (Section 9.3) and are subject to the same naming conventions, schema versioning, and Memory Timeline recording as Platform Core Events. A Blueprint or Plugin cannot emit an Event whose namespace prefix conflicts with a Platform Core Event prefix — the platform rejects such registrations at install time.

### 38.7 Command Catalog

All Commands follow the naming convention `VerbNoun` (Section 33.2). This catalog specifies the **Platform Core Commands** — the commands that express platform-level intent. Domain-specific commands are contributed by Blueprints and Plugins and are documented separately.

#### 38.7.1 Platform Core Commands

| Command | Issued By | Authorization Required |
|---|---|---|
| `CreateProject` | User | Organization Editor+ |
| `ArchiveProject` | User | Organization Admin+ |
| `CreateArtifact` | User, Agent (via Application Layer) | Project Editor+ |
| `UpdateArtifact` | User, Agent (via Application Layer) | Project Editor+ |
| `DeleteArtifact` | User | Project Editor+ |
| `CreateRevision` | User, Agent (via Application Layer) | Project Editor+ |
| `ApproveRevision` | User (Reviewer role) | Project Reviewer+ |
| `RejectRevision` | User (Reviewer role) | Project Reviewer+ |
| `UpdateKnowledge` | User, Knowledge Agent (propose-only variant) | Project Editor+ |
| `ExecuteWorkflow` | User, Automation | Project Editor+ |
| `ExecuteAutomation` | User, Automation trigger | Project Editor+ |
| `DispatchAgentJob` | User, Automation | Project Editor+, Agent Permission scope |
| `InstallBlueprint` | User | Project Editor+ |
| `InstallPlugin` | User | Project Admin+ |
| `GrantPluginPermission` | User | Project Admin+ |
| `CreateAutomation` | User | Project Editor+ |
| `EnableAutomation` / `DisableAutomation` | User | Project Editor+ |
| `ElevateAgentTrust` | User | Project Admin+ (per Section 12.11) |
| `CancelJob` | User | Project Editor+ (own dispatch) or Admin (any) |
| `InviteMember` | User | Organization Admin+ |
| `AssignRole` | User | Organization Admin+ |

#### 38.7.2 Example Blueprint Contribution Commands

The following Commands are examples of what domain-specific Blueprints and Plugins might contribute. They are registered at Blueprint/Plugin install time and are surfaced in the Command Palette and Automation Action nodes alongside Platform Core Commands, but they are **not** part of the Platform Core specification.

| Command | Contributing Blueprint/Plugin | Description |
|---|---|---|
| `GenerateScript` | Script Production Blueprint | Dispatches the Script Agent to draft a script artifact |
| `GenerateHooks` | Ideation Blueprint | Dispatches the Idea Agent to produce hook variations |
| `PublishToChannel` | Publishing Plugin | Triggers a Plugin Action to deliver an artifact to an external platform |
| `SyncAnalytics` | Analytics Plugin | Pulls performance data from a connected analytics source |
| `ScheduleCalendarEntry` | Calendar Planning Blueprint | Creates a scheduled entry on the content calendar |
| `RunQACheck` | QA Blueprint | Dispatches the QA Agent to validate an artifact against brand guidelines |

Blueprint-contributed Commands pass through the identical Application Layer authorization, validation, and Event-emission pipeline as Platform Core Commands (ADR-006). A Blueprint cannot contribute a Command that bypasses the Application Layer or sidesteps Domain validation — the extension mechanism enforces this structurally, not by convention.

### 38.8 Query Catalog

All Queries follow the naming convention `GetNoun` / `ListNoun` (Section 33.2). Queries operate on generic platform concepts — Artifacts, Workflows, Knowledge, Automations, Plugins, Blueprints, Jobs, and Workspaces — never on domain-specific entity types. Domain-specific filtering and projection logic lives in Blueprint-contributed Query extensions, which compose atop these Platform Core Queries.

#### 38.8.1 Platform Core Queries

| Query | Returns |
|---|---|
| `GetProjectTimeline` | Paginated Memory Timeline entries for a Project |
| `ListArtifacts` | Paginated Artifact DTOs matching filter criteria (type, tag, status, date range) |
| `GetArtifact` | Full Artifact DTO including version history and AssetGraph relationships |
| `GetArtifactGraph` | Relationship graph rooted at a given Artifact (derivation, usage, composition) |
| `SearchKnowledge` | Ranked Knowledge Graph nodes matching a semantic/lexical query |
| `SearchGlobal` | Cross-entity search results spanning Artifacts, Knowledge, Automations, Jobs, and Plugins |
| `GetJobStatus` | Current lifecycle state and step progress for a Job |
| `ListJobs` | Paginated Job DTOs matching filter criteria (status, Agent, time range) |
| `ListPendingRevisions` | Revisions awaiting Human Review for a Project |
| `ListInstalledPlugins` | Plugins installed for a Project with their granted permission scopes |
| `ListInstalledBlueprints` | Blueprints installed for a Project with their current versions |
| `GetBlueprintDiff` | Computed Migration diff between an installed Blueprint version and a newer one |
| `GetCostSummary` | Aggregated spend by Project/Agent/time window |
| `GetProviderHealth` | Current health/latency status per configured Provider |
| `ListAutomations` | Automations defined for a Project with enabled/disabled state |
| `GetWorkflowRunHistory` | Paginated history of Automation and Workflow executions for a Project |
| `GetWorkspaceLayout` | Current layout configuration for a Workspace within a Project |

#### 38.8.2 Example Blueprint Contribution Queries

| Query | Contributing Blueprint/Plugin | Returns |
|---|---|---|
| `ListScheduledEntries` | Calendar Planning Blueprint | Calendar entries with dates, statuses, and linked Artifacts |
| `GetPublishHistory` | Publishing Plugin | Delivery attempts and outcomes for a given Artifact |
| `GetAnalyticsSummary` | Analytics Plugin | Aggregated performance metrics pulled from external sources |
| `ListBrandGuidelines` | Brand Knowledge Blueprint | Brand voice, visual identity, and tone rules for a Project |

### 38.9 Domain Glossary

| Term | Definition | Section |
|---|---|---|
| **Project** | The root ownership boundary; every other entity belongs to exactly one. | 7.1 |
| **Organization** | Contains Members and Projects; the scope at which Roles are assigned. | 7.2 |
| **Member** | An identity with a Role within an Organization. | 7.2 |
| **Role** | A named bundle of Permissions (Owner, Admin, Editor, Reviewer, Viewer). | 7.2 |
| **Knowledge** | Structured, queryable understanding scoped to a Project (brand, audience, competitor, or any domain-specific data contributed by a Blueprint). | 7.3 |
| **Artifact** | The generic platform-level unit for any produced or reusable object — media, text, prompt, template. The platform treats all Artifacts uniformly; domain-specific subtypes (scripts, thumbnails, strategies) are defined by Blueprints. | 7.4 |
| **AssetGraph** | The relationship layer tracking Artifact derivation, composition, and usage. | 7.4 |
| **Blueprint** | An installable starter package that contributes domain-specific Knowledge templates, Workspace layouts, Agent configurations, Commands, Events, and Artifacts for a specific business archetype. | 7.5, 17 |
| **Pipeline** | An Agent's private internal execution DAG; never exposed to end users. | 7.6 |
| **Job** | A unit of Execution Kernel-scheduled work. | 7.7 |
| **Memory Timeline** | The append-only, human-readable projection of the Event Store. | 7.8 |
| **Workspace** | A purpose-built, lifecycle-scoped UI environment within a Project. | 7.9 |
| **Automation** | A user-authored `When → If → Then` graph. | 7.10, 18 |
| **Agent** | A specialized autonomous worker implementing the Agent Framework contract. | 12, 13 |
| **Plugin** | A sandboxed, permissioned extension to the platform. | 14, 15 |
| **Provider** | An external or local LLM inference source. | 11 |
| **Revision** | A proposed change to an Artifact, subject to Human Review before commitment. | 7.4, 12.12 |
| **Command** | A named, versioned intent to change state. | 8.1, 9.1 |
| **Query** | A named, versioned, side-effect-free read. | 8.2, 9.2 |
| **Event** | An immutable, past-tense fact produced by a successful Command. | 9.3, 21.1 |
| **Use Case** | A composition of Commands/Queries implementing one user-facing operation. | 8.3 |
| **Trust Model** | The per-Agent, per-action-class Propose-Only/Auto-Commit setting. | 12.11 |
| **Review Model** | The Human-in-the-loop mechanism governing Propose-Only Agent output. | 12.12 |
| **Snapshot** | A compacted point-in-time Project state projection. | 20.7, 20.9 |
| **Trace ID** | The identifier propagated through every step of a Job/Command for Observability. | 24.3 |
| **DTO** | A plain, versioned, serializable structure crossing a layer boundary. | 9.4 |
| **Capability** | A named platform feature surface (e.g., `publishing`, `analytics`, `workflow`) that a Blueprint may declare as a dependency and a Plugin may declare as a provider. | 14.5, 16.3 |

### 38.10 Error Taxonomy

Extends Section 23 with stable, versioned error codes.

| Code Prefix | Category (23.1) | Retryable (23.4) | Example |
|---|---|---|---|
| `DOM-####` | Domain Error | No | `DOM-0012`: Artifact version cannot be edited in place — supersede it |
| `INF-####` | Infrastructure Error | Conditional | `INF-0004`: Local database write failed (transient) |
| `PRV-####` | Provider Error | Yes (via Router fallback) | `PRV-0031`: Provider rate limit exceeded |
| `PLG-####` | Plugin Error | Conditional (Plugin-declared) | `PLG-0002`: Plugin Action timed out |
| `USR-####` | User Error | No | `USR-0007`: Insufficient Role permission for Command |
| `BLP-####` | Blueprint Error | No | `BLP-0001`: Blueprint requires unmet capability (see 38.15) |
| `AUT-####` | Automation Error | Conditional | `AUT-0003`: Automation node received incompatible input contract |

Every error code is stable across releases; a code is never reused for a different meaning, and a deprecated code is marked reserved rather than recycled (Section 38.29).

### 38.11 State Machines

**Job Lifecycle** (Section 7.7, 10.3, 10.5):
```
Queued → Running → Completed
Queued → Running → Paused → Running → Completed
Queued → Running → Failed (retry exhausted, Section 10.6)
Queued → Running → Cancelled (user-initiated)
Running → Failed → (Kernel retry) → Running
```

**Agent Invocation Lifecycle** (Section 12.3):
```
Dispatched → Context Assembling → Running → Awaiting Review → Committed
Dispatched → Context Assembling → Running → Awaiting Review → Rejected → (re-dispatch with feedback)
Dispatched → Context Assembling → Running → Committed (Auto-Commit trust, no review step)
Running → Failed (Section 12.13)
```

**Plugin Lifecycle** (Section 14.3):
```
Install → Configure → Enable → Run ⇄ (health check pass/fail)
Enable → Disable → Uninstall
Run → Update → Configure (re-approval if permissions expanded) → Enable
```

**Automation Run Lifecycle** (Section 18.4, 18.8):
```
Triggered → Condition-Evaluating → Action-Dispatching → Completed
Action-Dispatching → Human-Approval-Pending → (Approve) → Action-Dispatching → Completed
Action-Dispatching → Human-Approval-Pending → (Reject) → Failed
Any state → Failed (node error, Section 18.7)
```

**Human Review Lifecycle** (Section 12.12, 26.14):
```
Awaiting Review → Approved → Committed
Awaiting Review → Rejected → Feedback-Returned-to-Agent
Awaiting Review → Edited → Committed (as edited version)
```

**Revision Lifecycle:**
```
Proposed → Under Review → Approved → Committed
Proposed → Under Review → Rejected → (optional re-proposal with feedback)
Proposed → Under Review → Edited → Committed (as reviewer-edited version)
```

### 38.12 Sequence Diagrams (Text Format)

**Sequence: End-to-End Agent Execution** (expands Section 34):
```
User          Presentation     Application      Kernel         Agent(Worker)   ProviderRouter   MemoryTimeline
 |--intent-------->|                |               |               |                |               |
 |                 |--Command------>|               |               |                |               |
 |                 |                |--authorize---->|               |                |               |
 |                 |                |--dispatchJob-->|               |                |               |
 |                 |                |               |--assign------->|                |               |
 |                 |                |               |               |--assemble ctx--|               |
 |                 |                |               |               |--infer-------->|               |
 |                 |                |               |               |<--stream-------|               |
 |                 |<--live Events (Observability)---|               |                |               |
 |                 |                |               |               |--result------->|               |
 |                 |                |<--JobCompleted-|               |                |               |
 |                 |                |--(if review req'd) enqueue Review------------->|               |
 |                 |<--revision.proposed--------------------------------------------|               |
 |--ApproveRevision>|               |               |               |                |               |
 |                 |--Command------>|               |               |                |               |
 |                 |                |--commit------------------------------------------------------>|
```

**Sequence: Plugin-Mediated External Delivery** (expands Section 13.6):

This sequence illustrates how a Blueprint-contributed Agent (e.g., a Publishing Agent from a Publishing Plugin) uses the Plugin Engine to deliver an Artifact to an external platform. The platform itself does not know what "publishing" means — it only knows that an Agent dispatched a Job, and that Job invoked a Plugin Action.

```
Automation/User → Application: DispatchAgentJob Command (target: delivery agent)
Application → Kernel: dispatchJob(agent.execute)
Kernel → Agent(Worker): execute internal Pipeline
Agent → PluginEngine: invoke Action (via granted permission scope)
PluginEngine → Sandbox(Plugin): call Action with opaque credential handle
Sandbox(Plugin) → ExternalPlatform: authenticated API call
ExternalPlatform --> Sandbox(Plugin): response
Sandbox(Plugin) --> PluginEngine: result
PluginEngine --> Agent: result
Agent → Kernel: emit execution.completed | execution.failed
Kernel → Application: JobCompleted Event
Application → MemoryTimeline: commit Event
```

**Sequence: Plugin Installation** (expands Section 14.3, 15.4):
```
User → Presentation: select Plugin from Marketplace
Presentation → Application: InstallPlugin Command
Application → PluginRegistry: fetch manifest
PluginRegistry --> Application: manifest (permissions[], sdkCompatibilityRange)
Application → Presentation: render permission consent screen
User → Presentation: approve permissions
Presentation → Application: GrantPluginPermission Command
Application → Domain: validate + persist grant
Application → EventStore: emit plugin.installed
```

### 38.13 Component Interaction Diagram (Text Format)

```
┌─────────────────────────── Presentation Layer ───────────────────────────┐
│  Workbench · Command Palette · Inspector · Node Editors · Dashboards      │
└───────────────────────────────┬────────────────────────────────────────-─┘
                                 │ Commands / Queries (versioned contract)
┌────────────────────────────────▼──────────────────────────────────────---┐
│                          Application Layer                                │
│   Use Cases · Commands · Queries · Authorization · Transactions           │
└───────────┬─────────────────────────────┬─────────────────────────────---┘
            │ direct use                  │ dispatch (async, Job)
┌───────────▼───────────┐      ┌──────────▼───────────────────────────────┐
│      Domain Layer      │      │            Execution Kernel               │
│ Entities · Invariants  │      │  Queue · Scheduler · Workers · EventBus   │
└─────────────────────────┘      └───────────┬───────────────────┬─────────┘
                                             │                   │
                                  ┌──────────▼─────────┐  ┌──────▼───────────┐
                                  │   Agent Engine      │  │ Provider Router  │
                                  │ (Pipelines, Agents)  │  │ (LLM Providers)  │
                                  └──────────┬───────────┘  └──────────────────┘
                                             │
                                  ┌──────────▼───────────┐
                                  │    Plugin Engine       │
                                  │ (Sandbox, Registry)     │
                                  └────────────────────────┘
```

### 38.14 Plugin Manifest Specification

Formalizes Section 15.2.

```
manifest {
  id: string (reverse-DNS, unique)
  name: string
  version: semver
  sdkCompatibilityRange: semver-range
  permissions: [ scoped-capability-string ]   // e.g. "artifact:write", "knowledge:read"
  providedCapabilities: [ capability-string ]  // e.g. "publishing", "analytics"
  actions: [ { name, inputSchema, outputSchema } ]
  triggers: [ { name, payloadSchema } ]
  panels: [ { name, mountPoint, componentEntry } ]
  commands: [ { name, paletteLabel, shortcutDefault } ]
  settingsSchema: JSONSchema
  authentication: { type: "oauth2" | "apiKey" | "none", config }
  storageQuota: bytes (default platform ceiling unless declared lower)
}
```

Every field is required except `authentication` (defaults to `"none"`), `storageQuota` (defaults to the platform ceiling), and `providedCapabilities` (defaults to empty). A manifest missing a required field fails Registry validation (Section 14.2) and is never installable.

The `providedCapabilities` field declares which abstract platform capabilities this Plugin supplies (e.g., `"publishing"`, `"analytics"`, `"media-generation"`). These capability strings are matched against Blueprint `requiredCapabilities` (38.15) during Blueprint installation to ensure all dependencies are satisfiable.

### 38.15 Blueprint Manifest Specification

Formalizes Section 17.1–17.3.

```
blueprint {
  id: string
  name: string
  version: semver
  businessArchetype: enum (Restaurant | RealEstate | Agency | SaaS | Custom | ...)
  requiredCapabilities: [ capability-string ]   // e.g. ["publishing", "analytics", "workflow", "media-generation"]
  dependencies: [ { type: "plugin"|"blueprint", id, versionRange } ]
  variables: [ { key, type: "text"|"choice"|"color"|"assetReference", required: bool, default } ]
  knowledgeSeeds: [ AssetRef | KnowledgeTemplateRef ]     // templated with {{variable}} placeholders
  starterAssets: [ AssetTemplateRef ]
  contributedCommands: [ CommandRegistration ]
  contributedEvents: [ EventRegistration ]
  defaultWorkspaceLayout: WorkspaceManifestRef
  defaultAgentConfig: [ { agentId, trustLevel: "proposeOnly"|"autoCommit", actionClass } ]
}
```

**Capability Matching:** The `requiredCapabilities` field declares abstract platform capabilities that the Blueprint expects to be available at install time (e.g., `"publishing"`, `"analytics"`, `"workflow"`, `"media-generation"`). During Blueprint installation, the Application Layer resolves each required capability against the set of capabilities currently provided by installed Plugins (via their `providedCapabilities` manifest field, Section 38.14) and by the Platform Core itself (which provides `"workflow"`, `"knowledge"`, `"artifact-management"`, `"automation"`, and `"review"` as built-in capabilities).

If any required capability is unmet, the installation surfaces a clear diagnostic to the user identifying which capability is missing and which Plugins in the Marketplace could satisfy it. The Blueprint is not installed in a partially-functional state — all capabilities must be resolved before activation.

This design ensures Blueprints depend on abstract platform capabilities rather than concrete Plugin implementations. A "Restaurant Blueprint" that requires `"publishing"` is satisfiable by any Plugin that declares `providedCapabilities: ["publishing"]`, whether that Plugin targets YouTube, TikTok, LinkedIn, or a custom CMS. This decoupling is what makes the Blueprint ecosystem portable and composable across different Plugin configurations.

### 38.16 Workspace Manifest Specification

Formalizes the Workspace SDK described in Section 14.7, previously implied but not schema-specified.

```
workspace {
  id: string
  name: string
  icon: IconRef
  navigationTreePosition: string          // where it appears in the Navigation Tree, Section 26.6
  panels: [ { panelId, defaultDockPosition } ]
  defaultLayout: LayoutEngineConfig       // consumed by the Layout Engine, Section 26.5
  contributedBy: "first-party" | pluginId
  requiredPermissions: [ scoped-capability-string ]   // empty for first-party Workspaces
}
```

A Workspace manifest is validated identically whether `contributedBy` is `"first-party"` or a Plugin ID — there is no relaxed validation path for first-party Workspaces, consistent with ADR-005.

### 38.17 Prompt Asset Schema

Formalizes the Prompt Asset Graph described in Section 19.2.

```
promptAsset {
  id: string
  version: integer (monotonic, per Section 19.3)
  systemPrompt: string
  instructions: string
  variables: [ { key, type, description } ]
  examples: [ { input, output } ]
  schemas: { inputSchema: JSONSchema, outputSchema: JSONSchema }
  rules: [ string ]                        // hard constraints the output must satisfy
  memoryReferences: [ KnowledgeRef | ArtifactRef ]
  outputContract: JSONSchema
}
```

Prompt Assets are composable: a `memoryReferences` entry may itself point to another Prompt Asset's `instructions` fragment, which is how Agents share reusable prompt components without duplication (Section 19.2). The platform treats Prompt Assets as a specialized Artifact type — they participate in the AssetGraph, are versioned through the standard Revision mechanism, and are subject to the same Human Review lifecycle when modified by an Agent.

### 38.18 Automation DSL

Formalizes the node/edge graph described in Section 18.

```
automation {
  id: string
  name: string
  enabled: boolean
  nodes: [
    { id, type: "trigger"|"condition"|"action"|"humanApproval",
      config: TriggerConfig | ConditionExpr | ActionInvocation | ApprovalConfig }
  ]
  edges: [ { from: nodeId, to: nodeId, outputContract, inputContract } ]  // validated at save-time, Section 18.2
  variables: [ { key, scope: "run" } ]
}

ConditionExpr := Literal | VariableRef | KnowledgeLookup(path)
              | ConditionExpr Operator ConditionExpr
Operator := "==" | "!=" | ">" | "<" | "AND" | "OR" | "NOT"
```

The expression language is intentionally closed — it supports no function calls, no external I/O, and no assignment beyond writing to a run-scoped Variable from an upstream node's declared output (Section 18.3). This closure is what allows an Automation's Conditions to be statically analyzed and safely sandboxed without a general-purpose scripting runtime.

### 38.19 SDK Guidelines

Practical guidance for Plugin and Agent developers building against `sdks/plugin-sdk` and (per the future Agent SDK described in Section 37.6):

- Declare the narrowest `permissions` set that satisfies your Plugin's actual Actions — over-declaring permissions is the single most common cause of user install-time rejection.
- Treat every SDK client call as fallible; the Sandbox boundary (Section 15.6) means a call can fail for reasons outside your Plugin's control (rate limiting, Provider unavailability) and your Action implementation must handle that per the Graceful Degradation principle (Section 24.13).
- Never cache a credential handle across Plugin versions without re-validating it against the current `authentication` flow — a platform-side credential rotation invalidates stale handles by design.
- Version your manifest's `actions[]`/`triggers[]` payload schemas using the same additive-by-default rule as platform DTOs (Section 9.5).
- If your Plugin declares `providedCapabilities`, ensure that every declared capability is fully exercised by at least one Action or Trigger — a capability claim without a backing implementation is treated as a certification failure (38.20).

### 38.20 Plugin Certification Rules

Required to achieve public Marketplace listing (extends Section 17.7's review pass):

1. Manifest passes Registry structural validation (38.14).
2. Plugin passes the full SDK conformance test suite (Section 32.8).
3. Every declared `permissions` scope is exercised by at least one declared Action/Trigger — unused permission requests are rejected.
4. Every declared `providedCapabilities` entry is backed by at least one functional Action or Trigger — capability claims without implementations are rejected.
5. No Action exceeds the platform's default Job timeout (Section 10.8) without an explicit, justified long-running declaration.
6. Settings schema renders correctly in the platform's generated Settings UI without custom CSS overrides (sandbox constraint, Section 15.6).
7. Authentication flow, if declared, completes end-to-end against a platform-provided test harness before listing.
8. A published changelog entry accompanies every version bump, per Documentation Standards (Section 33).

### 38.21 Provider Capability Matrix

The Intelligent Provider Router (Section 11) operates against a vendor-neutral Provider taxonomy. The architecture does not hardcode vendor names as architectural concepts — Providers are classified by category, and specific vendors are implementation examples within those categories.

#### 38.21.1 Provider Categories

| Category | Description | Streaming | Embeddings | Local Execution | Typical Use (Section 11.8) |
|---|---|---|---|---|---|
| **Hosted Provider** | Cloud-hosted commercial LLM API services with managed infrastructure. | Yes | Yes | No | Quality-pinned Agent execution (11.5), interactive Jobs requiring high-capability models. |
| **Gateway Provider** | Aggregator services that proxy requests to multiple upstream model providers through a unified API. | Yes | Varies by upstream model | No | Multi-model access, Fallback breadth, and cost-optimization routing (11.4). |
| **Local Provider** | Models running on the user's own hardware via local inference engines. | Varies | Yes (smaller model classes) | Yes | Offline operation (2.10), embedding generation (20.3) at zero marginal Provider cost, privacy-sensitive workloads. |
| **Custom Provider** | User-configured endpoints conforming to the Provider interface contract (Section 11.1), including self-hosted open-source models and private fine-tuned deployments. | Declared per instance | Declared per instance | Declared per instance | Organization-specific model deployments, regulatory compliance, specialized domain models. |

#### 38.21.2 Reference Implementation Examples

The following are examples of current providers within each category. These examples are provided for practical reference only — the architecture treats them as interchangeable implementations of their respective category contracts.

| Category | Example Providers |
|---|---|
| Hosted Provider | Anthropic (Claude), OpenAI (GPT), Google (Gemini) |
| Gateway Provider | OpenRouter, Together AI |
| Local Provider | Ollama, llama.cpp, LM Studio |
| Custom Provider | Any endpoint conforming to the Provider interface contract (Section 11.1) |

The Provider Registry (Section 11.1) stores each configured Provider instance's actual capability flags at configuration time; the category table above describes default expectations, not hardcoded assumptions the Router relies on blindly. A Hosted Provider that does not support streaming (hypothetically) would have its `streaming` flag set to `false` in the Registry, and the Router would route accordingly regardless of category classification.

### 38.22 Security Threat Model (Formalized)

Extends Section 29.9 into a structured threat/mitigation table.

| Threat | Actor | Mitigation | Section |
|---|---|---|---|
| Plugin exceeds granted permission scope | Malicious/buggy Plugin | Per-call permission enforcement, not just install-time consent | 15.5, 15.6 |
| Prompt injection via Provider response | Compromised/adversarial content | Agent-generated Commands still require Application Layer authorization | 8.8, 29.9 |
| Misrepresented Marketplace manifest | Malicious Blueprint/Plugin author | Manifest validation; installed capability bounded by granted permissions regardless of listing claims | 17.7, 38.20 |
| Credential exfiltration via Agent context | Compromised Agent Pipeline | Secrets never enter Agent prompt context; only opaque handles passed to code | 24.6, 15.9 |
| Cross-Plugin data leakage | Malicious Plugin | Sandbox storage isolation, no ambient cross-Plugin access | 15.6, 15.7 |
| Unauthorized cross-Project data access | Compromised or misconfigured actor | Project is the sole ownership boundary; no cross-Project reference exists at the data layer | 7.1 |
| Cloud Sync transport interception | Network attacker | End-to-end encryption in transit and at rest | 25.9 |
| Runaway Automation resource consumption | Misconfigured Automation | Bounded loops, per-Project fairness scheduling | 18.6, 10.1 |
| False capability declaration by Plugin | Malicious Plugin claiming capabilities it does not implement | Certification rule 38.20.4 requires every declared capability to be exercised | 38.14, 38.20 |
| Blueprint installed with unmet capabilities | Missing Plugin dependency | Capability-matching validation at install time prevents partial activation | 38.15 |

### 38.23 Performance Budgets

Concrete targets governing the qualitative goals in Section 30. These budgets are organized into two tiers: **User-Facing Budgets** that directly impact perceived responsiveness, and **Internal Platform Service Budgets** that govern the latency of infrastructure operations critical to overall system health.

#### 38.23.1 User-Facing Performance Budgets

| Metric | Budget |
|---|---|
| Cold start to interactive Workbench | < 1.5s (warm cache), < 4s (cold, full Event replay pending) |
| Workspace switch (already-loaded Project) | < 150ms |
| Command Palette open-to-searchable | < 50ms |
| Global Search result (typical Project) | < 300ms |
| Interactive Job first-token latency | < 2s (provider-dependent, Router-optimized per 11.8) |
| Undo/Redo action | < 100ms |
| Diff View render for a typical Artifact revision | < 200ms |

#### 38.23.2 Internal Platform Service Budgets

| Metric | Budget |
|---|---|
| Agent Dispatch latency (Application Layer → Kernel queue acceptance) | < 50ms |
| Plugin Invocation overhead (Sandbox boundary crossing, excluding Plugin execution time) | < 30ms |
| Event propagation latency (Event Store commit → subscriber notification) | < 100ms |
| Memory lookup latency (Context Assembly vector retrieval, Section 20.5) | < 200ms (p95, typical Project) |
| Blueprint installation time (manifest validation + Knowledge seeding + Workspace creation) | < 10s (excluding network-dependent Plugin installations) |
| Context Assembly latency (full context window construction for an Agent invocation) | < 500ms |
| Provider Router decision latency (budget/health/capability evaluation) | < 10ms |
| Search Index projection update (Event → searchable) | < 2s (eventual consistency window) |

These budgets are tracked as regression benchmarks per Section 32.10, not aspirational targets — a change that regresses any budget by more than 10% blocks release pending justification or optimization.

### 38.24 Scalability Targets

| Dimension | Target |
|---|---|
| Projects per Organization | 10,000+ without per-Project performance degradation |
| Artifacts per Project | 1,000,000+ (Blob Storage content-addressed, Section 25.4) |
| Memory Timeline entries per Project | Unbounded, with Snapshot compaction (20.7) keeping query latency flat past 1M entries |
| Concurrent Jobs (single local installation) | Bounded by local Worker concurrency, gracefully degrading via Scheduler fairness (10.1) rather than failing |
| Members per Organization | 10,000+ (Enterprise Platform target, Section 37.3) |
| Installed Plugins per Project | 100+ without measurable Workspace load-time impact (lazy loading, 30.5) |

### 38.25 Testing Strategy (Coverage Targets)

Extends Section 32 with concrete minimums.

| Layer | Minimum Coverage | Test Type (Section) |
|---|---|---|
| Domain (`core`) | 95% line coverage | Unit (32.1) |
| Application (`application`) | 90% Use Case path coverage | Integration (32.2) |
| Public API contracts (Commands/Queries/Events/DTOs) | 100% schema coverage | Contract (32.3) |
| Agent Pipelines | 100% of declared Permission classes exercised | Agent Tests (32.7) |
| Plugin SDK | 100% conformance suite pass required for certification | Plugin Tests (32.8), 38.20 |
| Critical user paths (Roadmap Exit Criteria) | 100% scenario coverage | End-to-End (32.4) |
| Capability matching (Blueprint ↔ Plugin) | 100% of resolution paths covered | Integration (32.2) |

### 38.26 Release Strategy

Releases ship on three channels: **Nightly** (every merge to main, internal use only), **Beta** (weekly cut, opt-in, feature-flag-gated per Section 24.9), and **Stable** (promoted from Beta after a minimum soak period with no unresolved regression against Section 38.23's budgets). A Milestone (Section 35) is only declared complete once its Exit Criteria are verified on the Stable channel, not Beta.

### 38.27 Versioning Strategy

Every independently-consumable contract is semantically versioned in isolation: the Application Layer's public API, each SDK, each Command/Query/Event schema (Section 9.5), and this document itself (Section 33.6). A single platform release may bump multiple independent version numbers simultaneously; there is no single monolithic "platform version" governing internal contracts, only the user-facing release channel version (38.26).

### 38.28 Backward Compatibility Policy

An additive change (new optional field, new Command variant, new Event type) never requires a version bump beyond minor. A breaking change (removed field, changed field meaning, removed Command) requires: a new major version published alongside the old one, a minimum deprecation window (38.29) during which both are supported, and an entry in the relevant SDK's changelog explaining the migration path. No breaking change ships without an old version remaining callable through that window — this is what makes third-party Plugins safe to leave unmaintained for a bounded period without breaking outright.

### 38.29 Deprecation Policy

A deprecated Command, Query, Event, or SDK method is marked `@deprecated` with a target removal version, continues to function identically to its non-deprecated form throughout the deprecation window (minimum one Stable release cycle, 38.26), and emits a non-blocking developer-facing warning (surfaced in Diagnostics, Section 24.20) when invoked. Removal happens only at the declared target version, never earlier.

### 38.30 RFC Process

A change proposing a new ADR-weight decision (Section 38.1), a new cross-cutting concern, or a breaking change to a public contract is first written as an RFC: Problem Statement, Proposed Change, Alternatives Considered, Impact on existing Sections of this document. The RFC is reviewed against this document for consistency before implementation begins; if accepted, it is converted into a new ADR entry (38.1) and the relevant body sections are updated in the same change set, per the Contribution Rules (Section 33.7).

### 38.31 Coding Standards

- Domain (`core`) code contains no framework imports, no I/O, and no async code — invariant checks are pure functions (Section 7.11, ADR-001).
- Every Command handler validates authorization before touching Domain logic (Section 8.8) — this ordering is enforced by lint rule, not convention.
- Every public function crossing a package boundary (per the Dependency Matrix, 38.2) has an explicit, non-inferred type signature.
- No package reaches into another package's internal (non-exported) module path, even within the same monorepo — internal APIs (38.5) are enforced by package boundary tooling, not just naming convention.

### 38.32 Repository Conventions

Directory structure follows Section 6's package boundaries exactly — a new capability's home package is determined by its responsibility per that section, never placed ad hoc. Each package's root contains a README (Section 33.1) and, where applicable, its own `CHANGELOG.md` tracking its independent version (38.27).

### 38.33 Monorepo Governance

Cross-package changes (touching more than one package's public API in the same change) require sign-off from each affected package's owning team (Package Ownership Matrix, 38.3). A change touching only a package's internal API (38.5) requires sign-off only from that package's own owning team.

### 38.34 Package Naming Rules

- Apps: `apps/{name}` — one deployable surface per directory.
- Shared libraries: `packages/{name}` — kebab-case, responsibility-scoped (never a grab-bag "utils" package).
- Plugins: `plugins/{category}-plugins` for first-party groupings; third-party Plugins are namespaced by their manifest `id` (reverse-DNS, Section 38.14) and live outside the monorepo entirely, published only through the Marketplace.
- Blueprints: `blueprints/{category}-blueprints`, mirroring the Plugin convention.
- SDKs: `sdks/{protocol}-sdk` — one SDK package per external-facing protocol (Plugin SDK, MCP SDK), never a combined "sdk" package, so each can version independently (38.27).

### 38.35 Consistency Audit Checklist

This subsection codifies the internal consistency rules that must hold across the entirety of Section 38 and its relationship to Sections 1–37. Any violation of these rules constitutes a document defect that must be resolved before implementation proceeds.

1. **Appendix terminology matches Sections 1–37.** Every term used in this appendix (Artifact, Revision, Blueprint, Plugin, Workspace, Job, Agent, Automation, Knowledge, Provider) has a definition in the Domain Glossary (38.9) that is consistent with its definition in the body (Section 7). No appendix entry introduces a term not defined in both places.

2. **No package contradicts the Dependency Matrix.** Every package listed in the Package Ownership Matrix (38.3) appears in the Dependency Matrix (38.2). No sequence diagram (38.12) depicts a call path that violates a ❌ cell in the Dependency Matrix.

3. **No Event violates naming conventions.** Every Event in the Event Catalog (38.6) follows the `domain.fact_past_tense` convention (Section 33.2). No Platform Core Event uses a namespace prefix that belongs to a Blueprint or Plugin contribution.

4. **No Command bypasses the Application Layer.** Every Command in the Command Catalog (38.7) is dispatched through the Application Layer. No sequence diagram shows a Plugin, Agent, or Presentation component issuing a Command that skips Application Layer authorization and validation.

5. **No Plugin bypasses the Sandbox.** Every Plugin interaction depicted in a sequence diagram (38.12) passes through the Plugin Engine's Sandbox boundary. No Plugin manifest field (38.14) grants a Plugin direct access to `packages/application` or `packages/core` internals.

6. **No Blueprint bypasses the Capability System.** Every Blueprint in the Blueprint Manifest (38.15) declares its `requiredCapabilities`. No Blueprint is installable without all required capabilities being resolvable against installed Plugins and Platform Core built-in capabilities.

7. **No Provider-specific assumption exists inside Core Architecture.** The Provider Capability Matrix (38.21) uses category-based classification (Hosted, Gateway, Local, Custom). No Platform Core Command, Event, or Query references a specific vendor by name. Vendor names appear only in the Reference Implementation Examples subsection (38.21.2) and in Example Blueprint/Plugin Contribution sections.

### 38.36 Capability Catalog

This is the canonical capability catalog for the platform, compiled strictly from existing architecture.

| Capability | Description | Owning Package | Owning Subsystem | Public API | Required Permissions | Commands | Events | Related Sections |
|---|---|---|---|---|---|---|---|---|
| Knowledge | Brand, persona, and domain memory | `packages/core` | Memory Engine | Not specified. | `knowledge:read` (example) | Not specified. | Not specified. | 7.3, 20 |
| Assets | Core production artifacts | `packages/core` | Asset System | Not specified. | Not specified. | Not specified. | Not specified. | 7.4, 19 |
| Memory | Project history and Timeline | `packages/core` | Memory Engine | Not specified. | Not specified. | Not specified. | Not specified. | 7.8, 20 |
| Providers | LLM routing and execution | `packages/execution-kernel` | Provider Router | Not specified. | Not specified. | Not specified. | Not specified. | 11 |
| Plugins | Extensibility and sandboxing | `packages/plugin-engine` | Plugin System | Not specified. | Not specified. | Not specified. | `PluginInstalled` | 14, 15 |
| Blueprints | Templates and workspace starters | `packages/application` | Blueprint Ecosystem | Not specified. | Not specified. | Not specified. | `BlueprintInstalled` | 16, 17 |
| Automation | Visual logic graphs | `packages/execution-kernel` | Automation Engine | Not specified. | Not specified. | Not specified. | Not specified. | 18 |
| Publishing | Delivering assets externally | `plugins/core-plugins` | Not specified. | Not specified. | `publishing:tiktok` (example) | Not specified. | Not specified. | 6.10, 14.5, 15.2 |
| Research | Not specified. | `packages/agent-engine` | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | 13 |
| Strategy | Not specified. | `packages/agent-engine` | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | 13 |
| Ideas | Not specified. | `packages/agent-engine` | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | 13 |
| Analytics | Not specified. | `plugins/core-plugins` | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | 6.10 |
| Planning | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. | Not specified. |
| Search | Global search and retrieval | `packages/application` | Search Index | Not specified. | Not specified. | Not specified. | Not specified. | 25.5, 26 |
| Review | Human-in-the-loop checkpoints | `packages/application` | Application Layer | Not specified. | Not specified. | `ApproveRevision` | Not specified. | 8.1, 12.12 |
| Marketplace | Plugin/Blueprint distribution | Not specified. | Registry | Public search API | Not specified. | Not specified. | Not specified. | 14.2, 15.3, 16.5 |
| Workspace | Configurable UI layout | `packages/ui-components` | Layout Engine | Not specified. | Not specified. | Not specified. | Not specified. | 7.9, 14.7, 26.5 |
| Observability| Telemetry, logs, metrics | `packages/execution-kernel` | Diagnostics | Not specified. | Not specified. | Not specified. | Not specified. | 24 |
| Cost Tracking| Not specified. | `packages/execution-kernel` | Provider Router | Not specified. | Not specified. | Not specified. | Not specified. | 11.9 |
| Security | Identity and isolation | `packages/application` | Identity Layer | Not specified. | Not specified. | Not specified. | Not specified. | 29 |

Source Sections:
- 6 Package Boundaries
- 7 Domain Layer
- 8 Application Layer
- 11 Execution Kernel
- 12 Agent Framework
- 14 Plugin System
- 15 Plugin SDK Specification
- 16 Blueprint Ecosystem
- 17 Blueprint Specification
- 18 Automation Engine
- 20 Memory & Knowledge Engine
- 24 Diagnostics
- 25 Storage & Persistency
- 29 Security Threat Model

### 38.37 Permission Catalog

Not currently specified by the constitutional architecture. 

Source Sections:
- None

### 38.38 Configuration Reference

Not currently specified by the constitutional architecture.

Source Sections:
- None

### 38.39 Environment Variable Reference

Not currently specified by the constitutional architecture.

Source Sections:
- None

### 38.40 Observability Field Reference

Not currently specified by the constitutional architecture.

Source Sections:
- None

### 38.41 Repository Layout Reference

| Directory | Purpose | Owner | Contains | Depends On | Related Sections |
|---|---|---|---|---|---|
| `apps/desktop` | Desktop App | Desktop/Platform Team | None (leaf app) | `application`, `design-system`, `ui-components` | 6.1 |
| `packages/design-system` | Design tokens | Design Systems Team | Not specified. | Not specified. | 6.2 |
| `packages/ui-components` | UI Components | Application Team | Layout engine internals | `design-system` | 6.3 |
| `packages/icons` | Default icons | Design Systems Team | Not specified. | Not specified. | 6.4 |
| `packages/application` | Application Layer | Core/Platform Team | Use Cases | `core` | 6.5 |
| `packages/core` | Domain Layer | Core/Platform Team | Domain Model | None | 6.6 |
| `packages/execution-kernel` | Infrastructure Layer | Infrastructure Team | Job Scheduling | None | 6.7 |
| `packages/agent-engine` | Agent logic | AI/Platform Team | Pipeline format | `core` | 6.8 |
| `packages/plugin-engine` | Plugin Sandbox | Extensibility Team | SDK, Sandbox | `core` | 6.9 |
| `plugins/core-plugins` | Built-in plugins | Integrations Team | Not specified. | `plugin-sdk` | 6.10 |
| `blueprints/core-blueprints`| Built-in blueprints | Product/Domain Team | Not specified. | Blueprint Manifest | 6.11 |
| `sdks/plugin-sdk`, `mcp-sdk` | Extensibility APIs | Extensibility Team | Manifest types | None | 6.12 |
| `docs/` | Documentation | Not specified. | READMEs | Not specified. | 33.1, 38.34 |

Source Sections:
- 6 Package Boundaries
- 38.34 Package Naming Rules

### 38.42 Reserved Names

Not currently specified by the constitutional architecture. 

Source Sections:
- None

### 38.43 Default Limits & Platform Constraints

Not currently specified by the constitutional architecture.

Source Sections:
- None

---

## 39. Document Status

Status:
Stable

Version:
2.0

Architecture State:
Frozen

Last Updated:
2026-07-21

This document is considered the constitutional architecture of ContentCompiler.

All future architectural changes MUST be introduced through an RFC, approved, converted into an ADR, then reflected inside this document before implementation.

Code follows Architecture.
Architecture never follows Code.

---

## 40. Future Evolution

This document intentionally describes the architecture at the current constitutional state.

Future versions may introduce:

- Distributed Execution Kernel
- Cloud Collaboration
- Multi-user CRDT synchronization
- Hosted Execution Workers
- Organization Billing
- Enterprise SSO
- Marketplace Revenue Sharing
- AI Fine-tuning Infrastructure

These future capabilities must preserve all architectural invariants defined in this document.

---

## 41. Architecture Invariants

These rules are never allowed to change.

### 41.1 The Ten Invariants

1.
Domain never depends on Infrastructure.

2.
Presentation never bypasses Application.

3.
Agents never mutate Domain directly.

4.
Everything belongs to exactly one Project.

5.
Memory Timeline is append-only.

6.
Public APIs are versioned.

7.
Plugins are sandboxed.

8.
Every mutation becomes an Event.

9.
Execution Kernel never understands business logic.

10.
Architecture Decisions are immutable once published.

### 41.2 Consequence:

Any change that would violate one of these rules MUST be rejected unless the rule itself is modified through an ADR.



---

## 42. Architecture Glossary Index

| Term | Section(s) |
|------|------------|
| **Agent Framework** | 12 |
| **Application Layer** | 4.2, 8 |
| **Artifact** | 7.4 |
| **Asset** | 7.4 |
| **AssetGraph** | 7.4 |
| **Automation** | 7.10, 18 |
| **Blueprint** | 7.5, 16, 17 |
| **CQRS** | 8.4 |
| **Capability** | 14.5, 16.3 |
| **Commands** | 8.1, 9.1 |
| **Context Assembly** | 20.5 |
| **DTO** | 9.4 |
| **Domain Layer** | 4.3, 7 |
| **Event Store** | 25.3 |
| **Events** | 9.3, 21 |
| **Execution Kernel** | 4.4, 10 |
| **Job** | 7.7, 10 |
| **Knowledge** | 7.3 |
| **Layout Engine** | 26.5 |
| **MCP** | 14.6 |
| **Marketplace** | 13.14, 14.2, 16.5 |
| **Memory Timeline** | 7.8 |
| **Organization** | 7.2 |
| **Pipeline** | 7.6 |
| **Plugin** | 14, 15 |
| **Presentation Layer** | 4.1 |
| **Project** | 7.1 |
| **Prompt Asset Graph** | 19.2 |
| **Provider Router** | 11 |
| **Queries** | 8.2, 9.2 |
| **Review Model** | 12.12 |
| **Revision** | 7.12 |
| **Search Index** | 25.5 |
| **Snapshots** | 20.7, 20.9 |
| **Theme System** | 26.13 |
| **Threat Model** | 29.9 |
| **Tracing** | 24.3 |
| **Trust Model** | 12.11 |
| **Use Cases** | 8.3 |
| **Workspace** | 7.9, 26 |

---

## 43. Document Change Log



---

## 44. Final Constitutional Statement

This document is the constitutional specification of ContentCompiler. Every repository, package, SDK, plugin, workflow, blueprint, and future implementation derives its authority from this document. Architecture precedes implementation. Implementation never redefines architecture.

---

