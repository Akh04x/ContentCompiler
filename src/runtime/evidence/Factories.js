"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceFactory = exports.HistoricalObservationFactory = exports.PerformanceSignalFactory = void 0;
var EvidenceDomain_1 = require("../../domain/EvidenceDomain");
var Identity_1 = require("../../value_objects/Identity");
function version() { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(artifact, origin, clock) { return { executionId: artifact.trace.executionId, origin: origin, correlationId: artifact.trace.correlationId, causationId: artifact.id.value, timestamp: clock.now() }; }
var PerformanceSignalFactory = /** @class */ (function () {
    function PerformanceSignalFactory(clock) {
        this.clock = clock;
    }
    PerformanceSignalFactory.prototype.create = function (artifact, metric, value, observedAt) {
        var now = this.clock.now();
        return new EvidenceDomain_1.PerformanceSignal(new Identity_1.PerformanceSignalId("signal-".concat(Math.random().toString(36).substring(2, 9))), version(), trace(artifact, 'EvidenceService.signal', this.clock), now, now, artifact.id, metric, value, observedAt);
    };
    return PerformanceSignalFactory;
}());
exports.PerformanceSignalFactory = PerformanceSignalFactory;
var HistoricalObservationFactory = /** @class */ (function () {
    function HistoricalObservationFactory(clock) {
        this.clock = clock;
    }
    HistoricalObservationFactory.prototype.create = function (artifact, event, observedAt) {
        var now = this.clock.now();
        return new EvidenceDomain_1.HistoricalObservation(new Identity_1.HistoricalObservationId("observation-".concat(Math.random().toString(36).substring(2, 9))), version(), trace(artifact, 'EvidenceService.observation', this.clock), now, now, artifact.id, event, observedAt);
    };
    return HistoricalObservationFactory;
}());
exports.HistoricalObservationFactory = HistoricalObservationFactory;
var EvidenceFactory = /** @class */ (function () {
    function EvidenceFactory(clock) {
        this.clock = clock;
    }
    EvidenceFactory.prototype.create = function (artifact, signals) {
        var now = this.clock.now();
        return new EvidenceDomain_1.Evidence(new Identity_1.EvidenceId("evidence-".concat(Math.random().toString(36).substring(2, 9))), version(), trace(artifact, 'EvidenceService.capture', this.clock), now, now, artifact.id, signals);
    };
    return EvidenceFactory;
}());
exports.EvidenceFactory = EvidenceFactory;
