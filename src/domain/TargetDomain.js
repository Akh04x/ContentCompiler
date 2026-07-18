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
exports.OutputStructure = exports.TargetIntent = exports.Goal = void 0;
var DomainBase_1 = require("../shared/DomainBase");
/**
 * A Business Goal associated with a TargetIntent.
 * Per TARGET_CONTRACT.md: "The Target Intent entity serves as the Aggregate Root for Goals."
 */
var Goal = /** @class */ (function (_super) {
    __extends(Goal, _super);
    function Goal(id, version, trace, createdAt, updatedAt, objective, priority) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.objective = objective;
        _this.priority = priority;
        return _this;
    }
    return Goal;
}(DomainBase_1.BaseEntity));
exports.Goal = Goal;
/**
 * The TargetIntent is the formal realization strategy produced by the Target Layer.
 *
 * Per TARGET_CONTRACT.md:
 *  - "The Target Intent entity acts as the formal request and requirements container
 *    for the Compilation Layer."
 *  - Lifecycle: Defined -> Constrained -> Approved -> Fulfilled.
 *  - Must be linked to at least one Business Goal.
 *  - Originating Decisions are referenced for traceability.
 */
var TargetIntent = /** @class */ (function (_super) {
    __extends(TargetIntent, _super);
    function TargetIntent(id, version, trace, createdAt, updatedAt, goals, format, status, constraints, originatingDecisions, executionId, approvedBy, approvedAt) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.goals = goals;
        _this.format = format;
        _this.status = status;
        _this.constraints = constraints;
        _this.originatingDecisions = originatingDecisions;
        _this.executionId = executionId;
        _this.approvedBy = approvedBy;
        _this.approvedAt = approvedAt;
        return _this;
    }
    return TargetIntent;
}(DomainBase_1.BaseEntity));
exports.TargetIntent = TargetIntent;
/**
 * The structural blueprint produced by the Compilation Layer. Currently a
 * immutable structural blueprint assembled by the Compilation Runtime.
 */
var OutputStructure = /** @class */ (function (_super) {
    __extends(OutputStructure, _super);
    function OutputStructure(id, version, trace, createdAt, updatedAt, targetIntentId, componentIds) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.targetIntentId = targetIntentId;
        _this.componentIds = componentIds;
        return _this;
    }
    return OutputStructure;
}(DomainBase_1.BaseEntity));
exports.OutputStructure = OutputStructure;
