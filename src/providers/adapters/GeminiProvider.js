"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
var Result_1 = require("../../shared/Result");
var ProviderErrorMapper_1 = require("../errors/ProviderErrorMapper");
var GeminiProvider = /** @class */ (function () {
    function GeminiProvider(config, logger) {
        this.config = config;
        this.logger = logger;
        this.providerName = 'Gemini';
    }
    GeminiProvider.prototype.generateText = function (prompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, text, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeCall(prompt, options)];
                    case 1:
                        response = _d.sent();
                        text = ((_c = (_b = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts[0]) === null || _c === void 0 ? void 0 : _c.text) || '';
                        return [2 /*return*/, new Result_1.Success(text)];
                    case 2:
                        error_1 = _d.sent();
                        this.logger.error("[".concat(this.providerName, "] Error generating text"), error_1);
                        return [2 /*return*/, new Result_1.Failure(ProviderErrorMapper_1.ProviderErrorMapper.mapToDomainError(error_1, this.providerName))];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GeminiProvider.prototype.generateStructured = function (prompt, validator, options) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonPrompt, response, content, parsedJson, validated, error_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        jsonPrompt = "".concat(prompt, "\n\nPlease output valid JSON only, without markdown wrapping.");
                        return [4 /*yield*/, this.executeCall(jsonPrompt, options)];
                    case 1:
                        response = _d.sent();
                        content = ((_c = (_b = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts[0]) === null || _c === void 0 ? void 0 : _c.text) || '';
                        if (content.startsWith('```json')) {
                            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                        }
                        else if (content.startsWith('```')) {
                            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
                        }
                        parsedJson = void 0;
                        try {
                            parsedJson = JSON.parse(content);
                        }
                        catch (e) {
                            throw new ProviderErrorMapper_1.ProviderParsingError("Invalid JSON returned: ".concat(e.message), this.providerName, e);
                        }
                        try {
                            validated = validator(parsedJson);
                            return [2 /*return*/, new Result_1.Success(validated)];
                        }
                        catch (validationError) {
                            throw new ProviderErrorMapper_1.ProviderParsingError("Validation failed: ".concat(validationError.message), this.providerName, validationError);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _d.sent();
                        this.logger.error("[".concat(this.providerName, "] Error generating structured data"), error_2);
                        return [2 /*return*/, new Result_1.Failure(ProviderErrorMapper_1.ProviderErrorMapper.mapToDomainError(error_2, this.providerName))];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GeminiProvider.prototype.executeCall = function (prompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, model, url, controller, timeoutId, response, errorBody;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.config.apiKey) {
                            throw new ProviderErrorMapper_1.ProviderError('API Key is missing for Gemini', this.providerName);
                        }
                        payload = {
                            contents: [{
                                    parts: [{ text: prompt }]
                                }],
                            generationConfig: {
                                temperature: (_a = options === null || options === void 0 ? void 0 : options.temperature) !== null && _a !== void 0 ? _a : this.config.temperature,
                                maxOutputTokens: (_b = options === null || options === void 0 ? void 0 : options.maxTokens) !== null && _b !== void 0 ? _b : this.config.maxTokens,
                            }
                        };
                        model = (options === null || options === void 0 ? void 0 : options.model) || this.config.model;
                        url = "https://generativelanguage.googleapis.com/v1beta/models/".concat(model, ":generateContent?key=").concat(this.config.apiKey);
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, this.config.timeoutMs);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 6, 7]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                                signal: controller.signal
                            })];
                    case 2:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorBody = _c.sent();
                        throw new Error("HTTP ".concat(response.status, ": ").concat(errorBody));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5: return [2 /*return*/, _c.sent()];
                    case 6:
                        clearTimeout(timeoutId);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return GeminiProvider;
}());
exports.GeminiProvider = GeminiProvider;
