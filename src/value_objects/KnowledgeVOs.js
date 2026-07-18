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
exports.Citation = exports.SourceReference = exports.EvidenceSource = exports.VerificationStatus = exports.ConfidenceScore = exports.KnowledgeClassification = exports.KnowledgeState = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var Common_1 = require("./Common");
var KnowledgeState = /** @class */ (function (_super) {
    __extends(KnowledgeState, _super);
    function KnowledgeState(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    KnowledgeState.prototype.equals = function (other) {
        return other instanceof KnowledgeState && this.state === other.state;
    };
    KnowledgeState.DRAFT = new KnowledgeState('DRAFT');
    KnowledgeState.ACTIVE = new KnowledgeState('ACTIVE');
    KnowledgeState.ARCHIVED = new KnowledgeState('ARCHIVED');
    return KnowledgeState;
}(DomainBase_1.ValueObject));
exports.KnowledgeState = KnowledgeState;
var KnowledgeClassification = /** @class */ (function (_super) {
    __extends(KnowledgeClassification, _super);
    function KnowledgeClassification(classification) {
        var _this = _super.call(this) || this;
        _this.classification = classification;
        return _this;
    }
    KnowledgeClassification.prototype.equals = function (other) {
        return other instanceof KnowledgeClassification && this.classification === other.classification;
    };
    KnowledgeClassification.CORE = new KnowledgeClassification('CORE');
    KnowledgeClassification.TEMPORAL = new KnowledgeClassification('TEMPORAL');
    KnowledgeClassification.DERIVED = new KnowledgeClassification('DERIVED');
    return KnowledgeClassification;
}(DomainBase_1.ValueObject));
exports.KnowledgeClassification = KnowledgeClassification;
var ConfidenceScore = /** @class */ (function (_super) {
    __extends(ConfidenceScore, _super);
    function ConfidenceScore(level) {
        if (level < 0 || level > 1) {
            throw new Error('ConfidenceScore must be between 0 and 1');
        }
        return _super.call(this, level) || this;
    }
    return ConfidenceScore;
}(Common_1.Confidence));
exports.ConfidenceScore = ConfidenceScore;
var VerificationStatus = /** @class */ (function (_super) {
    __extends(VerificationStatus, _super);
    function VerificationStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        return _this;
    }
    VerificationStatus.prototype.equals = function (other) {
        return other instanceof VerificationStatus && this.status === other.status;
    };
    VerificationStatus.UNVERIFIED = new VerificationStatus('UNVERIFIED');
    VerificationStatus.VERIFIED = new VerificationStatus('VERIFIED');
    VerificationStatus.DISPUTED = new VerificationStatus('DISPUTED');
    return VerificationStatus;
}(DomainBase_1.ValueObject));
exports.VerificationStatus = VerificationStatus;
var EvidenceSource = /** @class */ (function (_super) {
    __extends(EvidenceSource, _super);
    function EvidenceSource(type, identifier) {
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.identifier = identifier;
        if (!identifier || identifier.trim() === '')
            throw new Error('EvidenceSource identifier required');
        return _this;
    }
    EvidenceSource.prototype.equals = function (other) {
        return other instanceof EvidenceSource && this.type === other.type && this.identifier === other.identifier;
    };
    return EvidenceSource;
}(DomainBase_1.ValueObject));
exports.EvidenceSource = EvidenceSource;
var SourceReference = /** @class */ (function (_super) {
    __extends(SourceReference, _super);
    function SourceReference(urlOrId) {
        var _this = _super.call(this) || this;
        _this.urlOrId = urlOrId;
        if (!urlOrId || urlOrId.trim() === '')
            throw new Error('SourceReference urlOrId required');
        return _this;
    }
    SourceReference.prototype.equals = function (other) {
        return other instanceof SourceReference && this.urlOrId === other.urlOrId;
    };
    return SourceReference;
}(DomainBase_1.ValueObject));
exports.SourceReference = SourceReference;
var Citation = /** @class */ (function (_super) {
    __extends(Citation, _super);
    function Citation(source, reference, context) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.reference = reference;
        _this.context = context;
        return _this;
    }
    Citation.prototype.equals = function (other) {
        return other instanceof Citation &&
            this.source.equals(other.source) &&
            this.reference.equals(other.reference) &&
            this.context === other.context;
    };
    return Citation;
}(DomainBase_1.ValueObject));
exports.Citation = Citation;
