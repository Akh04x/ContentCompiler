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
exports.GoalPriority = exports.GoalPriorityEnum = exports.TargetConstraints = exports.TargetIntentStatus = exports.TargetIntentStatusEnum = exports.TargetFormat = exports.TargetFormatEnum = void 0;
var DomainBase_1 = require("../shared/DomainBase");
/**
 * The realization strategy for an approved Decision.
 * Per TARGET_CONTRACT.md, the Target layer defines WHAT should be produced.
 */
var TargetFormatEnum;
(function (TargetFormatEnum) {
    TargetFormatEnum["SingleAsset"] = "SingleAsset";
    TargetFormatEnum["Series"] = "Series";
    TargetFormatEnum["Campaign"] = "Campaign";
    TargetFormatEnum["MultiPlatformInitiative"] = "MultiPlatformInitiative";
})(TargetFormatEnum || (exports.TargetFormatEnum = TargetFormatEnum = {}));
var TargetFormat = /** @class */ (function (_super) {
    __extends(TargetFormat, _super);
    function TargetFormat(format) {
        var _this = _super.call(this) || this;
        _this.format = format;
        if (!Object.values(TargetFormatEnum).includes(format)) {
            throw new Error("Invalid TargetFormat: ".concat(format));
        }
        return _this;
    }
    TargetFormat.prototype.equals = function (other) {
        return this.format === other.format;
    };
    return TargetFormat;
}(DomainBase_1.ValueObject));
exports.TargetFormat = TargetFormat;
/**
 * Lifecycle states for a TargetIntent.
 * Per TARGET_CONTRACT.md, lifecycle is: Defined -> Constrained -> Approved -> Fulfilled.
 */
var TargetIntentStatusEnum;
(function (TargetIntentStatusEnum) {
    TargetIntentStatusEnum["Defined"] = "Defined";
    TargetIntentStatusEnum["Constrained"] = "Constrained";
    TargetIntentStatusEnum["Approved"] = "Approved";
    TargetIntentStatusEnum["Fulfilled"] = "Fulfilled";
    TargetIntentStatusEnum["Deprecated"] = "Deprecated";
    TargetIntentStatusEnum["Archived"] = "Archived";
})(TargetIntentStatusEnum || (exports.TargetIntentStatusEnum = TargetIntentStatusEnum = {}));
var TargetIntentStatus = /** @class */ (function (_super) {
    __extends(TargetIntentStatus, _super);
    function TargetIntentStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        if (!Object.values(TargetIntentStatusEnum).includes(status)) {
            throw new Error("Invalid TargetIntentStatus: ".concat(status));
        }
        return _this;
    }
    TargetIntentStatus.prototype.equals = function (other) {
        return this.status === other.status;
    };
    return TargetIntentStatus;
}(DomainBase_1.ValueObject));
exports.TargetIntentStatus = TargetIntentStatus;
/**
 * An immutable bundle of platform/system constraints applied to a TargetIntent
 * during the Constrained phase. Per Architecture: "Compilation never bypasses
 * Target Selection" — these constraints are the contract handed to Compilation.
 */
var TargetConstraints = /** @class */ (function (_super) {
    __extends(TargetConstraints, _super);
    function TargetConstraints(platform, maxAssets, cadenceDays, formatNotes) {
        var _this = _super.call(this) || this;
        _this.platform = platform;
        _this.maxAssets = maxAssets;
        _this.cadenceDays = cadenceDays;
        _this.formatNotes = formatNotes;
        if (!platform || platform.trim() === '') {
            throw new Error('TargetConstraints.platform is required');
        }
        if (maxAssets < 1) {
            throw new Error('TargetConstraints.maxAssets must be >= 1');
        }
        if (cadenceDays < 0) {
            throw new Error('TargetConstraints.cadenceDays must be >= 0');
        }
        return _this;
    }
    TargetConstraints.prototype.equals = function (other) {
        return this.platform === other.platform &&
            this.maxAssets === other.maxAssets &&
            this.cadenceDays === other.cadenceDays &&
            this.formatNotes === other.formatNotes;
    };
    return TargetConstraints;
}(DomainBase_1.ValueObject));
exports.TargetConstraints = TargetConstraints;
/**
 * Goal priority levels. Higher priority goals override lower priority ones
 * when a TargetIntent carries multiple goals. Mirrors Priority in Common.ts.
 */
var GoalPriorityEnum;
(function (GoalPriorityEnum) {
    GoalPriorityEnum[GoalPriorityEnum["Low"] = 1] = "Low";
    GoalPriorityEnum[GoalPriorityEnum["Medium"] = 2] = "Medium";
    GoalPriorityEnum[GoalPriorityEnum["High"] = 3] = "High";
    GoalPriorityEnum[GoalPriorityEnum["Critical"] = 4] = "Critical";
})(GoalPriorityEnum || (exports.GoalPriorityEnum = GoalPriorityEnum = {}));
var GoalPriority = /** @class */ (function (_super) {
    __extends(GoalPriority, _super);
    function GoalPriority(level) {
        var _this = _super.call(this) || this;
        _this.level = level;
        if (!Object.values(GoalPriorityEnum).includes(level)) {
            throw new Error("Invalid GoalPriority: ".concat(level));
        }
        return _this;
    }
    GoalPriority.prototype.equals = function (other) {
        return this.level === other.level;
    };
    return GoalPriority;
}(DomainBase_1.ValueObject));
exports.GoalPriority = GoalPriority;
