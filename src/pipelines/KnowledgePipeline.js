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
exports.KnowledgePipeline = void 0;
var KnowledgeDomain_1 = require("../domain/KnowledgeDomain");
var Result_1 = require("../shared/Result");
var Identity_1 = require("../value_objects/Identity");
var KnowledgeVOs_1 = require("../value_objects/KnowledgeVOs");
var KnowledgeParser_1 = require("../providers/parsers/KnowledgeParser");
var KnowledgePipeline = /** @class */ (function () {
    function KnowledgePipeline(service, provider) {
        this.service = service;
        this.provider = provider;
    }
    KnowledgePipeline.prototype.getProfile = function (context, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, resData, profile, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = "Extract a profile from input: ".concat(profileId);
                        return [4 /*yield*/, this.provider.generateText(prompt)];
                    case 1:
                        resData = _a.sent();
                        if (!resData.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(resData.error)];
                        profile = new KnowledgeDomain_1.ContentProfile(new Identity_1.ProfileId(profileId), { currentVersion: '1.0.0', versionIdentifier: 'v1.0.0', metadata: {} }, { executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now() }, Date.now(), Date.now(), [], new Identity_1.BrandId('ext-brand-' + Date.now()), [new Identity_1.AudienceId('ext-audience')]);
                        return [4 /*yield*/, this.service.saveProfile(profile)];
                    case 2:
                        res = _a.sent();
                        if (!res.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(res.error)];
                        return [2 /*return*/, new Result_1.Success(profile)];
                }
            });
        });
    };
    KnowledgePipeline.prototype.getKnowledge = function (context, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, result, extracted, k, saveRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = "Extract a primary fact about: ".concat(profileId);
                        return [4 /*yield*/, this.provider.generateStructured(prompt, function (data) { return KnowledgeParser_1.KnowledgeParser.parse(data); })];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(result.error)];
                        extracted = result.value;
                        k = new KnowledgeDomain_1.Knowledge(new Identity_1.KnowledgeId('k-' + Date.now()), { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }, { executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now() }, Date.now(), Date.now(), extracted.fact, KnowledgeVOs_1.KnowledgeState.ACTIVE, KnowledgeVOs_1.KnowledgeClassification.CORE, KnowledgeVOs_1.VerificationStatus.VERIFIED, new KnowledgeVOs_1.ConfidenceScore(extracted.confidence), [
                            new KnowledgeVOs_1.Citation(new KnowledgeVOs_1.EvidenceSource('TELEMETRY', extracted.sourceType || 'mock_type'), new KnowledgeVOs_1.SourceReference(extracted.sourceRef || 'mock_ref'), 'extracted from provider output')
                        ]);
                        return [4 /*yield*/, this.service.saveKnowledge(k)];
                    case 2:
                        saveRes = _a.sent();
                        if (!saveRes.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(saveRes.error)];
                        return [2 /*return*/, new Result_1.Success([k])];
                }
            });
        });
    };
    KnowledgePipeline.prototype.executeProfile = function (context, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service.saveProfile(entity)];
                    case 1:
                        res = _a.sent();
                        if (!res.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(res.error)];
                        }
                        return [2 /*return*/, new Result_1.Success(res.value)];
                }
            });
        });
    };
    KnowledgePipeline.prototype.executeKnowledge = function (context, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service.saveKnowledge(entity)];
                    case 1:
                        res = _a.sent();
                        if (!res.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(res.error)];
                        }
                        return [2 /*return*/, new Result_1.Success(res.value)];
                }
            });
        });
    };
    return KnowledgePipeline;
}());
exports.KnowledgePipeline = KnowledgePipeline;
