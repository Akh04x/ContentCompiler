# Target Contract v1.0

## Purpose

The Target Layer is a core component of the 8-layer architecture. While the Decision Layer formalizes the strategic intent (e.g., "Increase brand awareness"), the Target Layer determines the realization strategy for that intent (e.g., "A 3-part video series on YouTube").

This contract establishes the formal behavioral specification for the Target Layer. It guarantees that the translation from pure strategy to a concrete realization plan occurs predictably, traceably, and within the constraints of the framework.

## Definition

The **Target Contract** defines the rules governing the Target Layer. The Target Layer is responsible for defining *what* should be produced by establishing the realization strategy.

Crucially, the Target Layer operates under strict negative boundaries:
- The Target Layer never alters strategic intent (Decision Layer responsibility).
- The Target Layer never compiles components or structures content (Compilation Layer responsibility).
- The Target Layer never generates raw content or drafts.

## Layer Responsibilities

The Target Layer is explicitly responsible for:
1. **Realization Strategy Selection:** Selecting the optimal format and package type (e.g., Single Asset, Series, Campaign, Multi-platform Initiative) to fulfill the Approved Decisions.
2. **Target Intent Generation:** Producing the Target Intent entity, which acts as the formal request and requirements container for the Compilation Layer.
3. **Goal Association:** Associating specific Business Goals with the Target Intent to guarantee outcome traceability.

## Inputs

The Target Layer consumes exactly one primary input:
- **Approved Decisions:** The formalized strategic intent passed down from the Decision Layer. 

*(Note: All upstream context such as Brand Constraints, Creative Constraints, and Historical Learnings must be embedded within or referenced by these Approved Decisions.)*

## Outputs

The Target Layer produces exactly one primary output:
- **Target Intent:** A formal entity that defines the realization strategy and establishes the requirements that must be met.

## Target Intent Lifecycle

The Target Intent entity follows a strict lifecycle:
1. **Defined:** The raw realization format is selected based on Decisions.
2. **Constrained:** Platform and systemic constraints are applied to the format.
3. **Approved:** The Target Intent is formally authorized (often by Human Authority) to proceed.
4. **Fulfilled:** The downstream Compilation Layer successfully instantiates Output Structures that meet the Target Intent's requirements.

## Goal Management

The Target Layer acts as the bridge connecting high-level Business Goals to concrete structural requirements. 
- The Target Intent entity serves as the Aggregate Root for Goals.
- It ensures that every required Output Structure remains traceably linked to at least one explicitly defined Goal.

## Relationship with Decisions

- **Upstream Dependency:** Target Intent relies entirely on the Approved Decisions.
- **No Reverse Modification:** The Target Layer cannot reject or modify an Approved Decision. If a Decision is unimplementable, the Target Layer must flag an architectural conflict and halt, rather than silently altering the strategy.

## Relationship with Output Structures

- **Requirement Definition:** Target Intent defines the *requirements* for what must be produced.
- **No Direct Assembly:** Target Intent does not assemble, instantiate, or own the physical Output Structure entity.
- **Fulfillment:** Output Structures (produced by the Compilation Layer) exist to fulfill the requirements defined by the Target Intent.

## Handoff to Compilation

The Target Layer hands off the finalized **Target Intent** to the Compilation Layer. This handoff acts as the formal authorization for the Compilation Layer to begin selecting and assembling components into Output Structures.

## Architectural Guarantees

Any process executing the Target Contract guarantees:
- Every Target Intent is justified by an Approved Decision.
- Every Target Intent is linked to a Business Goal.
- The realization strategy does not violate any constraints embedded in the Decisions.
- The handoff to Compilation contains no strategic ambiguity.

## Out of Scope

This specification strictly excludes:
- Implementation of the algorithms selecting the realization format.
- The physical structure of the Target Intent (e.g., JSON schema).
- Prompt Engineering for realization selection.
- Database storage of Target Intents.
