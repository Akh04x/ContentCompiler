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
exports.DecisionOutcome = exports.DecisionReason = exports.ApprovalRecord = exports.DecisionContext = exports.DecisionVersion = exports.PublicationStatus = exports.PublicationStatusEnum = exports.ApprovalStatus = exports.ApprovalStatusEnum = exports.DecisionStatus = exports.DecisionStatusEnum = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var DecisionStatusEnum;
(function (DecisionStatusEnum) {
    DecisionStatusEnum["Draft"] = "Draft";
    DecisionStatusEnum["PendingApproval"] = "PendingApproval";
    DecisionStatusEnum["Approved"] = "Approved";
    DecisionStatusEnum["Published"] = "Published";
    DecisionStatusEnum["Deprecated"] = "Deprecated";
    DecisionStatusEnum["Archived"] = "Archived";
})(DecisionStatusEnum || (exports.DecisionStatusEnum = DecisionStatusEnum = {}));
var DecisionStatus = /** @class */ (function (_super) {
    __extends(DecisionStatus, _super);
    function DecisionStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        if (!Object.values(DecisionStatusEnum).includes(status)) {
            throw new Error("Invalid DecisionStatus: ".concat(status));
        }
        return _this;
    }
    DecisionStatus.prototype.equals = function (other) {
        return this.status === other.status;
    };
    return DecisionStatus;
}(DomainBase_1.ValueObject));
exports.DecisionStatus = DecisionStatus;
var ApprovalStatusEnum;
(function (ApprovalStatusEnum) {
    ApprovalStatusEnum["Pending"] = "Pending";
    ApprovalStatusEnum["Approved"] = "Approved";
    ApprovalStatusEnum["Rejected"] = "Rejected";
})(ApprovalStatusEnum || (exports.ApprovalStatusEnum = ApprovalStatusEnum = {}));
var ApprovalStatus = /** @class */ (function (_super) {
    __extends(ApprovalStatus, _super);
    function ApprovalStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        if (!Object.values(ApprovalStatusEnum).includes(status)) {
            throw new Error("Invalid ApprovalStatus: ".concat(status));
        }
        return _this;
    }
    ApprovalStatus.prototype.equals = function (other) {
        return this.status === other.status;
    };
    return ApprovalStatus;
}(DomainBase_1.ValueObject));
exports.ApprovalStatus = ApprovalStatus;
var PublicationStatusEnum;
(function (PublicationStatusEnum) {
    PublicationStatusEnum["Unpublished"] = "Unpublished";
    PublicationStatusEnum["Published"] = "Published";
})(PublicationStatusEnum || (exports.PublicationStatusEnum = PublicationStatusEnum = {}));
var PublicationStatus = /** @class */ (function (_super) {
    __extends(PublicationStatus, _super);
    function PublicationStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        if (!Object.values(PublicationStatusEnum).includes(status)) {
            throw new Error("Invalid PublicationStatus: ".concat(status));
        }
        return _this;
    }
    PublicationStatus.prototype.equals = function (other) {
        return this.status === other.status;
    };
    return PublicationStatus;
}(DomainBase_1.ValueObject));
exports.PublicationStatus = PublicationStatus;
var DecisionVersion = /** @class */ (function (_super) {
    __extends(DecisionVersion, _super);
    function DecisionVersion(major, minor, patch) {
        var _this = _super.call(this) || this;
        _this.major = major;
        _this.minor = minor;
        _this.patch = patch;
        if (major < 0 || minor < 0 || patch < 0) {
            throw new Error('Version numbers must be non-negative');
        }
        return _this;
    }
    DecisionVersion.prototype.equals = function (other) {
        return this.major === other.major && this.minor === other.minor && this.patch === other.patch;
    };
    DecisionVersion.prototype.toString = function () {
        return "".concat(this.major, ".").concat(this.minor, ".").concat(this.patch);
    };
    return DecisionVersion;
}(DomainBase_1.ValueObject));
exports.DecisionVersion = DecisionVersion;
var DecisionContext = /** @class */ (function (_super) {
    __extends(DecisionContext, _super);
    function DecisionContext(executionId, metadata) {
        var _this = _super.call(this) || this;
        _this.executionId = executionId;
        _this.metadata = metadata;
        if (!executionId.trim())
            throw new Error('DecisionContext must have an executionId');
        return _this;
    }
    DecisionContext.prototype.equals = function (other) {
        if (this.executionId !== other.executionId)
            return false;
        var thisKeys = Object.keys(this.metadata);
        var otherKeys = Object.keys(other.metadata);
        if (thisKeys.length !== otherKeys.length)
            return false;
        for (var _i = 0, thisKeys_1 = thisKeys; _i < thisKeys_1.length; _i++) {
            var key = thisKeys_1[_i];
            if (this.metadata[key] !== other.metadata[key])
                return false;
        }
        return true;
    };
    return DecisionContext;
}(DomainBase_1.ValueObject));
exports.DecisionContext = DecisionContext;
var ApprovalRecord = /** @class */ (function (_super) {
    __extends(ApprovalRecord, _super);
    function ApprovalRecord(approverId, timestamp, status, notes) {
        var _this = _super.call(this) || this;
        _this.approverId = approverId;
        _this.timestamp = timestamp;
        _this.status = status;
        _this.notes = notes;
        if (!approverId.trim())
            throw new Error('ApprovalRecord must have an approverId');
        if (timestamp <= 0)
            throw new Error('ApprovalRecord timestamp must be positive');
        return _this;
    }
    ApprovalRecord.prototype.equals = function (other) {
        return this.approverId === other.approverId && this.timestamp === other.timestamp && this.status.equals(other.status) && this.notes === other.notes;
    };
    return ApprovalRecord;
}(DomainBase_1.ValueObject));
exports.ApprovalRecord = ApprovalRecord;
var DecisionReason = /** @class */ (function (_super) {
    __extends(DecisionReason, _super);
    function DecisionReason(rationale) {
        var _this = _super.call(this) || this;
        _this.rationale = rationale;
        if (!rationale.trim())
            throw new Error('DecisionReason rationale cannot be empty');
        return _this;
    }
    DecisionReason.prototype.equals = function (other) {
        return this.rationale === other.rationale;
    };
    return DecisionReason;
}(DomainBase_1.ValueObject));
exports.DecisionReason = DecisionReason;
var DecisionOutcome = /** @class */ (function (_super) {
    __extends(DecisionOutcome, _super);
    function DecisionOutcome(selectedAlternativeId, expectedImpact) {
        var _this = _super.call(this) || this;
        _this.selectedAlternativeId = selectedAlternativeId;
        _this.expectedImpact = expectedImpact;
        if (!selectedAlternativeId.trim())
            throw new Error('DecisionOutcome must specify a selected alternative');
        return _this;
    }
    DecisionOutcome.prototype.equals = function (other) {
        return this.selectedAlternativeId === other.selectedAlternativeId && this.expectedImpact === other.expectedImpact;
    };
    return DecisionOutcome;
}(DomainBase_1.ValueObject));
exports.DecisionOutcome = DecisionOutcome;
