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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceService = void 0;
var EvidenceDomain_1 = require("../../domain/EvidenceDomain");
var Result_1 = require("../../shared/Result");
var ErrorHierarchy_1 = require("../../shared/ErrorHierarchy");
/** Normalizes immutable post-delivery observations; it never changes Knowledge or strategy. */
var EvidenceService = /** @class */ (function () {
    function EvidenceService(evidenceFactory, signalFactory, observationFactory, evidenceRepository, signalRepository, observationRepository, artifactValidator, evidenceValidator, signalValidator, observationValidator) {
        this.evidenceFactory = evidenceFactory;
        this.signalFactory = signalFactory;
        this.observationFactory = observationFactory;
        this.evidenceRepository = evidenceRepository;
        this.signalRepository = signalRepository;
        this.observationRepository = observationRepository;
        this.artifactValidator = artifactValidator;
        this.evidenceValidator = evidenceValidator;
        this.signalValidator = signalValidator;
        this.observationValidator = observationValidator;
    }
    EvidenceService.prototype.capture = function (artifact, rawSignals, rawObservations) {
        return __awaiter(this, void 0, void 0, function () {
            var artifactResult, signals, _i, signals_1, signal, validation, evidence, evidenceResult, _a, signals_2, signal, save, _b, saveEvidence;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        artifactResult = this.artifactValidator.validate(artifact);
                        if (!artifactResult.isValid)
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("DeliveryArtifact invalid: ".concat(artifactResult.errors.join(', '))))];
                        signals = __spreadArray(__spreadArray([], rawSignals.map(function (signal) { return _this.signalFactory.create(artifact, signal.metric, signal.value, signal.observedAt); }), true), rawObservations.map(function (observation) { return _this.observationFactory.create(artifact, observation.event, observation.observedAt); }), true);
                        if (signals.length === 0)
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError('Evidence requires at least one observation'))];
                        for (_i = 0, signals_1 = signals; _i < signals_1.length; _i++) {
                            signal = signals_1[_i];
                            validation = signal instanceof EvidenceDomain_1.PerformanceSignal ? this.signalValidator.validate(signal) : this.observationValidator.validate(signal);
                            if (!validation.isValid)
                                return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Observation invalid: ".concat(validation.errors.join(', '))))];
                        }
                        evidence = this.evidenceFactory.create(artifact, signals);
                        evidenceResult = this.evidenceValidator.validate(evidence);
                        if (!evidenceResult.isValid)
                            return [2 /*return*/, new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Evidence invalid: ".concat(evidenceResult.errors.join(', '))))];
                        _a = 0, signals_2 = signals;
                        _c.label = 1;
                    case 1:
                        if (!(_a < signals_2.length)) return [3 /*break*/, 7];
                        signal = signals_2[_a];
                        if (!(signal instanceof EvidenceDomain_1.PerformanceSignal)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.signalRepository.save(signal)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.observationRepository.save(signal)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        save = _b;
                        if (!save.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(save.error)];
                        _c.label = 6;
                    case 6:
                        _a++;
                        return [3 /*break*/, 1];
                    case 7: return [4 /*yield*/, this.evidenceRepository.save(evidence)];
                    case 8:
                        saveEvidence = _c.sent();
                        return [2 /*return*/, saveEvidence.isSuccess ? new Result_1.Success(evidence) : new Result_1.Failure(saveEvidence.error)];
                }
            });
        });
    };
    return EvidenceService;
}());
exports.EvidenceService = EvidenceService;
