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
exports.Priority = exports.Confidence = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var Confidence = /** @class */ (function (_super) {
    __extends(Confidence, _super);
    function Confidence(level) {
        var _this = _super.call(this) || this;
        _this.level = level;
        return _this;
    }
    Confidence.prototype.equals = function (other) {
        return other instanceof Confidence && this.level === other.level;
    };
    return Confidence;
}(DomainBase_1.ValueObject));
exports.Confidence = Confidence;
var Priority = /** @class */ (function (_super) {
    __extends(Priority, _super);
    function Priority(level) {
        var _this = _super.call(this) || this;
        _this.level = level;
        return _this;
    }
    Priority.prototype.equals = function (other) {
        return other instanceof Priority && this.level === other.level;
    };
    return Priority;
}(DomainBase_1.ValueObject));
exports.Priority = Priority;
