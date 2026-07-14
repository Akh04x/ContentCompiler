# Architecture Decision Records (ADR)

Architecture Decision Records (ADR) capture the reasoning behind important design decisions in the ContentCompiler project.

Because ContentCompiler is evolving from a simple content framework into a comprehensive Content Reasoning Framework, new architectural concepts frequently emerge. These ADRs preserve the historical context and justification for these shifts without forcing continuous, premature rewrites of the currently frozen foundational documentation (such as Vision v0.1 and Terminology v0.1). They serve as the official historical log of the project's architectural evolution, systematically preparing the repository for Version 1.0.

---

## ADR-0001: Replace Company Profile with Content Profile

**Status:** Accepted

**Problem:**
The original design assumed the user of the framework would always represent a traditional company, limiting the system's applicability.

**Decision:**
Introduce "Content Profile" as the universal knowledge model. A Company becomes only one possible profile type. Supported examples now include:
- Company
- Personal Brand
- Creator
- Consultant
- Agency
- Podcast
- YouTube Channel
- Newsletter
- Community

**Rationale:**
ContentCompiler should be universally applicable. It must support anyone creating content, not exclusively traditional business entities.

---

## ADR-0002: Goal-Driven Reasoning

**Status:** Accepted

**Problem:**
Traditional prompt systems require users to request outputs directly (e.g., "Generate 30 scripts"), forcing the user to act as the strategist.

**Decision:**
ContentCompiler becomes Goal-Driven. Users express objectives, and the system decides which outputs should be produced.

For example, instead of stating "Generate 30 scripts", a user states "I want to increase qualified leads." The compiler then automatically determines the necessary outputs required to achieve that goal.

**Rationale:**
Shifting the burden of output selection from the user to the framework ensures deeper strategic alignment and maximizes the impact of the generated content.

---

## ADR-0003: Verified Knowledge Only

**Status:** Accepted

**Problem:**
LLMs often rely on assumptions or hallucinate information when generating content, compromising the integrity of the output.

**Decision:**
Only verified knowledge becomes part of the Content Profile. The knowledge lifecycle is strictly defined as:

Collected → Inferred → Pending Verification → Verified → Deprecated.

Inference is never automatically stored. Human approval is mandatory.

**Rationale:**
Enforcing mandatory verification guarantees the structural integrity and factual accuracy of the core knowledge base, preventing compounded errors during generation.

---

## ADR-0004: Evidence-Based Knowledge

**Status:** Accepted

**Problem:**
Facts without traceability reduce trust and complicate future updates or audits of the knowledge base.

**Decision:**
Every knowledge entry should reference its evidence. Every stored fact must be explainable. Examples of evidence include:
- User Interviews
- Uploaded Documents
- Website Analytics
- Social Media Data
- Manual Confirmation

**Rationale:**
Traceability ensures the Content Profile remains a reliable source of truth, establishing an evidence-based foundation for all future content decisions.

---

## ADR-0005: Output Hierarchy

**Status:** Accepted

**Problem:**
Generating unstructured outputs makes it difficult to distinguish between high-level strategy and low-level execution, leading to disorganized content pipelines.

**Decision:**
Outputs are strictly organized into six categories:
1. Knowledge Outputs
2. Strategy Outputs
3. Planning Outputs
4. Creative Outputs
5. Production Outputs
6. Optimization Outputs

The compiler decides which specific outputs within these categories are required based on the user's stated goal.

*Clarification Note: This ADR uses the legacy term "Outputs" to describe strategic choices. In the final Version 1.0 Architecture, "Output" strictly refers to the structural schema of a deliverable (Output Layer). The conceptual decisions described in this ADR are now governed by the Decision Layer and Target Layer.*

**Rationale:**
A structured output hierarchy cleanly separates the reasoning phases from the final execution, enabling a modular and scalable compilation process.

---

## ADR-0006: Knowledge Before Content

**Status:** Accepted

**Problem:**
Generating content directly from raw prompts bypasses strategic alignment, often producing generic and disconnected results.

