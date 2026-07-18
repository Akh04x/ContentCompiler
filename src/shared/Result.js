"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failure = exports.Success = void 0;
var Success = /** @class */ (function () {
    function Success(value) {
        this.value = value;
        this.isSuccess = true;
        this.isFailure = false;
    }
    return Success;
}());
exports.Success = Success;
var Failure = /** @class */ (function () {
    function Failure(error) {
        this.error = error;
        this.isSuccess = false;
        this.isFailure = true;
    }
    return Failure;
}());
exports.Failure = Failure;
