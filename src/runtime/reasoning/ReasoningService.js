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
exports.ReasoningService = void 0;
var Result_1 = require("../../shared/Result");
var ErrorHierarchy_1 = require("../../shared/ErrorHierarchy");
var ReasoningVOs_1 = require("../../value_objects/ReasoningVOs");
var ReasoningService = /** @class */ (function () {
    function ReasoningService(factory, repository, validator) {
        this.factory = factory;
        this.repository = repository;
        this.validator = validator;
    }
    ReasoningService.prototype.executeReasoningFlow = function (knowledgeList, context) {
        return __awaiter(this, void 0, void 0, function () {
            var inputKnowledge, executionContext, rawConclusion, valRes, finalConclusion, saveRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inputKnowledge = knowledgeList;
                        executionContext = context;
                        // 2. Validation
                        // Validate the input and deterministic rule requirements
                        if (!inputKnowledge || inputKnowledge.length === 0) {
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError('Validation failed: Reasoning requires at least one validated Knowledge reference'))];
                        }
                        rawConclusion = this.evaluateRules(inputKnowledge, executionContext);
                        valRes = this.validator.validate(rawConclusion);
                        if (!valRes.isValid) {
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Conclusion invalid: ".concat(valRes.errors.join(', '))))];
                        }
                        finalConclusion = this.factory.withUpdatedVersionAndTrace(rawConclusion);
                        return [4 /*yield*/, this.repository.save(finalConclusion)];
                    case 1:
                        saveRes = _a.sent();
                        if (!saveRes.isSuccess) {
                            return [2 /*return*/, new Result_1.Failure(saveRes.error)];
                        }
                        // 6. Output CandidateConclusion
                        return [2 /*return*/, new Result_1.Success(finalConclusion)];
                }
            });
        });
    };
    ReasoningService.prototype.evaluateRules = function (knowledgeList, context) {
        var assumptions = knowledgeList.map(function (k) { return new ReasoningVOs_1.Assumption("Derived from knowledge ".concat(k.id.value)); });
        var alternatives = [
            new ReasoningVOs_1.Alternative('alt-1', 'Primary deterministic path', 'Expected stable outcome'),
            new ReasoningVOs_1.Alternative('alt-2', 'Secondary deterministic path', 'Expected edge case outcome')
        ];
        var tradeoffs = [
            new ReasoningVOs_1.TradeOff('High stability', 'Lower flexibility')
        ];
        var confidence = new ReasoningVOs_1.ConfidenceScore(0.85);
        var justification = new ReasoningVOs_1.Justification('Generated deterministically based on provided knowledge references');
        var supportingKnowledge = knowledgeList.map(function (k) { return k.id; });
        return this.factory.create(context.executionId, 'ReasoningService', assumptions, alternatives, tradeoffs, confidence, justification, supportingKnowledge, context);
    };
    return ReasoningService;
}());
exports.ReasoningService = ReasoningService;
