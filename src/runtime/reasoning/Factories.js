"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateConclusionFactory = void 0;
var DecisionDomain_1 = require("../../domain/DecisionDomain");
var Identity_1 = require("../../value_objects/Identity");
function generateId() {
    return 'conc-' + Math.random().toString(36).substring(2, 9);
}
function createInitialVersion() {
    return {
        currentVersion: '1.0.0',
        versionIdentifier: 'v1',
        metadata: {}
    };
}
function createInitialTrace(executionId, origin, clock) {
    return {
        executionId: executionId,
        origin: origin,
        correlationId: executionId,
        timestamp: clock.now()
    };
}
function incrementVersion(version) {
    var parts = version.currentVersion.split('.');
    var minor = parseInt(parts[1] || '0') + 1;
    return {
        currentVersion: "".concat(parts[0], ".").concat(minor, ".0"),
        versionIdentifier: "v".concat(parts[0], ".").concat(minor),
        metadata: version.metadata
    };
}
var CandidateConclusionFactory = /** @class */ (function () {
    function CandidateConclusionFactory(clock) {
        this.clock = clock;
    }
    CandidateConclusionFactory.prototype.create = function (executionId, origin, assumptions, alternatives, tradeoffs, confidence, justification, supportingKnowledge, evaluationContext) {
        var id = new Identity_1.ConclusionId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new DecisionDomain_1.CandidateConclusion(id, version, trace, now, now, assumptions, alternatives, tradeoffs, confidence, justification, supportingKnowledge, evaluationContext, now, version.currentVersion);
    };
    CandidateConclusionFactory.prototype.clone = function (conclusion) {
        return new DecisionDomain_1.CandidateConclusion(conclusion.id, conclusion.version, conclusion.trace, conclusion.createdAt, this.clock.now(), conclusion.assumptions, conclusion.alternatives, conclusion.tradeoffs, conclusion.confidence, conclusion.justification, conclusion.supportingKnowledge, conclusion.evaluationContext, conclusion.generatedAt, conclusion.reasoningVersion);
    };
    CandidateConclusionFactory.prototype.withUpdatedVersion = function (conclusion) {
        var newVersion = incrementVersion(conclusion.version);
        return new DecisionDomain_1.CandidateConclusion(conclusion.id, newVersion, conclusion.trace, conclusion.createdAt, this.clock.now(), conclusion.assumptions, conclusion.alternatives, conclusion.tradeoffs, conclusion.confidence, conclusion.justification, conclusion.supportingKnowledge, conclusion.evaluationContext, conclusion.generatedAt, newVersion.currentVersion);
    };
    CandidateConclusionFactory.prototype.withUpdatedTrace = function (conclusion) {
        var newTrace = __assign(__assign({}, conclusion.trace), { timestamp: this.clock.now() });
        return new DecisionDomain_1.CandidateConclusion(conclusion.id, conclusion.version, newTrace, conclusion.createdAt, this.clock.now(), conclusion.assumptions, conclusion.alternatives, conclusion.tradeoffs, conclusion.confidence, conclusion.justification, conclusion.supportingKnowledge, conclusion.evaluationContext, conclusion.generatedAt, conclusion.reasoningVersion);
    };
    CandidateConclusionFactory.prototype.withUpdatedVersionAndTrace = function (conclusion) {
        var newVersion = incrementVersion(conclusion.version);
        var newTrace = __assign(__assign({}, conclusion.trace), { timestamp: this.clock.now() });
        return new DecisionDomain_1.CandidateConclusion(conclusion.id, newVersion, newTrace, conclusion.createdAt, this.clock.now(), conclusion.assumptions, conclusion.alternatives, conclusion.tradeoffs, conclusion.confidence, conclusion.justification, conclusion.supportingKnowledge, conclusion.evaluationContext, conclusion.generatedAt, newVersion.currentVersion);
    };
    return CandidateConclusionFactory;
}());
exports.CandidateConclusionFactory = CandidateConclusionFactory;
