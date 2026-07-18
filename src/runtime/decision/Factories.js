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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionGraphFactory = exports.DecisionFactory = void 0;
var DecisionDomain_1 = require("../../domain/DecisionDomain");
var Identity_1 = require("../../value_objects/Identity");
var DecisionVOs_1 = require("../../value_objects/DecisionVOs");
function generateId() {
    return 'dec-' + Math.random().toString(36).substring(2, 9);
}
function generateGraphId() {
    return 'dg-' + Math.random().toString(36).substring(2, 9);
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
var DecisionFactory = /** @class */ (function () {
    function DecisionFactory(clock) {
        this.clock = clock;
    }
    DecisionFactory.prototype.create = function (executionId, origin, status, approval, publication, decisionVersion, context, originatingConclusion, reasoningVersionReference, approvedBy, approvedAt, publishedAt, approvalRecord) {
        if (approvedBy === void 0) { approvedBy = null; }
        if (approvedAt === void 0) { approvedAt = null; }
        if (publishedAt === void 0) { publishedAt = null; }
        if (approvalRecord === void 0) { approvalRecord = null; }
        var id = new Identity_1.DecisionId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new DecisionDomain_1.Decision(id, version, trace, now, now, status, approval, publication, decisionVersion, context, originatingConclusion, approvedBy, approvedAt, publishedAt, reasoningVersionReference, approvalRecord);
    };
    DecisionFactory.prototype.promoteCandidateConclusion = function (executionId, origin, conclusion, context) {
        var id = new Identity_1.DecisionId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new DecisionDomain_1.Decision(id, version, trace, now, now, new DecisionVOs_1.DecisionStatus(DecisionVOs_1.DecisionStatusEnum.Draft), new DecisionVOs_1.ApprovalStatus(DecisionVOs_1.ApprovalStatusEnum.Pending), new DecisionVOs_1.PublicationStatus(DecisionVOs_1.PublicationStatusEnum.Unpublished), new DecisionVOs_1.DecisionVersion(1, 0, 0), context, conclusion.id, null, null, null, conclusion.reasoningVersion, null);
    };
    DecisionFactory.prototype.clone = function (decision) {
        return new DecisionDomain_1.Decision(decision.id, decision.version, decision.trace, decision.createdAt, this.clock.now(), decision.status, decision.approval, decision.publication, decision.decisionVersion, decision.context, decision.originatingConclusion, decision.approvedBy, decision.approvedAt, decision.publishedAt, decision.reasoningVersionReference, decision.approvalRecord);
    };
    DecisionFactory.prototype.withUpdatedVersion = function (decision) {
        var newVersion = incrementVersion(decision.version);
        return new DecisionDomain_1.Decision(decision.id, newVersion, decision.trace, decision.createdAt, this.clock.now(), decision.status, decision.approval, decision.publication, decision.decisionVersion, decision.context, decision.originatingConclusion, decision.approvedBy, decision.approvedAt, decision.publishedAt, decision.reasoningVersionReference, decision.approvalRecord);
    };
    DecisionFactory.prototype.withUpdatedTrace = function (decision) {
        var newTrace = __assign(__assign({}, decision.trace), { timestamp: this.clock.now() });
        return new DecisionDomain_1.Decision(decision.id, decision.version, newTrace, decision.createdAt, this.clock.now(), decision.status, decision.approval, decision.publication, decision.decisionVersion, decision.context, decision.originatingConclusion, decision.approvedBy, decision.approvedAt, decision.publishedAt, decision.reasoningVersionReference, decision.approvalRecord);
    };
    DecisionFactory.prototype.withUpdatedVersionAndTrace = function (decision) {
        var newVersion = incrementVersion(decision.version);
        var newTrace = __assign(__assign({}, decision.trace), { timestamp: this.clock.now() });
        return new DecisionDomain_1.Decision(decision.id, newVersion, newTrace, decision.createdAt, this.clock.now(), decision.status, decision.approval, decision.publication, decision.decisionVersion, decision.context, decision.originatingConclusion, decision.approvedBy, decision.approvedAt, decision.publishedAt, decision.reasoningVersionReference, decision.approvalRecord);
    };
    /**
     * Construct a transitioned Decision with new status, optional approval record,
     * and updated publication metadata. The version and trace are NOT advanced here;
     * the service layer is expected to call withUpdatedVersionAndTrace on the result.
     *
     * Factory closure: this is the single boundary where transition mechanics are encoded.
     */
    DecisionFactory.prototype.transitionTo = function (decision, newStatus, approvalRecord, publicationOverride, publishedAtOverride) {
        var now = this.clock.now();
        return new DecisionDomain_1.Decision(decision.id, decision.version, decision.trace, decision.createdAt, now, newStatus, approvalRecord ? approvalRecord.status : decision.approval, publicationOverride !== null && publicationOverride !== void 0 ? publicationOverride : decision.publication, decision.decisionVersion, decision.context, decision.originatingConclusion, approvalRecord ? approvalRecord.approverId : decision.approvedBy, approvalRecord ? approvalRecord.timestamp : decision.approvedAt, publishedAtOverride !== null && publishedAtOverride !== void 0 ? publishedAtOverride : decision.publishedAt, decision.reasoningVersionReference, approvalRecord !== null && approvalRecord !== void 0 ? approvalRecord : decision.approvalRecord);
    };
    return DecisionFactory;
}());
exports.DecisionFactory = DecisionFactory;
var DecisionGraphFactory = /** @class */ (function () {
    function DecisionGraphFactory(clock) {
        this.clock = clock;
    }
    DecisionGraphFactory.prototype.create = function (executionId, origin, decisions, parentChildMap) {
        var id = new Identity_1.DecisionId(generateGraphId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new DecisionDomain_1.DecisionGraph(id, version, trace, now, now, decisions, parentChildMap);
    };
    DecisionGraphFactory.prototype.clone = function (graph) {
        return new DecisionDomain_1.DecisionGraph(graph.id, graph.version, graph.trace, graph.createdAt, this.clock.now(), graph.decisions, graph.parentChildMap);
    };
    /**
     * Returns a new DecisionGraph with the given decision appended.
     * Preserves identity (graph id, version, trace) and merges the parent/child map.
     * The new decision has no parent (top-level); the appended graph receives a new version+trace.
     */
    DecisionGraphFactory.prototype.withAppendedDecision = function (graph, decision) {
        if (graph.decisions.some(function (d) { return d.id.value === decision.id.value; })) {
            throw new Error("Decision ".concat(decision.id.value, " already exists in graph ").concat(graph.id.value));
        }
        var newDecisions = __spreadArray(__spreadArray([], graph.decisions, true), [decision], false);
        var newParentChildMap = new Map(graph.parentChildMap);
        // Track the latest decision as the head. Maintain DAG integrity by registering
        // prior head decisions as ancestors of the new head when they exist.
        var previousHead = graph.decisions[graph.decisions.length - 1];
        if (previousHead && !newParentChildMap.has(previousHead.id.value)) {
            newParentChildMap.set(previousHead.id.value, [decision.id.value]);
        }
        else if (previousHead) {
            var existing = newParentChildMap.get(previousHead.id.value) || [];
            newParentChildMap.set(previousHead.id.value, __spreadArray(__spreadArray([], existing, true), [decision.id.value], false));
        }
        var newVersion = incrementVersion(graph.version);
        var newTrace = __assign(__assign({}, graph.trace), { timestamp: this.clock.now() });
        return new DecisionDomain_1.DecisionGraph(graph.id, newVersion, newTrace, graph.createdAt, this.clock.now(), newDecisions, newParentChildMap);
    };
    return DecisionGraphFactory;
}());
exports.DecisionGraphFactory = DecisionGraphFactory;
