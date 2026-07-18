"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStateValidator = exports.ApplicationConfigValidator = exports.HumanApprovalValidator = exports.ConstraintValidator = exports.HistoricalObservationValidator = exports.PerformanceSignalValidator = exports.EvidenceValidator = exports.DeliveryArtifactValidator = exports.PlatformValidator = exports.ContentPackageValidator = exports.ComponentValidator = exports.GoalValidator = exports.OutputStructureValidator = exports.TargetIntentValidator = exports.ApprovalValidator = exports.DecisionGraphValidator = exports.DecisionValidator = exports.CandidateConclusionValidator = exports.AudienceValidator = exports.BrandValidator = exports.ContentProfileValidator = exports.KnowledgeValidator = void 0;
var KnowledgeVOs_1 = require("../value_objects/KnowledgeVOs");
var TargetVOs_1 = require("../value_objects/TargetVOs");
var OutputVOs_1 = require("../value_objects/OutputVOs");
// Generic dummy implementation for the skeleton layers not yet implemented
function pass() {
    return { isValid: true, errors: [] };
}
var KnowledgeValidator = /** @class */ (function () {
    function KnowledgeValidator() {
    }
    KnowledgeValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.fact || entity.fact.trim() === '') {
            errors.push('Knowledge fact cannot be empty');
        }
        if (entity.verificationStatus.equals(KnowledgeVOs_1.VerificationStatus.VERIFIED)) {
            if (!entity.citations || entity.citations.length === 0) {
                errors.push('Verified knowledge must contain at least one citation');
            }
        }
        if (entity.confidence.level < 0 || entity.confidence.level > 1) {
            errors.push('Confidence score out of bounds');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return KnowledgeValidator;
}());
exports.KnowledgeValidator = KnowledgeValidator;
var ContentProfileValidator = /** @class */ (function () {
    function ContentProfileValidator() {
    }
    ContentProfileValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.brandId)
            errors.push('Content Profile must have a Brand ID');
        if (!entity.targetAudiences || entity.targetAudiences.length === 0) {
            errors.push('Content Profile must have at least one Target Audience');
        }
        // Deep validation of internal knowledge objects
        if (entity.knowledge && entity.knowledge.length > 0) {
            var kv = new KnowledgeValidator();
            for (var i = 0; i < entity.knowledge.length; i++) {
                var res = kv.validate(entity.knowledge[i]);
                if (!res.isValid) {
                    errors.push("Knowledge item ".concat(i, " invalid: ").concat(res.errors.join(', ')));
                }
            }
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return ContentProfileValidator;
}());
exports.ContentProfileValidator = ContentProfileValidator;
var BrandValidator = /** @class */ (function () {
    function BrandValidator() {
    }
    BrandValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.guidelines || entity.guidelines.trim() === '') {
            errors.push('Brand guidelines cannot be empty');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return BrandValidator;
}());
exports.BrandValidator = BrandValidator;
var AudienceValidator = /** @class */ (function () {
    function AudienceValidator() {
    }
    AudienceValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.description || entity.description.trim() === '') {
            errors.push('Audience description cannot be empty');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return AudienceValidator;
}());
exports.AudienceValidator = AudienceValidator;
var CandidateConclusionValidator = /** @class */ (function () {
    function CandidateConclusionValidator() {
    }
    CandidateConclusionValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.confidence)
            errors.push('Confidence is required');
        if (!entity.justification)
            errors.push('Justification is required');
        if (!entity.supportingKnowledge || entity.supportingKnowledge.length === 0) {
            errors.push('At least one supporting knowledge reference is required');
        }
        else {
            var uniqueKnowledge = new Set(entity.supportingKnowledge.map(function (k) { return k.value; }));
            if (uniqueKnowledge.size !== entity.supportingKnowledge.length) {
                errors.push('Supporting knowledge references must be unique');
            }
        }
        if (entity.alternatives && entity.alternatives.length > 0) {
            var uniqueAlternatives = new Set(entity.alternatives.map(function (a) { return a.id; }));
            if (uniqueAlternatives.size !== entity.alternatives.length) {
                errors.push('Alternatives must be unique');
            }
        }
        if (entity.tradeoffs && entity.tradeoffs.length > 0) {
            for (var _i = 0, _a = entity.tradeoffs; _i < _a.length; _i++) {
                var t = _a[_i];
                if (t.advantage === t.disadvantage) {
                    errors.push('Tradeoffs cannot have identical advantage and disadvantage');
                }
            }
        }
        if (!entity.evaluationContext) {
            errors.push('Evaluation context is required');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return CandidateConclusionValidator;
}());
exports.CandidateConclusionValidator = CandidateConclusionValidator;
var DecisionVOs_1 = require("../value_objects/DecisionVOs");
var DecisionValidator = /** @class */ (function () {
    function DecisionValidator() {
    }
    DecisionValidator.prototype.validate = function (entity) {
        var errors = [];
        // Static invariant checks
        if (!entity.status)
            errors.push('Decision status is required');
        if (!entity.approval)
            errors.push('Approval status is required');
        if (!entity.publication)
            errors.push('Publication status is required');
        if (entity.publication && entity.publication.status === DecisionVOs_1.PublicationStatusEnum.Published) {
            if (entity.approval.status !== DecisionVOs_1.ApprovalStatusEnum.Approved) {
                errors.push('Decision cannot be published unless it is approved');
            }
            if (!entity.publishedAt) {
                errors.push('Published decision must have a publishedAt timestamp');
            }
        }
        if (entity.approval && entity.approval.status === DecisionVOs_1.ApprovalStatusEnum.Approved) {
            if (!entity.approvalRecord)
                errors.push('Approved decision must have an ApprovalRecord');
            if (!entity.approvedBy)
                errors.push('Approved decision must have an approvedBy user');
            if (!entity.approvedAt)
                errors.push('Approved decision must have an approvedAt timestamp');
        }
        if (entity.status && entity.status.status === DecisionVOs_1.DecisionStatusEnum.Archived) {
            if (entity.publication && entity.publication.status === DecisionVOs_1.PublicationStatusEnum.Published) {
                errors.push('Archived decision cannot be published');
            }
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    DecisionValidator.prototype.validateTransition = function (oldEntity, newEntity) {
        var _a;
        var errors = [];
        // Validate monotonic version
        if (newEntity.decisionVersion.major < oldEntity.decisionVersion.major) {
            errors.push('Decision version must be monotonic');
        }
        else if (newEntity.decisionVersion.major === oldEntity.decisionVersion.major) {
            if (newEntity.decisionVersion.minor < oldEntity.decisionVersion.minor) {
                errors.push('Decision version must be monotonic');
            }
            else if (newEntity.decisionVersion.minor === oldEntity.decisionVersion.minor) {
                if (newEntity.decisionVersion.patch < oldEntity.decisionVersion.patch) {
                    errors.push('Decision version must be monotonic');
                }
            }
        }
        // Lifecycle transitions
        var validTransitions = (_a = {},
            _a[DecisionVOs_1.DecisionStatusEnum.Draft] = [DecisionVOs_1.DecisionStatusEnum.PendingApproval, DecisionVOs_1.DecisionStatusEnum.Archived],
            _a[DecisionVOs_1.DecisionStatusEnum.PendingApproval] = [DecisionVOs_1.DecisionStatusEnum.Approved, DecisionVOs_1.DecisionStatusEnum.Draft, DecisionVOs_1.DecisionStatusEnum.Archived],
            _a[DecisionVOs_1.DecisionStatusEnum.Approved] = [DecisionVOs_1.DecisionStatusEnum.Published, DecisionVOs_1.DecisionStatusEnum.Archived],
            _a[DecisionVOs_1.DecisionStatusEnum.Published] = [DecisionVOs_1.DecisionStatusEnum.Deprecated],
            _a[DecisionVOs_1.DecisionStatusEnum.Deprecated] = [DecisionVOs_1.DecisionStatusEnum.Archived],
            _a[DecisionVOs_1.DecisionStatusEnum.Archived] = [],
            _a);
        if (oldEntity.status.status !== newEntity.status.status) {
            var allowed = validTransitions[oldEntity.status.status] || [];
            if (!allowed.includes(newEntity.status.status)) {
                errors.push("Invalid lifecycle transition from ".concat(oldEntity.status.status, " to ").concat(newEntity.status.status));
            }
        }
        // Archived decisions are immutable in status
        if (oldEntity.status.status === DecisionVOs_1.DecisionStatusEnum.Archived && newEntity.status.status !== DecisionVOs_1.DecisionStatusEnum.Archived) {
            errors.push('Archived decisions cannot change status');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return DecisionValidator;
}());
exports.DecisionValidator = DecisionValidator;
var DecisionGraphValidator = /** @class */ (function () {
    function DecisionGraphValidator() {
    }
    DecisionGraphValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.decisions || entity.decisions.length === 0) {
            errors.push('DecisionGraph must contain at least one decision');
        }
        // Check parentChildMap consistency
        if (entity.parentChildMap) {
            var decisionIds = new Set(entity.decisions.map(function (d) { return d.id.value; }));
            for (var _i = 0, _a = Array.from(entity.parentChildMap.entries()); _i < _a.length; _i++) {
                var _b = _a[_i], parent_1 = _b[0], children = _b[1];
                if (!decisionIds.has(parent_1)) {
                    errors.push("Parent decision ".concat(parent_1, " in map does not exist in graph"));
                }
                for (var _c = 0, children_1 = children; _c < children_1.length; _c++) {
                    var child = children_1[_c];
                    if (!decisionIds.has(child)) {
                        errors.push("Child decision ".concat(child, " in map does not exist in graph"));
                    }
                }
            }
        }
        for (var _d = 0, _e = entity.decisions; _d < _e.length; _d++) {
            var dec = _e[_d];
            if (!dec.originatingConclusion) {
                errors.push("Decision ".concat(dec.id.value, " must have an originating CandidateConclusion reference"));
            }
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return DecisionGraphValidator;
}());
exports.DecisionGraphValidator = DecisionGraphValidator;
var ApprovalValidator = /** @class */ (function () {
    function ApprovalValidator() {
    }
    ApprovalValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.approverId)
            errors.push('Approver ID is required');
        if (!entity.status)
            errors.push('Approval status is required');
        if (entity.timestamp <= 0)
            errors.push('Timestamp must be valid');
        return { isValid: errors.length === 0, errors: errors };
    };
    return ApprovalValidator;
}());
exports.ApprovalValidator = ApprovalValidator;
var TargetIntentValidator = /** @class */ (function () {
    function TargetIntentValidator() {
    }
    TargetIntentValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.goals || entity.goals.length === 0)
            errors.push('TargetIntent must have at least one Goal');
        if (!entity.originatingDecisions || entity.originatingDecisions.length === 0) {
            errors.push('TargetIntent must reference at least one originating Decision');
        }
        if (!entity.executionId || entity.executionId.trim() === '')
            errors.push('TargetIntent must have an executionId');
        if (entity.status.status === TargetVOs_1.TargetIntentStatusEnum.Constrained && !entity.constraints) {
            errors.push('Constrained TargetIntent must have constraints');
        }
        if (entity.status.status === TargetVOs_1.TargetIntentStatusEnum.Approved) {
            if (!entity.constraints)
                errors.push('Approved TargetIntent must have constraints');
            if (!entity.approvedBy || !entity.approvedAt)
                errors.push('Approved TargetIntent must have human approval metadata');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    TargetIntentValidator.prototype.validateTransition = function (oldEntity, newEntity) {
        var _a;
        var allowed = (_a = {},
            _a[TargetVOs_1.TargetIntentStatusEnum.Defined] = [TargetVOs_1.TargetIntentStatusEnum.Constrained],
            _a[TargetVOs_1.TargetIntentStatusEnum.Constrained] = [TargetVOs_1.TargetIntentStatusEnum.Approved],
            _a[TargetVOs_1.TargetIntentStatusEnum.Approved] = [TargetVOs_1.TargetIntentStatusEnum.Fulfilled],
            _a[TargetVOs_1.TargetIntentStatusEnum.Fulfilled] = [],
            _a[TargetVOs_1.TargetIntentStatusEnum.Deprecated] = [],
            _a[TargetVOs_1.TargetIntentStatusEnum.Archived] = [],
            _a);
        if (oldEntity.status.status === newEntity.status.status)
            return { isValid: true, errors: [] };
        var isAllowed = (allowed[oldEntity.status.status] || []).includes(newEntity.status.status);
        return isAllowed
            ? { isValid: true, errors: [] }
            : { isValid: false, errors: ["Invalid lifecycle transition from ".concat(oldEntity.status.status, " to ").concat(newEntity.status.status)] };
    };
    return TargetIntentValidator;
}());
exports.TargetIntentValidator = TargetIntentValidator;
var OutputStructureValidator = /** @class */ (function () {
    function OutputStructureValidator() {
    }
    OutputStructureValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.targetIntentId)
            errors.push('OutputStructure must reference a TargetIntent');
        if (!entity.componentIds || entity.componentIds.length === 0)
            errors.push('OutputStructure must contain at least one Component');
        var unique = new Set((entity.componentIds || []).map(function (component) { return component.value; }));
        if (unique.size !== (entity.componentIds || []).length)
            errors.push('OutputStructure component references must be unique');
        return { isValid: errors.length === 0, errors: errors };
    };
    return OutputStructureValidator;
}());
exports.OutputStructureValidator = OutputStructureValidator;
var GoalValidator = /** @class */ (function () {
    function GoalValidator() {
    }
    GoalValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.objective || entity.objective.trim() === '')
            errors.push('Goal objective cannot be empty');
        if (!entity.priority)
            errors.push('Goal priority is required');
        return { isValid: errors.length === 0, errors: errors };
    };
    return GoalValidator;
}());
exports.GoalValidator = GoalValidator;
var ComponentValidator = /** @class */ (function () {
    function ComponentValidator() {
    }
    ComponentValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.type || entity.type.trim() === '')
            errors.push('Component type cannot be empty');
        if (!entity.content || entity.content.trim() === '')
            errors.push('Component content cannot be empty');
        return { isValid: errors.length === 0, errors: errors };
    };
    return ComponentValidator;
}());
exports.ComponentValidator = ComponentValidator;
var ContentPackageValidator = /** @class */ (function () {
    function ContentPackageValidator() {
    }
    ContentPackageValidator.prototype.validate = function (entity) {
        var _a;
        var errors = [];
        if (!entity.structure)
            errors.push('ContentPackage must contain an OutputStructure');
        if (!entity.components || entity.components.length === 0)
            errors.push('ContentPackage must contain Components');
        var componentIds = new Set((entity.components || []).map(function (component) { return component.id.value; }));
        for (var _i = 0, _b = ((_a = entity.structure) === null || _a === void 0 ? void 0 : _a.componentIds) || []; _i < _b.length; _i++) {
            var expected = _b[_i];
            if (!componentIds.has(expected.value))
                errors.push("ContentPackage is missing structure component ".concat(expected.value));
        }
        if (entity.status && (entity.status.status === OutputVOs_1.ContentPackageStatusEnum.Validated || entity.status.status === OutputVOs_1.ContentPackageStatusEnum.Approved)) {
            var _loop_1 = function (type) {
                if (!(entity.components || []).some(function (component) { return component.type === type; }))
                    errors.push("ContentPackage is missing required ".concat(type, " component"));
            };
            for (var _c = 0, _d = ['Goal', 'Format', 'Constraints']; _c < _d.length; _c++) {
                var type = _d[_c];
                _loop_1(type);
            }
        }
        if (entity.status && entity.status.status === OutputVOs_1.ContentPackageStatusEnum.Approved && (!entity.approvedBy || !entity.approvedAt)) {
            errors.push('Approved ContentPackage must have human approval metadata');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    ContentPackageValidator.prototype.validateTransition = function (oldEntity, newEntity) {
        var _a;
        var allowed = (_a = {},
            _a[OutputVOs_1.ContentPackageStatusEnum.Draft] = [OutputVOs_1.ContentPackageStatusEnum.Assembled],
            _a[OutputVOs_1.ContentPackageStatusEnum.Assembled] = [OutputVOs_1.ContentPackageStatusEnum.Validated],
            _a[OutputVOs_1.ContentPackageStatusEnum.Validated] = [OutputVOs_1.ContentPackageStatusEnum.Approved],
            _a[OutputVOs_1.ContentPackageStatusEnum.Approved] = [OutputVOs_1.ContentPackageStatusEnum.Delivered, OutputVOs_1.ContentPackageStatusEnum.Archived],
            _a[OutputVOs_1.ContentPackageStatusEnum.Delivered] = [OutputVOs_1.ContentPackageStatusEnum.Archived],
            _a[OutputVOs_1.ContentPackageStatusEnum.Archived] = [],
            _a);
        var valid = (allowed[oldEntity.status.status] || []).includes(newEntity.status.status);
        return valid ? { isValid: true, errors: [] } : { isValid: false, errors: ["Invalid lifecycle transition from ".concat(oldEntity.status.status, " to ").concat(newEntity.status.status)] };
    };
    return ContentPackageValidator;
}());
exports.ContentPackageValidator = ContentPackageValidator;
var PlatformValidator = /** @class */ (function () {
    function PlatformValidator() {
    }
    PlatformValidator.prototype.validate = function (entity) {
        return !entity.name || entity.name.trim() === ''
            ? { isValid: false, errors: ['Platform name cannot be empty'] }
            : { isValid: true, errors: [] };
    };
    return PlatformValidator;
}());
exports.PlatformValidator = PlatformValidator;
var DeliveryArtifactValidator = /** @class */ (function () {
    function DeliveryArtifactValidator() {
    }
    DeliveryArtifactValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.contentPackageId)
            errors.push('DeliveryArtifact must reference a ContentPackage');
        if (!entity.platformId)
            errors.push('DeliveryArtifact must reference a Platform');
        if (!entity.externalReference || entity.externalReference.trim() === '')
            errors.push('DeliveryArtifact externalReference cannot be empty');
        if (entity.deliveredAt <= 0)
            errors.push('DeliveryArtifact deliveredAt must be positive');
        return { isValid: errors.length === 0, errors: errors };
    };
    return DeliveryArtifactValidator;
}());
exports.DeliveryArtifactValidator = DeliveryArtifactValidator;
var EvidenceValidator = /** @class */ (function () {
    function EvidenceValidator() {
    }
    EvidenceValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.deliveryArtifactId)
            errors.push('Evidence must reference a DeliveryArtifact');
        if (!entity.signals || entity.signals.length === 0)
            errors.push('Evidence must contain at least one observation');
        for (var _i = 0, _a = entity.signals || []; _i < _a.length; _i++) {
            var signal = _a[_i];
            if (signal.deliveryArtifactId.value !== entity.deliveryArtifactId.value)
                errors.push('Every Evidence observation must reference the same DeliveryArtifact');
        }
        return { isValid: errors.length === 0, errors: errors };
    };
    return EvidenceValidator;
}());
exports.EvidenceValidator = EvidenceValidator;
var PerformanceSignalValidator = /** @class */ (function () {
    function PerformanceSignalValidator() {
    }
    PerformanceSignalValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.metric || entity.metric.trim() === '')
            errors.push('PerformanceSignal metric cannot be empty');
        if (!Number.isFinite(entity.value))
            errors.push('PerformanceSignal value must be finite');
        if (entity.observedAt <= 0)
            errors.push('PerformanceSignal observedAt must be positive');
        return { isValid: errors.length === 0, errors: errors };
    };
    return PerformanceSignalValidator;
}());
exports.PerformanceSignalValidator = PerformanceSignalValidator;
var HistoricalObservationValidator = /** @class */ (function () {
    function HistoricalObservationValidator() {
    }
    HistoricalObservationValidator.prototype.validate = function (entity) {
        var errors = [];
        if (!entity.event || entity.event.trim() === '')
            errors.push('HistoricalObservation event cannot be empty');
        if (entity.observedAt <= 0)
            errors.push('HistoricalObservation observedAt must be positive');
        return { isValid: errors.length === 0, errors: errors };
    };
    return HistoricalObservationValidator;
}());
exports.HistoricalObservationValidator = HistoricalObservationValidator;
var ConstraintValidator = /** @class */ (function () {
    function ConstraintValidator() {
    }
    ConstraintValidator.prototype.validate = function (entity) { return pass(); };
    return ConstraintValidator;
}());
exports.ConstraintValidator = ConstraintValidator;
var HumanApprovalValidator = /** @class */ (function () {
    function HumanApprovalValidator() {
    }
    HumanApprovalValidator.prototype.validate = function (entity) { return pass(); };
    return HumanApprovalValidator;
}());
exports.HumanApprovalValidator = HumanApprovalValidator;
var ApplicationConfigValidator = /** @class */ (function () {
    function ApplicationConfigValidator() {
    }
    ApplicationConfigValidator.prototype.validate = function (entity) { return pass(); };
    return ApplicationConfigValidator;
}());
exports.ApplicationConfigValidator = ApplicationConfigValidator;
var ApplicationStateValidator = /** @class */ (function () {
    function ApplicationStateValidator() {
    }
    ApplicationStateValidator.prototype.validate = function (entity) { return pass(); };
    return ApplicationStateValidator;
}());
exports.ApplicationStateValidator = ApplicationStateValidator;
