"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryArtifactFactory = void 0;
var DeliveryDomain_1 = require("../../domain/DeliveryDomain");
var Identity_1 = require("../../value_objects/Identity");
var DeliveryArtifactFactory = /** @class */ (function () {
    function DeliveryArtifactFactory(clock) {
        this.clock = clock;
    }
    DeliveryArtifactFactory.prototype.create = function (contentPackageId, platformId, externalReference, executionId) {
        var defaultVersion = {
            currentVersion: '1.0.0',
            versionIdentifier: '1.0.0',
            metadata: { note: 'Initial creation' }
        };
        var defaultTrace = {
            executionId: executionId,
            origin: 'DeliveryArtifactFactory',
            correlationId: executionId,
            timestamp: this.clock.now()
        };
        var artifactId = "da-".concat(this.clock.now(), "-").concat(Math.random().toString(36).substring(2, 9));
        return new DeliveryDomain_1.DeliveryArtifact(new Identity_1.DeliveryArtifactId(artifactId), defaultVersion, defaultTrace, this.clock.now(), this.clock.now(), contentPackageId, platformId, externalReference, this.clock.now());
    };
    return DeliveryArtifactFactory;
}());
exports.DeliveryArtifactFactory = DeliveryArtifactFactory;
