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
exports.ReasoningOutcome = exports.ReasoningContext = exports.Justification = exports.TradeOff = exports.Alternative = exports.Assumption = exports.EvaluationScore = exports.ConfidenceScore = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var ConfidenceScore = /** @class */ (function (_super) {
    __extends(ConfidenceScore, _super);
    function ConfidenceScore(level) {
        var _this = _super.call(this) || this;
        _this.level = level;
        if (level < 0 || level > 1)
            throw new Error('ConfidenceScore must be between 0 and 1');
        return _this;
    }
    ConfidenceScore.prototype.equals = function (other) {
        return this.level === other.level;
    };
    return ConfidenceScore;
}(DomainBase_1.ValueObject));
exports.ConfidenceScore = ConfidenceScore;
var EvaluationScore = /** @class */ (function (_super) {
    __extends(EvaluationScore, _super);
    function EvaluationScore(score) {
        var _this = _super.call(this) || this;
        _this.score = score;
        if (score < 0 || score > 100)
            throw new Error('EvaluationScore must be between 0 and 100');
        return _this;
    }
    EvaluationScore.prototype.equals = function (other) {
        return this.score === other.score;
    };
    return EvaluationScore;
}(DomainBase_1.ValueObject));
exports.EvaluationScore = EvaluationScore;
var Assumption = /** @class */ (function (_super) {
    __extends(Assumption, _super);
    function Assumption(description) {
        var _this = _super.call(this) || this;
        _this.description = description;
        if (!description.trim())
            throw new Error('Assumption description cannot be empty');
        return _this;
    }
    Assumption.prototype.equals = function (other) {
        return this.description === other.description;
    };
    return Assumption;
}(DomainBase_1.ValueObject));
exports.Assumption = Assumption;
var Alternative = /** @class */ (function (_super) {
    __extends(Alternative, _super);
    function Alternative(id, description, expectedOutcome) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.description = description;
        _this.expectedOutcome = expectedOutcome;
        if (!id.trim() || !description.trim())
            throw new Error('Alternative must have id and description');
        return _this;
    }
    Alternative.prototype.equals = function (other) {
        return this.id === other.id && this.description === other.description && this.expectedOutcome === other.expectedOutcome;
    };
    return Alternative;
}(DomainBase_1.ValueObject));
exports.Alternative = Alternative;
var TradeOff = /** @class */ (function (_super) {
    __extends(TradeOff, _super);
    function TradeOff(advantage, disadvantage) {
        var _this = _super.call(this) || this;
        _this.advantage = advantage;
        _this.disadvantage = disadvantage;
        if (!advantage.trim() || !disadvantage.trim())
            throw new Error('TradeOff must have advantage and disadvantage');
        return _this;
    }
    TradeOff.prototype.equals = function (other) {
        return this.advantage === other.advantage && this.disadvantage === other.disadvantage;
    };
    return TradeOff;
}(DomainBase_1.ValueObject));
exports.TradeOff = TradeOff;
var Justification = /** @class */ (function (_super) {
    __extends(Justification, _super);
    function Justification(rationale) {
        var _this = _super.call(this) || this;
        _this.rationale = rationale;
        if (!rationale.trim())
            throw new Error('Justification rationale cannot be empty');
        return _this;
    }
    Justification.prototype.equals = function (other) {
        return this.rationale === other.rationale;
    };
    return Justification;
}(DomainBase_1.ValueObject));
exports.Justification = Justification;
var ReasoningContext = /** @class */ (function (_super) {
    __extends(ReasoningContext, _super);
    function ReasoningContext(executionId, parameters) {
        var _this = _super.call(this) || this;
        _this.executionId = executionId;
        _this.parameters = parameters;
        if (!executionId.trim())
            throw new Error('ReasoningContext must have an executionId');
        return _this;
    }
    ReasoningContext.prototype.equals = function (other) {
        if (this.executionId !== other.executionId)
            return false;
        var thisKeys = Object.keys(this.parameters);
        var otherKeys = Object.keys(other.parameters);
        if (thisKeys.length !== otherKeys.length)
            return false;
        for (var _i = 0, thisKeys_1 = thisKeys; _i < thisKeys_1.length; _i++) {
            var key = thisKeys_1[_i];
            if (this.parameters[key] !== other.parameters[key])
                return false;
        }
        return true;
    };
    return ReasoningContext;
}(DomainBase_1.ValueObject));
exports.ReasoningContext = ReasoningContext;
var ReasoningOutcome = /** @class */ (function (_super) {
    __extends(ReasoningOutcome, _super);
    function ReasoningOutcome(candidateConclusions, // Will be bound to CandidateConclusion array
    rejectedAlternatives, evaluationSummary) {
        var _this = _super.call(this) || this;
        _this.candidateConclusions = candidateConclusions;
        _this.rejectedAlternatives = rejectedAlternatives;
        _this.evaluationSummary = evaluationSummary;
        if (!evaluationSummary.trim())
            throw new Error('ReasoningOutcome must have an evaluation summary');
        return _this;
    }
    ReasoningOutcome.prototype.equals = function (other) {
        // Structural equality check would go here.
        return this.evaluationSummary === other.evaluationSummary;
    };
    return ReasoningOutcome;
}(DomainBase_1.ValueObject));
exports.ReasoningOutcome = ReasoningOutcome;
