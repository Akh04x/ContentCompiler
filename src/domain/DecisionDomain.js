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
exports.DecisionGraph = exports.Decision = exports.CandidateConclusion = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var CandidateConclusion = /** @class */ (function (_super) {
    __extends(CandidateConclusion, _super);
    function CandidateConclusion(id, version, trace, createdAt, updatedAt, assumptions, alternatives, tradeoffs, confidence, justification, supportingKnowledge, evaluationContext, generatedAt, reasoningVersion) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.assumptions = assumptions;
        _this.alternatives = alternatives;
        _this.tradeoffs = tradeoffs;
        _this.confidence = confidence;
        _this.justification = justification;
        _this.supportingKnowledge = supportingKnowledge;
        _this.evaluationContext = evaluationContext;
        _this.generatedAt = generatedAt;
        _this.reasoningVersion = reasoningVersion;
        return _this;
    }
    return CandidateConclusion;
}(DomainBase_1.BaseEntity));
exports.CandidateConclusion = CandidateConclusion;
var Decision = /** @class */ (function (_super) {
    __extends(Decision, _super);
    function Decision(id, version, trace, createdAt, updatedAt, status, approval, publication, decisionVersion, context, originatingConclusion, approvedBy, approvedAt, publishedAt, reasoningVersionReference, approvalRecord) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.status = status;
        _this.approval = approval;
        _this.publication = publication;
        _this.decisionVersion = decisionVersion;
        _this.context = context;
        _this.originatingConclusion = originatingConclusion;
        _this.approvedBy = approvedBy;
        _this.approvedAt = approvedAt;
        _this.publishedAt = publishedAt;
        _this.reasoningVersionReference = reasoningVersionReference;
        _this.approvalRecord = approvalRecord;
        return _this;
    }
    return Decision;
}(DomainBase_1.BaseEntity));
exports.Decision = Decision;
var DecisionGraph = /** @class */ (function (_super) {
    __extends(DecisionGraph, _super);
    function DecisionGraph(id, version, trace, createdAt, updatedAt, decisions, parentChildMap) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.decisions = decisions;
        _this.parentChildMap = parentChildMap;
        return _this;
    }
    return DecisionGraph;
}(DomainBase_1.BaseEntity));
exports.DecisionGraph = DecisionGraph;
