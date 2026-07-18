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
exports.DeliveryArtifact = void 0;
var DomainBase_1 = require("../shared/DomainBase");
/** Immutable record of a package successfully handed to a destination platform. */
var DeliveryArtifact = /** @class */ (function (_super) {
    __extends(DeliveryArtifact, _super);
    function DeliveryArtifact(id, version, trace, createdAt, updatedAt, contentPackageId, platformId, externalReference, deliveredAt) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.contentPackageId = contentPackageId;
        _this.platformId = platformId;
        _this.externalReference = externalReference;
        _this.deliveredAt = deliveredAt;
        return _this;
    }
    return DeliveryArtifact;
}(DomainBase_1.BaseEntity));
exports.DeliveryArtifact = DeliveryArtifact;
