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
exports.ContentPackageFactory = void 0;
var CompilationDomain_1 = require("../../domain/CompilationDomain");
var Identity_1 = require("../../value_objects/Identity");
function id() { return "package-".concat(Math.random().toString(36).substring(2, 9)); }
function version() { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(structure, clock) {
    return { executionId: structure.trace.executionId, origin: 'OutputService.package', correlationId: structure.trace.correlationId, timestamp: clock.now() };
}
function nextVersion(current) {
    var _a = current.currentVersion.split('.'), major = _a[0], _b = _a[1], minor = _b === void 0 ? '0' : _b;
    return { currentVersion: "".concat(major, ".").concat(Number(minor) + 1, ".0"), versionIdentifier: "v".concat(major, ".").concat(Number(minor) + 1), metadata: current.metadata };
}
var ContentPackageFactory = /** @class */ (function () {
    function ContentPackageFactory(clock) {
        this.clock = clock;
    }
    ContentPackageFactory.prototype.create = function (structure, components, status) {
        var now = this.clock.now();
        return new CompilationDomain_1.ContentPackage(new Identity_1.ContentPackageId(id()), version(), trace(structure, this.clock), now, now, structure, components, status, null, null);
    };
    ContentPackageFactory.prototype.transitionTo = function (contentPackage, status, approvedBy, approvedAt) {
        var now = this.clock.now();
        return new CompilationDomain_1.ContentPackage(contentPackage.id, nextVersion(contentPackage.version), __assign(__assign({}, contentPackage.trace), { timestamp: now }), contentPackage.createdAt, now, contentPackage.structure, contentPackage.components, status, approvedBy, approvedAt);
    };
    return ContentPackageFactory;
}());
exports.ContentPackageFactory = ContentPackageFactory;
