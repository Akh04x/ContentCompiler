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
exports.Audience = exports.Brand = exports.Knowledge = exports.ContentProfile = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var ContentProfile = /** @class */ (function (_super) {
    __extends(ContentProfile, _super);
    function ContentProfile(id, version, trace, createdAt, updatedAt, knowledge, brandId, targetAudiences) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.knowledge = knowledge;
        _this.brandId = brandId;
        _this.targetAudiences = targetAudiences;
        return _this;
    }
    return ContentProfile;
}(DomainBase_1.BaseEntity));
exports.ContentProfile = ContentProfile;
var Knowledge = /** @class */ (function (_super) {
    __extends(Knowledge, _super);
    function Knowledge(id, version, trace, createdAt, updatedAt, fact, state, classification, verificationStatus, confidence, citations) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.fact = fact;
        _this.state = state;
        _this.classification = classification;
        _this.verificationStatus = verificationStatus;
        _this.confidence = confidence;
        _this.citations = citations;
        return _this;
    }
    return Knowledge;
}(DomainBase_1.BaseEntity));
exports.Knowledge = Knowledge;
var Brand = /** @class */ (function (_super) {
    __extends(Brand, _super);
    function Brand(id, version, trace, createdAt, updatedAt, guidelines) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.guidelines = guidelines;
        return _this;
    }
    return Brand;
}(DomainBase_1.BaseEntity));
exports.Brand = Brand;
var Audience = /** @class */ (function (_super) {
    __extends(Audience, _super);
    function Audience(id, version, trace, createdAt, updatedAt, description) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.description = description;
        return _this;
    }
    return Audience;
}(DomainBase_1.BaseEntity));
exports.Audience = Audience;
