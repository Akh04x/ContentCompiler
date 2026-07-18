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
exports.TargetIntentFactory = exports.GoalFactory = void 0;
var TargetDomain_1 = require("../../domain/TargetDomain");
var Identity_1 = require("../../value_objects/Identity");
var TargetVOs_1 = require("../../value_objects/TargetVOs");
function identifier(prefix) { return "".concat(prefix, "-").concat(Math.random().toString(36).substring(2, 9)); }
function initialVersion() { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(executionId, origin, clock) {
    return { executionId: executionId, origin: origin, correlationId: executionId, timestamp: clock.now() };
}
function increment(version) {
    var _a = version.currentVersion.split('.'), major = _a[0], _b = _a[1], minor = _b === void 0 ? '0' : _b;
    var nextMinor = Number(minor) + 1;
    return { currentVersion: "".concat(major, ".").concat(nextMinor, ".0"), versionIdentifier: "v".concat(major, ".").concat(nextMinor), metadata: version.metadata };
}
var GoalFactory = /** @class */ (function () {
    function GoalFactory(clock) {
        this.clock = clock;
    }
    GoalFactory.prototype.create = function (executionId, origin, objective, priority) {
        var now = this.clock.now();
        return new TargetDomain_1.Goal(new Identity_1.GoalId(identifier('goal')), initialVersion(), trace(executionId, origin, this.clock), now, now, objective, priority);
    };
    return GoalFactory;
}());
exports.GoalFactory = GoalFactory;
var TargetIntentFactory = /** @class */ (function () {
    function TargetIntentFactory(clock) {
        this.clock = clock;
    }
    TargetIntentFactory.prototype.create = function (executionId, origin, goals, format, decisions) {
        var now = this.clock.now();
        return new TargetDomain_1.TargetIntent(new Identity_1.TargetIntentId(identifier('target')), initialVersion(), trace(executionId, origin, this.clock), now, now, goals, format, new TargetVOs_1.TargetIntentStatus(TargetVOs_1.TargetIntentStatusEnum.Defined), null, decisions, executionId, null, null);
    };
    TargetIntentFactory.prototype.transitionTo = function (intent, status, constraints, approvedBy, approvedAt) {
        var now = this.clock.now();
        return new TargetDomain_1.TargetIntent(intent.id, increment(intent.version), __assign(__assign({}, intent.trace), { timestamp: now }), intent.createdAt, now, intent.goals, intent.format, status, constraints, intent.originatingDecisions, intent.executionId, approvedBy, approvedAt);
    };
    return TargetIntentFactory;
}());
exports.TargetIntentFactory = TargetIntentFactory;
