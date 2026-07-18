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
exports.Evidence = exports.HistoricalObservation = exports.PerformanceSignal = exports.Platform = void 0;
var DomainBase_1 = require("../shared/DomainBase");
var Platform = /** @class */ (function (_super) {
    __extends(Platform, _super);
    function Platform(id, version, trace, createdAt, updatedAt, name) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.name = name;
        return _this;
    }
    return Platform;
}(DomainBase_1.BaseEntity));
exports.Platform = Platform;
var PerformanceSignal = /** @class */ (function (_super) {
    __extends(PerformanceSignal, _super);
    function PerformanceSignal(id, version, trace, createdAt, updatedAt, deliveryArtifactId, metric, value, observedAt) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.deliveryArtifactId = deliveryArtifactId;
        _this.metric = metric;
        _this.value = value;
        _this.observedAt = observedAt;
        return _this;
    }
    return PerformanceSignal;
}(DomainBase_1.BaseEntity));
exports.PerformanceSignal = PerformanceSignal;
var HistoricalObservation = /** @class */ (function (_super) {
    __extends(HistoricalObservation, _super);
    function HistoricalObservation(id, version, trace, createdAt, updatedAt, deliveryArtifactId, event, observedAt) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.deliveryArtifactId = deliveryArtifactId;
        _this.event = event;
        _this.observedAt = observedAt;
        return _this;
    }
    return HistoricalObservation;
}(DomainBase_1.BaseEntity));
exports.HistoricalObservation = HistoricalObservation;
var Evidence = /** @class */ (function (_super) {
    __extends(Evidence, _super);
    function Evidence(id, version, trace, createdAt, updatedAt, deliveryArtifactId, signals) {
        var _this = _super.call(this, id, version, trace, createdAt, updatedAt) || this;
        _this.deliveryArtifactId = deliveryArtifactId;
        _this.signals = signals;
        return _this;
    }
    return Evidence;
}(DomainBase_1.BaseEntity));
exports.Evidence = Evidence;
