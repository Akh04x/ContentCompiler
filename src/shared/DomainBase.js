"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = exports.BaseEntity = void 0;
var BaseEntity = /** @class */ (function () {
    function BaseEntity(id, version, trace, createdAt, updatedAt) {
        this.id = id;
        this.version = version;
        this.trace = trace;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    return BaseEntity;
}());
exports.BaseEntity = BaseEntity;
var ValueObject = /** @class */ (function () {
    function ValueObject() {
    }
    return ValueObject;
}());
exports.ValueObject = ValueObject;