**Decision:**
Content is never generated from raw prompts. It is always generated from a verified Content Profile. Content generation is the final stage of the pipeline, never the first.

**Rationale:**
This enforces the core philosophy of the framework: execution must always be preceded by rigorous strategy and verified context.

---

## ADR-0007: Platform Independence

**Status:** Accepted

**Problem:**
Tying the reasoning process to specific social or distribution platforms leads to fragmented strategies and duplicated effort.

**Decision:**
Compilation produces strategic content decisions first. Platform-specific adaptation happens afterward. TikTok, Instagram, YouTube, LinkedIn, Facebook, Blogs, and Email are treated strictly as presentation layers, not reasoning layers.

**Rationale:**
Separating the core reasoning from platform formatting allows the same strategic decisions to be efficiently adapted across multiple distribution channels without rebuilding the underlying strategy.

---

## ADR-0008: LLM Independence

**Status:** Accepted

**Problem:**
Coupling the framework to a specific language model introduces vendor lock-in and makes the system brittle to future AI advancements.

**Decision:**
The reasoning model must remain independent from any single AI provider. Claude, ChatGPT, Gemini, and future models must produce equivalent reasoning when given the exact same Content Profile.

**Rationale:**
Platform agnosticism ensures the framework's longevity and adaptability, allowing users to leverage the best available models without restructuring their established Content Profiles.

---

## ADR-0009: Evaluate Planning Layer

**Status:** Informational

**Context:**
During architectural review, discussions arose regarding the potential need for a dedicated Planning Layer to manage multi-package initiatives or long-term content roadmaps.

**Problem:**
The current architecture routes formal intent through the Decision Layer directly into Target Selection and Compilation. As complexity scales, there is a risk that the Decision Layer might become overloaded with long-term sequencing or campaign planning responsibilities.

**Motivation:**
A Planning Layer would theoretically sit between the Decision Layer and the Target Layer, responsible exclusively for sequencing, scheduling, and orchestrating multiple packages over time.

**Architectural Alternatives:**
1. **Status Quo:** Keep sequencing and orchestration within the Decision Layer.
2. **Dedicated Planning Layer:** Introduce a new architectural layer specifically for timelines and campaign orchestration.

**Arguments For:**
- Explicitly separates strategy (what) from planning (when and in what sequence).
- Prevents the Decision Layer from becoming overly complex.

**Arguments Against:**
- Prematurely complicates the architecture before the core contracts are proven.
- It is currently unclear if planning requires a distinct conceptual layer, or if "Planning" is simply a type of Content Decision.

**Current Decision:**
The current architecture remains entirely unchanged. Do NOT introduce a Planning Layer at this time. The Decision Layer is assumed to be sufficient for managing current strategic intent. 

**Future Re-evaluation Criteria:**
A dedicated Planning Layer will only be introduced if future contract development reveals a genuine architectural responsibility (e.g., temporal sequencing, cross-package orchestration) that definitively cannot belong to the Decision Layer without violating the Single Responsibility principle.

---

## ADR-0010: Expand Architecture from Pipeline to Layered System

**Status:** Accepted

**Context:**
The original Vision defined ContentCompiler as a 4-step pipeline: Business Knowledge → Compilation → Content Decisions → Content Creation. In this early model, "Compilation" was responsible for making strategic Content Decisions.

**Problem:**
As the framework evolved, forcing "Compilation" to handle both strategic reasoning (Decisions) and structural assembly (Content Packages) violated the Single Responsibility principle and caused significant conceptual overlap.

**Decision:**
The architecture has officially expanded from a linear pipeline into an 8-layer closed loop: Knowledge → Reasoning → Decision → Target → Compilation → Output → Delivery → Evidence. 

**Rationale:**
This evolution ensures that strategic reasoning (Reasoning/Decision Layers) is explicitly decoupled from structural assembly (Compilation/Output Layers) and physical execution (Delivery). "Compilation" is now strictly redefined as assembling reusable Components into Output Structures, removing all strategic thinking from the assembly process.
