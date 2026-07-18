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
exports.CompilationPipeline = void 0;
var TargetDomain_1 = require("../domain/TargetDomain");
var Result_1 = require("../shared/Result");
var Identity_1 = require("../value_objects/Identity");
var CompilationParser_1 = require("../providers/parsers/CompilationParser");
var CompilationPipeline = /** @class */ (function () {
    function CompilationPipeline(service, provider) {
        this.service = service;
        this.provider = provider;
    }
    CompilationPipeline.prototype.compile = function (context, targetIntent) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, provRes, extracted, os;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = "Compile into output structure for target: ".concat(targetIntent.id.value);
                        return [4 /*yield*/, this.provider.generateStructured(prompt, function (data) { return CompilationParser_1.CompilationParser.parse(data); })];
                    case 1:
                        provRes = _a.sent();
                        if (!provRes.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(provRes.error)];
                        extracted = provRes.value;
                        os = new TargetDomain_1.OutputStructure(new Identity_1.OutputStructureId('mock-os-' + Date.now()), { currentVersion: '1', versionIdentifier: 'v1', metadata: {} }, { executionId: context.executionId, origin: 'comp', correlationId: context.executionId, timestamp: Date.now() }, Date.now(), Date.now(), targetIntent.id, [new Identity_1.ComponentId('c-1'), new Identity_1.ComponentId('c-2')]);
                        return [2 /*return*/, new Result_1.Success(os)];
                }
            });
        });
    };
    // Backwards compat for tests
    CompilationPipeline.prototype.executeFlow = function (targetIntent) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.service.compile(targetIntent)];
            });
        });
    };
    return CompilationPipeline;
}());
exports.CompilationPipeline = CompilationPipeline;
