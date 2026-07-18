"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputStructureFactory = exports.ComponentFactory = void 0;
var CompilationDomain_1 = require("../../domain/CompilationDomain");
var TargetDomain_1 = require("../../domain/TargetDomain");
var Identity_1 = require("../../value_objects/Identity");
function id(prefix) { return "".concat(prefix, "-").concat(Math.random().toString(36).substring(2, 9)); }
function version() { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(executionId, origin, clock) {
    return { executionId: executionId, origin: origin, correlationId: executionId, timestamp: clock.now() };
}
var ComponentFactory = /** @class */ (function () {
    function ComponentFactory(clock) {
        this.clock = clock;
    }
    ComponentFactory.prototype.create = function (executionId, origin, type, content) {
        var now = this.clock.now();
        return new CompilationDomain_1.Component(new Identity_1.ComponentId(id('component')), version(), trace(executionId, origin, this.clock), now, now, type, content);
    };
    return ComponentFactory;
}());
exports.ComponentFactory = ComponentFactory;
var OutputStructureFactory = /** @class */ (function () {
    function OutputStructureFactory(clock) {
        this.clock = clock;
    }
    OutputStructureFactory.prototype.create = function (intent, components) {
        var now = this.clock.now();
        return new TargetDomain_1.OutputStructure(new Identity_1.OutputStructureId(id('structure')), version(), trace(intent.executionId, 'CompilationService.compile', this.clock), now, now, intent.id, components.map(function (component) { return component.id; }));
    };
    return OutputStructureFactory;
}());
exports.OutputStructureFactory = OutputStructureFactory;
