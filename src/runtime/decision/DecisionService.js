"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionService = void 0;
var Result_1 = require("../../shared/Result");
var ErrorHierarchy_1 = require("../../shared/ErrorHierarchy");
var DecisionVOs_1 = require("../../value_objects/DecisionVOs");
/**
 * DecisionService is the exclusive orchestration authority for the Decision Layer.
 *
 * The Pipeline is a thin transport coordinator; it MUST NOT coordinate validators,
 * factories, or repositories directly. The Pipeline invokes this Service.
 *
 * Application Service Responsibilities (per IMPLEMENTATION_PRINCIPLES.md):
 *  - Validation -> Factory -> Repository -> Output ordering for every transition.
 *  - Lifecycle transitions through Draft -> PendingApproval -> Approved -> Published.
 *  - Explicit Human Authority: no automated approval. A HumanApproval entity MUST be supplied.
 *  - DecisionGraph maintenance: append, never overwrite. Propagate save errors.
 */
var DecisionService = /** @class */ (function () {
    function DecisionService(decisionFactory, graphFactory, decisionRepo, graphRepo, decisionValidator, graphValidator, candidateConclusionValidator, clock) {
        this.decisionFactory = decisionFactory;
        this.graphFactory = graphFactory;
        this.decisionRepo = decisionRepo;
        this.graphRepo = graphRepo;
        this.decisionValidator = decisionValidator;
        this.graphValidator = graphValidator;
        this.candidateConclusionValidator = candidateConclusionValidator;
        this.clock = clock;
    }
    /**
     * High-level orchestration: full lifecycle from CandidateConclusion to Published Decision.
     * Convenience for callers that have the conclusion and context in hand. The internal
     * promotion produces a draft id, so the caller cannot pre-build the HumanApproval;
     * use {@link executeApprovalAndPublishFlow} for the canonical flow.
     *
     * Required Execution Order (per Foundation v1.0):
     *   Input -> Validation -> Lifecycle Transitions -> Factory (version+trace) -> Repository -> DecisionGraph -> Output
     */
    DecisionService.prototype.executeDecisionFlow = function (conclusion, context, approval) {
        return __awaiter(this, void 0, void 0, function () {
            var conclusionValRes, draft;
            return __generator(this, function (_a) {
                conclusionValRes = this.candidateConclusionValidator.validate(conclusion);
                if (!conclusionValRes.isValid) {
                    return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("CandidateConclusion invalid: ".concat(conclusionValRes.errors.join(', '))))];
                }
                draft = this.promoteCandidateConclusion(conclusion, context);
                return [2 /*return*/, this.executeApprovalAndPublishFlow(draft, approval)];
            });
        });
    };
    /**
     * Canonical orchestration entry point for the pipeline.
     * Caller supplies an already-promoted Draft Decision and a HumanApproval that
     * targets the draft's id. This makes Human Authority explicit at the boundary.
     *
     * Required Execution Order (per Foundation v1.0):
     *   Input -> Validation -> Lifecycle Transitions -> Factory (version+trace) -> Repository -> DecisionGraph -> Output
     */
    DecisionService.prototype.executeApprovalAndPublishFlow = function (draft, approval) {
        return __awaiter(this, void 0, void 0, function () {
            var draftRes, submitted, approved, published, saveRes, graphRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        draftRes = this.decisionValidator.validate(draft);
                        if (!draftRes.isValid) {
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Draft invalid: ".concat(draftRes.errors.join(', '))))];
                        }
                        if (draft.status.status !== DecisionVOs_1.DecisionStatusEnum.Draft) {
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Expected Draft status, got ".concat(draft.status.status)))];
                        }
                        submitted = this.submitForApproval(draft);
                        if (!submitted.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(submitted.error)];
                        }
                        approved = this.approve(submitted.value, approval);
                        if (!approved.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(approved.error)];
                        }
                        published = this.publish(approved.value);
                        if (!published.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(published.error)];
                        }
                        return [4 /*yield*/, this.decisionRepo.save(published.value)];
                    case 1:
                        saveRes = _a.sent();
                        if (!saveRes.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(saveRes.error)];
                        }
                        return [4 /*yield*/, this.appendToDecisionGraph(published.value)];
                    case 2:
                        graphRes = _a.sent();
                        if (!graphRes.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(graphRes.error)];
                        }
                        return [2 /*return*/, new Result_1.Success(published.value)];
                }
            });
        });
    };
    // ============================================================================
    // Lifecycle Transition API
    // ============================================================================
    /** Promote a validated CandidateConclusion into a Draft Decision. */
    DecisionService.prototype.promoteCandidateConclusion = function (conclusion, context) {
        return this.decisionFactory.promoteCandidateConclusion(context.executionId, 'DecisionService.promote', conclusion, context);
    };
    /** Transition Draft -> PendingApproval. */
    DecisionService.prototype.submitForApproval = function (decision) {
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.PendingApproval));
    };
    /**
     * Apply Human Authority: transition PendingApproval -> Approved.
     *
     * Per the Architectural Guarantee "Human Authority is absolute", a valid
     * HumanApproval entity is required. The approval's targetId must match the
     * decision's id. Automated approval is forbidden by contract.
     */
    DecisionService.prototype.approve = function (decision, approval) {
        var approvalCheck = this.validateHumanApproval(approval, decision);
        if (!approvalCheck.isSuccess) {
            return new Result_1.Failure(approvalCheck.error);
        }
        if (decision.status.status !== DecisionVOs_1.DecisionStatusEnum.PendingApproval) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Cannot approve decision in status ".concat(decision.status.status, "; expected PendingApproval")));
        }
        var now = this.clock.now();
        var record = new DecisionVOs_1.ApprovalRecord(approval.approvedBy, now, new DecisionVOs_1.ApprovalStatus(DecisionVOs_1.ApprovalStatusEnum.Approved), 'Approved by human authority');
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Approved), record);
    };
    /**
     * Reject a Pending Approval: transition PendingApproval -> Draft and record the rejection.
     */
    DecisionService.prototype.reject = function (decision, approval, notes) {
        var approvalCheck = this.validateHumanApproval(approval, decision);
        if (!approvalCheck.isSuccess) {
            return new Result_1.Failure(approvalCheck.error);
        }
        if (decision.status.status !== DecisionVOs_1.DecisionStatusEnum.PendingApproval) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Cannot reject decision in status ".concat(decision.status.status, "; expected PendingApproval")));
        }
        if (!notes || notes.trim() === '') {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError('Rejection notes are required'));
        }
        var now = this.clock.now();
        var record = new DecisionVOs_1.ApprovalRecord(approval.approvedBy, now, new DecisionVOs_1.ApprovalStatus(DecisionVOs_1.ApprovalStatusEnum.Rejected), notes);
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Draft), record);
    };
    /** Publish an Approved Decision: transition Approved -> Published. */
    DecisionService.prototype.publish = function (decision) {
        if (decision.status.status !== DecisionVOs_1.DecisionStatusEnum.Approved) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Cannot publish decision in status ".concat(decision.status.status, "; expected Approved")));
        }
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Published));
    };
    /** Deprecate a Published Decision: transition Published -> Deprecated. */
    DecisionService.prototype.deprecate = function (decision) {
        if (decision.status.status !== DecisionVOs_1.DecisionStatusEnum.Published) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Cannot deprecate decision in status ".concat(decision.status.status, "; expected Published")));
        }
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Deprecated));
    };
    /** Archive any non-archived Decision. */
    DecisionService.prototype.archive = function (decision) {
        if (decision.status.status === DecisionVOs_1.DecisionStatusEnum.Archived) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError('Decision is already archived'));
        }
        return this.applyTransition(decision, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Archived));
    };
    // ============================================================================
    // DecisionGraph API
    // ============================================================================
    /**
     * Append a Decision to the appropriate DecisionGraph.
     * If a graph already exists for the decision's executionId, the new decision is appended
     * to that graph. Otherwise, a new graph is created. Errors are propagated.
     */
    DecisionService.prototype.appendToDecisionGraph = function (decision) {
        return __awaiter(this, void 0, void 0, function () {
            var existingRes, graph, existingGraph, valRes, saveRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.graphRepo.findByExecutionId(decision.context.executionId)];
                    case 1:
                        existingRes = _a.sent();
                        if (existingRes.isSuccess && existingRes.value.length > 0) {
                            existingGraph = existingRes.value[0];
                            try {
                                graph = this.graphFactory.withAppendedDecision(existingGraph, decision);
                            }
                            catch (err) {
                                return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Failed to append to existing DecisionGraph: ".concat(err.message)))];
                            }
                        }
                        else {
                            // Create a new graph anchored on this decision
                            graph = this.graphFactory.create(decision.context.executionId, 'DecisionService.append', [decision], new Map());
                        }
                        valRes = this.graphValidator.validate(graph);
                        if (!valRes.isValid) {
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("DecisionGraph invalid: ".concat(valRes.errors.join(', '))))];
                        }
                        return [4 /*yield*/, this.graphRepo.save(graph)];
                    case 2:
                        saveRes = _a.sent();
                        if (!saveRes.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(saveRes.error)];
                        }
                        return [2 /*return*/, new Result_1.Success(graph)];
                }
            });
        });
    };
    // ============================================================================
    // Internal helpers
    // ============================================================================
    /**
     * Apply a status transition with full invariants:
     *  - Validates the transition against the Decision lifecycle rules.
     *  - Validates the resulting entity against the Decision schema.
     *  - Updates the version and trace via the factory.
     *
     * When an ApprovalRecord is supplied, the decision is rebound to the
     * approver, approval status, and timestamps carried by the record.
     */
    DecisionService.prototype.applyTransition = function (decision, newStatus, approvalRecord) {
        var isPublishing = newStatus.status === DecisionVOs_1.DecisionStatusEnum.Published;
        var newPublication = isPublishing
            ? new DecisionVOs_1.PublicationStatus(DecisionVOs_1.PublicationStatusEnum.Published)
            : null;
        var newPublishedAt = isPublishing ? this.clock.now() : null;
        // Use the factory closure for the transition mechanics - no `new Decision` in service.
        var next = this.decisionFactory.transitionTo(decision, newStatus, approvalRecord || null, newPublication, newPublishedAt);
        var transitionRes = this.decisionValidator.validateTransition(decision, next);
        if (!transitionRes.isValid) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Invalid transition ".concat(decision.status.status, " -> ").concat(newStatus.status, ": ").concat(transitionRes.errors.join(', '))));
        }
        var entityRes = this.decisionValidator.validate(next);
        if (!entityRes.isValid) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Decision invalid after transition: ".concat(entityRes.errors.join(', '))));
        }
        return new Result_1.Success(this.decisionFactory.withUpdatedVersionAndTrace(next));
    };
    /**
     * Validate that a HumanApproval entity is structurally present and targets
     * the supplied decision. The "approvedBy" field must be a non-empty string.
     */
    DecisionService.prototype.validateHumanApproval = function (approval, decision) {
        if (!approval) {
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError('HumanApproval entity is required'));
        }
        if (!approval.approvedBy || approval.approvedBy.trim() === '') {
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError('HumanApproval.approvedBy is required'));
        }
        if (!approval.targetId || !approval.targetId.value || approval.targetId.value.trim() === '') {
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError('HumanApproval.targetId is required'));
        }
        if (approval.targetId.value !== decision.id.value) {
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError("HumanApproval target mismatch: expected ".concat(decision.id.value, ", got ").concat(approval.targetId.value)));
        }
        return new Result_1.Success(undefined);
    };
    return DecisionService;
}());
exports.DecisionService = DecisionService;
