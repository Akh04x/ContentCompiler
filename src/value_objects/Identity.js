"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanApprovalId = exports.ConstraintId = exports.HistoricalObservationId = exports.PerformanceSignalId = exports.EvidenceId = exports.DeliveryArtifactId = exports.PlatformId = exports.ContentPackageId = exports.ComponentId = exports.OutputStructureId = exports.TargetIntentId = exports.GoalId = exports.DecisionId = exports.ConclusionId = exports.AudienceId = exports.BrandId = exports.KnowledgeId = exports.ProfileId = exports.TypedIdentifier = void 0;
var TypedIdentifier = /** @class */ (function () {
    function TypedIdentifier(value) {
        this.value = value;
        if (!value || value.trim() === '') {
            throw new Error('Identifier value cannot be empty');
        }
    }
    TypedIdentifier.prototype.equals = function (other) {
        return this.value === other.value;
    };
    return TypedIdentifier;
}());
exports.TypedIdentifier = TypedIdentifier;
var ProfileId = /** @class */ (function (_super) {
    __extends(ProfileId, _super);
    function ProfileId(value) {
        return _super.call(this, value) || this;
    }
    return ProfileId;
}(TypedIdentifier));
exports.ProfileId = ProfileId;
var KnowledgeId = /** @class */ (function (_super) {
    __extends(KnowledgeId, _super);
    function KnowledgeId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return KnowledgeId;
}(TypedIdentifier));
exports.KnowledgeId = KnowledgeId;
var BrandId = /** @class */ (function (_super) {
    __extends(BrandId, _super);
    function BrandId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BrandId;
}(TypedIdentifier));
exports.BrandId = BrandId;
var AudienceId = /** @class */ (function (_super) {
    __extends(AudienceId, _super);
    function AudienceId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AudienceId;
}(TypedIdentifier));
exports.AudienceId = AudienceId;
var ConclusionId = /** @class */ (function (_super) {
    __extends(ConclusionId, _super);
    function ConclusionId(value) {
        return _super.call(this, value) || this;
    }
    return ConclusionId;
}(TypedIdentifier));
exports.ConclusionId = ConclusionId;
var DecisionId = /** @class */ (function (_super) {
    __extends(DecisionId, _super);
    function DecisionId(value) {
        return _super.call(this, value) || this;
    }
    return DecisionId;
}(TypedIdentifier));
exports.DecisionId = DecisionId;
var GoalId = /** @class */ (function (_super) {
    __extends(GoalId, _super);
    function GoalId(value) {
        return _super.call(this, value) || this;
    }
    return GoalId;
}(TypedIdentifier));
exports.GoalId = GoalId;
var TargetIntentId = /** @class */ (function (_super) {
    __extends(TargetIntentId, _super);
    function TargetIntentId(value) {
        return _super.call(this, value) || this;
    }
    return TargetIntentId;
}(TypedIdentifier));
exports.TargetIntentId = TargetIntentId;
var OutputStructureId = /** @class */ (function (_super) {
    __extends(OutputStructureId, _super);
    function OutputStructureId(value) {
        return _super.call(this, value) || this;
    }
    return OutputStructureId;
}(TypedIdentifier));
exports.OutputStructureId = OutputStructureId;
var ComponentId = /** @class */ (function (_super) {
    __extends(ComponentId, _super);
    function ComponentId(value) {
        return _super.call(this, value) || this;
    }
    return ComponentId;
}(TypedIdentifier));
exports.ComponentId = ComponentId;
var ContentPackageId = /** @class */ (function (_super) {
    __extends(ContentPackageId, _super);
    function ContentPackageId(value) {
        return _super.call(this, value) || this;
    }
    return ContentPackageId;
}(TypedIdentifier));
exports.ContentPackageId = ContentPackageId;
var PlatformId = /** @class */ (function (_super) {
    __extends(PlatformId, _super);
    function PlatformId(value) {
        return _super.call(this, value) || this;
    }
    return PlatformId;
}(TypedIdentifier));
exports.PlatformId = PlatformId;
var DeliveryArtifactId = /** @class */ (function (_super) {
    __extends(DeliveryArtifactId, _super);
    function DeliveryArtifactId(value) {
        return _super.call(this, value) || this;
    }
    return DeliveryArtifactId;
}(TypedIdentifier));
exports.DeliveryArtifactId = DeliveryArtifactId;
var EvidenceId = /** @class */ (function (_super) {
    __extends(EvidenceId, _super);
    function EvidenceId(value) {
        return _super.call(this, value) || this;
    }
    return EvidenceId;
}(TypedIdentifier));
exports.EvidenceId = EvidenceId;
var PerformanceSignalId = /** @class */ (function (_super) {
    __extends(PerformanceSignalId, _super);
    function PerformanceSignalId(value) {
        return _super.call(this, value) || this;
    }
    return PerformanceSignalId;
}(TypedIdentifier));
exports.PerformanceSignalId = PerformanceSignalId;
var HistoricalObservationId = /** @class */ (function (_super) {
    __extends(HistoricalObservationId, _super);
    function HistoricalObservationId(value) {
        return _super.call(this, value) || this;
    }
    return HistoricalObservationId;
}(TypedIdentifier));
exports.HistoricalObservationId = HistoricalObservationId;
var ConstraintId = /** @class */ (function (_super) {
    __extends(ConstraintId, _super);
    function ConstraintId(value) {
        return _super.call(this, value) || this;
    }
    return ConstraintId;
}(TypedIdentifier));
exports.ConstraintId = ConstraintId;
var HumanApprovalId = /** @class */ (function (_super) {
    __extends(HumanApprovalId, _super);
    function HumanApprovalId(value) {
        return _super.call(this, value) || this;
    }
    return HumanApprovalId;
}(TypedIdentifier));
exports.HumanApprovalId = HumanApprovalId;
