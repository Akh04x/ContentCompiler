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
exports.ContentPackageStatus = exports.ContentPackageStatusEnum = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var ContentPackageStatusEnum;
(function (ContentPackageStatusEnum) {
    ContentPackageStatusEnum["Draft"] = "Draft";
    ContentPackageStatusEnum["Assembled"] = "Assembled";
    ContentPackageStatusEnum["Validated"] = "Validated";
    ContentPackageStatusEnum["Approved"] = "Approved";
    ContentPackageStatusEnum["Delivered"] = "Delivered";
    ContentPackageStatusEnum["Archived"] = "Archived";
})(ContentPackageStatusEnum || (exports.ContentPackageStatusEnum = ContentPackageStatusEnum = {}));
var ContentPackageStatus = /** @class */ (function (_super) {
    __extends(ContentPackageStatus, _super);
    function ContentPackageStatus(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        if (!Object.values(ContentPackageStatusEnum).includes(status))
            throw new Error("Invalid ContentPackageStatus: ".concat(status));
        return _this;
    }
    ContentPackageStatus.prototype.equals = function (other) { return this.status === other.status; };
    return ContentPackageStatus;
}(DomainBase_1.ValueObject));
exports.ContentPackageStatus = ContentPackageStatus;
