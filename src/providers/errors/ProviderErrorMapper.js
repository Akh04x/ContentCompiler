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
exports.ProviderErrorMapper = exports.ProviderParsingError = exports.ProviderNetworkError = exports.ProviderAuthenticationError = exports.ProviderRateLimitError = exports.ProviderTimeoutError = exports.ProviderError = void 0;
var ErrorHierarchy_1 = require("../../shared/ErrorHierarchy");
var ProviderError = /** @class */ (function (_super) {
    __extends(ProviderError, _super);
    function ProviderError(message, provider, originalError) {
        var _this = _super.call(this, message, 'PROVIDER_ERROR') || this;
        _this.provider = provider;
        _this.originalError = originalError;
        return _this;
    }
    return ProviderError;
}(ErrorHierarchy_1.ContentCompilerError));
exports.ProviderError = ProviderError;
var ProviderTimeoutError = /** @class */ (function (_super) {
    __extends(ProviderTimeoutError, _super);
    function ProviderTimeoutError(provider, originalError) {
        return _super.call(this, "Provider ".concat(provider, " timed out."), provider, originalError) || this;
    }
    return ProviderTimeoutError;
}(ProviderError));
exports.ProviderTimeoutError = ProviderTimeoutError;
var ProviderRateLimitError = /** @class */ (function (_super) {
    __extends(ProviderRateLimitError, _super);
    function ProviderRateLimitError(provider, originalError) {
        return _super.call(this, "Provider ".concat(provider, " rate limited."), provider, originalError) || this;
    }
    return ProviderRateLimitError;
}(ProviderError));
exports.ProviderRateLimitError = ProviderRateLimitError;
var ProviderAuthenticationError = /** @class */ (function (_super) {
    __extends(ProviderAuthenticationError, _super);
    function ProviderAuthenticationError(provider, originalError) {
        return _super.call(this, "Provider ".concat(provider, " authentication failed."), provider, originalError) || this;
    }
    return ProviderAuthenticationError;
}(ProviderError));
exports.ProviderAuthenticationError = ProviderAuthenticationError;
var ProviderNetworkError = /** @class */ (function (_super) {
    __extends(ProviderNetworkError, _super);
    function ProviderNetworkError(provider, originalError) {
        return _super.call(this, "Provider ".concat(provider, " network error."), provider, originalError) || this;
    }
    return ProviderNetworkError;
}(ProviderError));
exports.ProviderNetworkError = ProviderNetworkError;
var ProviderParsingError = /** @class */ (function (_super) {
    __extends(ProviderParsingError, _super);
    function ProviderParsingError(message, provider, originalError) {
        return _super.call(this, "Provider ".concat(provider, " failed to parse structure: ").concat(message), provider, originalError) || this;
    }
    return ProviderParsingError;
}(ProviderError));
exports.ProviderParsingError = ProviderParsingError;
var ProviderErrorMapper = /** @class */ (function () {
    function ProviderErrorMapper() {
    }
    ProviderErrorMapper.mapToDomainError = function (error, provider) {
        if (error instanceof ErrorHierarchy_1.ContentCompilerError) {
            return error;
        }
        var message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
        if (message.toLowerCase().includes('timeout') || (error === null || error === void 0 ? void 0 : error.code) === 'ETIMEDOUT') {
            return new ProviderTimeoutError(provider, error);
        }
        if (message.toLowerCase().includes('rate limit') || (error === null || error === void 0 ? void 0 : error.status) === 429) {
            return new ProviderRateLimitError(provider, error);
        }
        if (message.toLowerCase().includes('auth') || (error === null || error === void 0 ? void 0 : error.status) === 401 || (error === null || error === void 0 ? void 0 : error.status) === 403) {
            return new ProviderAuthenticationError(provider, error);
        }
        if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch') || (error === null || error === void 0 ? void 0 : error.code) === 'ENOTFOUND') {
            return new ProviderNetworkError(provider, error);
        }
        return new ProviderError(message, provider, error);
    };
    return ProviderErrorMapper;
}());
exports.ProviderErrorMapper = ProviderErrorMapper;
