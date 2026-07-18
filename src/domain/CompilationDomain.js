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
exports.ContentPackage = exports.Component = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(id, version, trace, createdAt, updatedAt, type, content) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.type = type;
        _this.content = content;
        return _this;
    }
    return Component;
}(DomainBase_1.BaseEntity));
exports.Component = Component;
var ContentPackage = /** @class */ (function (_super) {
    __extends(ContentPackage, _super);
    function ContentPackage(id, version, trace, createdAt, updatedAt, structure, components, status, approvedBy, approvedAt) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.structure = structure;
        _this.components = components;
        _this.status = status;
        _this.approvedBy = approvedBy;
        _this.approvedAt = approvedAt;
        return _this;
    }
    return ContentPackage;
}(DomainBase_1.BaseEntity));
exports.ContentPackage = ContentPackage;
