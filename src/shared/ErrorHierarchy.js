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
exports.HumanApprovalError = exports.InternalRuntimeError = exports.EvidenceError = exports.DeliveryError = exports.CompilationError = exports.DependencyError = exports.ContractError = exports.ValidationError = exports.ContentCompilerError = void 0;
var ContentCompilerError = /** @class */ (function (_super) {
    __extends(ContentCompilerError, _super);
    function ContentCompilerError(message, code) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = _this.constructor.name;
        return _this;
    }
    return ContentCompilerError;
}(Error));
exports.ContentCompilerError = ContentCompilerError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, field) {
        var _this = _super.call(this, message, 'VALIDATION_ERROR') || this;
        _this.field = field;
        return _this;
    }
    return ValidationError;
}(ContentCompilerError));
exports.ValidationError = ValidationError;
var ContractError = /** @class */ (function (_super) {
    __extends(ContractError, _super);
    function ContractError(message) {
        return _super.call(this, message, 'CONTRACT_ERROR') || this;
    }
    return ContractError;
}(ContentCompilerError));
exports.ContractError = ContractError;
var DependencyError = /** @class */ (function (_super) {
    __extends(DependencyError, _super);
    function DependencyError(message) {
        return _super.call(this, message, 'DEPENDENCY_ERROR') || this;
    }
    return DependencyError;
}(ContentCompilerError));
exports.DependencyError = DependencyError;
var CompilationError = /** @class */ (function (_super) {
    __extends(CompilationError, _super);
    function CompilationError(message) {
        return _super.call(this, message, 'COMPILATION_ERROR') || this;
    }
    return CompilationError;
}(ContentCompilerError));
exports.CompilationError = CompilationError;
var DeliveryError = /** @class */ (function (_super) {
    __extends(DeliveryError, _super);
    function DeliveryError(message) {
        return _super.call(this, message, 'DELIVERY_ERROR') || this;
    }
    return DeliveryError;
}(ContentCompilerError));
exports.DeliveryError = DeliveryError;
var EvidenceError = /** @class */ (function (_super) {
    __extends(EvidenceError, _super);
    function EvidenceError(message) {
        return _super.call(this, message, 'EVIDENCE_ERROR') || this;
    }
    return EvidenceError;
}(ContentCompilerError));
exports.EvidenceError = EvidenceError;
var InternalRuntimeError = /** @class */ (function (_super) {
    __extends(InternalRuntimeError, _super);
    function InternalRuntimeError(message) {
        return _super.call(this, message, 'INTERNAL_RUNTIME_ERROR') || this;
    }
    return InternalRuntimeError;
}(ContentCompilerError));
exports.InternalRuntimeError = InternalRuntimeError;
var HumanApprovalError = /** @class */ (function (_super) {
    __extends(HumanApprovalError, _super);
    function HumanApprovalError(message) {
        return _super.call(this, message, 'HUMAN_APPROVAL_ERROR') || this;
    }
    return HumanApprovalError;
}(ContentCompilerError));
exports.HumanApprovalError = HumanApprovalError;
