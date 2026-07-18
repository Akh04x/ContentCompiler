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
exports.AudienceFactory = exports.BrandFactory = exports.KnowledgeFactory = exports.ContentProfileFactory = void 0;
var KnowledgeDomain_1 = require("../../domain/KnowledgeDomain");
var Identity_1 = require("../../value_objects/Identity");
var KnowledgeVOs_1 = require("../../value_objects/KnowledgeVOs");
// Utility for generating unique IDs (in real system, might use UUID)
function generateId() {
    return 'id-' + Math.random().toString(36).substring(2, 9);
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
var ContentProfileFactory = /** @class */ (function () {
    function ContentProfileFactory(clock) {
        this.clock = clock;
    }
    ContentProfileFactory.prototype.create = function (executionId, origin, brandId, targetAudiences) {
        var id = new Identity_1.ProfileId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new KnowledgeDomain_1.ContentProfile(id, version, trace, now, now, [], brandId, targetAudiences);
    };
    ContentProfileFactory.prototype.withUpdatedVersionAndTrace = function (profile) {
        var newVersion = incrementVersion(profile.version);
        var newTrace = __assign(__assign({}, profile.trace), { timestamp: this.clock.now() });
        return new KnowledgeDomain_1.ContentProfile(profile.id, newVersion, newTrace, profile.createdAt, this.clock.now(), profile.knowledge, profile.brandId, profile.targetAudiences);
    };
    return ContentProfileFactory;
}());
exports.ContentProfileFactory = ContentProfileFactory;
var KnowledgeFactory = /** @class */ (function () {
    function KnowledgeFactory(clock) {
        this.clock = clock;
    }
    KnowledgeFactory.prototype.create = function (executionId, origin, fact, classification, confidenceLevel, citations) {
        var id = new Identity_1.KnowledgeId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        var confidence = new KnowledgeVOs_1.ConfidenceScore(confidenceLevel);
        // Knowledge always starts as DRAFT and UNVERIFIED when created by the factory
        var state = KnowledgeVOs_1.KnowledgeState.DRAFT;
        var verificationStatus = KnowledgeVOs_1.VerificationStatus.UNVERIFIED;
        return new KnowledgeDomain_1.Knowledge(id, version, trace, now, now, fact, state, classification, verificationStatus, confidence, citations);
    };
    KnowledgeFactory.prototype.withUpdatedVersionAndTrace = function (knowledge) {
        var newVersion = incrementVersion(knowledge.version);
        var newTrace = __assign(__assign({}, knowledge.trace), { timestamp: this.clock.now() });
        return new KnowledgeDomain_1.Knowledge(knowledge.id, newVersion, newTrace, knowledge.createdAt, this.clock.now(), knowledge.fact, knowledge.state, knowledge.classification, knowledge.verificationStatus, knowledge.confidence, knowledge.citations);
    };
    return KnowledgeFactory;
}());
exports.KnowledgeFactory = KnowledgeFactory;
var BrandFactory = /** @class */ (function () {
    function BrandFactory(clock) {
        this.clock = clock;
    }
    BrandFactory.prototype.create = function (executionId, origin, guidelines) {
        var id = new Identity_1.BrandId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new KnowledgeDomain_1.Brand(id, version, trace, now, now, guidelines);
    };
    return BrandFactory;
}());
exports.BrandFactory = BrandFactory;
var AudienceFactory = /** @class */ (function () {
    function AudienceFactory(clock) {
        this.clock = clock;
    }
    AudienceFactory.prototype.create = function (executionId, origin, description) {
        var id = new Identity_1.AudienceId(generateId());
        var version = createInitialVersion();
        var trace = createInitialTrace(executionId, origin, this.clock);
        var now = this.clock.now();
        return new KnowledgeDomain_1.Audience(id, version, trace, now, now, description);
    };
    return AudienceFactory;
}());
exports.AudienceFactory = AudienceFactory;
