"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = exports.ProviderType = void 0;
var zod_1 = require("zod");
var ProviderType;
(function (ProviderType) {
    ProviderType["OPENAI"] = "OPENAI";
    ProviderType["ANTHROPIC"] = "ANTHROPIC";
    ProviderType["GEMINI"] = "GEMINI";
    ProviderType["MOCK"] = "MOCK";
})(ProviderType || (exports.ProviderType = ProviderType = {}));
var ProviderConfigSchema = zod_1.z.object({
    provider: zod_1.z.nativeEnum(ProviderType),
    model: zod_1.z.string().min(1, 'MODEL cannot be empty'),
    temperature: zod_1.z.number().min(0).max(2, 'TEMPERATURE must be between 0 and 2'),
    maxTokens: zod_1.z.number().int().positive('MAX_TOKENS must be a positive integer'),
    apiKey: zod_1.z.string().optional(),
    timeoutMs: zod_1.z.number().int().positive('TIMEOUT_MS must be a positive integer'),
    maxRetries: zod_1.z.number().int().min(0, 'MAX_RETRIES cannot be negative'),
}).refine(function (data) {
    if (data.provider !== ProviderType.MOCK && (!data.apiKey || data.apiKey.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "API Key is missing. Ensure the appropriate <PROVIDER>_API_KEY environment variable is set for the selected provider.",
    path: ['apiKey']
});
var ConfigLoader = /** @class */ (function () {
    function ConfigLoader() {
    }
    ConfigLoader.loadFromEnv = function () {
        var rawProviderStr = process.env.PROVIDER || 'MOCK';
        var providerStr = rawProviderStr.toUpperCase();
        var providerRaw = providerStr;
        var apiKey = process.env["".concat(providerStr, "_API_KEY")] || process.env.API_KEY || '';
        var rawConfig = {
            provider: providerRaw,
            model: process.env.MODEL || (providerStr === 'MOCK' ? 'mock-model' : ''),
            temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
            maxTokens: parseInt(process.env.MAX_TOKENS || '2000', 10),
            apiKey: apiKey,
            timeoutMs: parseInt(process.env.TIMEOUT_MS || '30000', 10),
            maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
        };
        try {
            var validatedConfig = ProviderConfigSchema.parse(rawConfig);
            return validatedConfig;
        }
        catch (error) {
            if (error && typeof error === 'object' && ('issues' in error || 'errors' in error)) {
                var errList = error.issues || error.errors || [];
                var errorMessages = errList.map(function (err) {
                    var fieldLabel = err.path.join('.');
                    if (fieldLabel === 'provider')
                        fieldLabel = 'PROVIDER';
                    if (fieldLabel === 'model')
                        fieldLabel = 'MODEL';
                    if (fieldLabel === 'temperature')
                        fieldLabel = 'TEMPERATURE';
                    if (fieldLabel === 'maxTokens')
                        fieldLabel = 'MAX_TOKENS';
                    return "- ".concat(fieldLabel, ": ").concat(err.message);
                }).join('\n');
                console.error('\x1b[31m%s\x1b[0m', "\n[Configuration Error] Environment configuration is invalid:\n".concat(errorMessages, "\n"));
                console.error('\x1b[33m%s\x1b[0m', "Please check your .env file or environment variables. You can copy .env.example as a starting point.\n");
                throw new Error('Startup validation failed due to invalid configuration.');
            }
            throw error;
        }
    };
    return ConfigLoader;
}());
exports.ConfigLoader = ConfigLoader;
