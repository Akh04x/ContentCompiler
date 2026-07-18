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
exports.TargetService = void 0;
var Result_1 = require("../../shared/Result");
var ErrorHierarchy_1 = require("../../shared/ErrorHierarchy");
var DecisionVOs_1 = require("../../value_objects/DecisionVOs");
var TargetVOs_1 = require("../../value_objects/TargetVOs");
/** Coordinates the Target lifecycle; the pipeline only transports arguments here. */
var TargetService = /** @class */ (function () {
    function TargetService(intentFactory, goalFactory, intentRepository, goalRepository, intentValidator, goalValidator, clock) {
        this.intentFactory = intentFactory;
        this.goalFactory = goalFactory;
        this.intentRepository = intentRepository;
        this.goalRepository = goalRepository;
        this.intentValidator = intentValidator;
        this.goalValidator = goalValidator;
        this.clock = clock;
    }
    TargetService.prototype.createGoal = function (executionId, objective, priority) {
        return this.goalFactory.create(executionId, 'TargetService.createGoal', objective, priority);
    };
    TargetService.prototype.define = function (decision, goals, format) {
        if (![DecisionVOs_1.DecisionStatusEnum.Approved, DecisionVOs_1.DecisionStatusEnum.Published].includes(decision.status.status)) {
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("TargetIntent requires an Approved Decision; got ".concat(decision.status.status)));
        }
        for (var _i = 0, goals_1 = goals; _i < goals_1.length; _i++) {
            var goal = goals_1[_i];
            var validation_1 = this.goalValidator.validate(goal);
            if (!validation_1.isValid)
                return new Result_1.Failure(new ErrorHierarchy_1.ValidationError("Goal invalid: ".concat(validation_1.errors.join(', '))));
        }
        var intent = this.intentFactory.create(decision.trace.executionId, 'TargetService.define', goals, format, [decision.id]);
        var validation = this.intentValidator.validate(intent);
        return validation.isValid ? new Result_1.Success(intent) : new Result_1.Failure(new ErrorHierarchy_1.ValidationError("TargetIntent invalid: ".concat(validation.errors.join(', '))));
    };
    TargetService.prototype.constrain = function (intent, constraints) {
        return this.transition(intent, new TargetVOs_1.TargetIntentStatus(TargetVOs_1.TargetIntentStatusEnum.Constrained), constraints, null, null);
    };
    TargetService.prototype.approve = function (intent, approval) {
        if (!approval || !approval.approvedBy || approval.approvedBy.trim() === '')
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError('A human approval is required'));
        if (!approval.targetId || approval.targetId.value !== intent.id.value)
            return new Result_1.Failure(new ErrorHierarchy_1.HumanApprovalError('Human approval targetId must match TargetIntent id'));
        return this.transition(intent, new TargetVOs_1.TargetIntentStatus(TargetVOs_1.TargetIntentStatusEnum.Approved), intent.constraints, approval.approvedBy, this.clock.now());
    };
    TargetService.prototype.fulfill = function (intent) {
        return this.transition(intent, new TargetVOs_1.TargetIntentStatus(TargetVOs_1.TargetIntentStatusEnum.Fulfilled), intent.constraints, intent.approvedBy, intent.approvedAt);
    };
    /**
     * Canonical execution boundary. The caller defines the intent first so the
     * HumanApproval can explicitly target its immutable id.
     */
    TargetService.prototype.executeApprovalFlow = function (defined, constraints, approval) {
        return __awaiter(this, void 0, void 0, function () {
            var constrained, approved, _i, _a, goal, saveGoal, saveIntent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constrained = this.constrain(defined, constraints);
                        if (!constrained.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(constrained.error)];
                        approved = this.approve(constrained.value, approval);
                        if (!approved.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(approved.error)];
                        _i = 0, _a = approved.value.goals;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        goal = _a[_i];
                        return [4 /*yield*/, this.goalRepository.save(goal)];
                    case 2:
                        saveGoal = _b.sent();
                        if (!saveGoal.isSuccess)
                            return [2 /*return*/, new Result_1.Failure(saveGoal.error)];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.intentRepository.save(approved.value)];
                    case 5:
                        saveIntent = _b.sent();
                        return [2 /*return*/, saveIntent.isSuccess ? new Result_1.Success(approved.value) : new Result_1.Failure(saveIntent.error)];
                }
            });
        });
    };
    TargetService.prototype.transition = function (intent, status, constraints, approvedBy, approvedAt) {
        var next = this.intentFactory.transitionTo(intent, status, constraints, approvedBy, approvedAt);
        var transition = this.intentValidator.validateTransition(intent, next);
        if (!transition.isValid)
            return new Result_1.Failure(new ErrorHierarchy_1.ValidationError(transition.errors.join(', ')));
        var validation = this.intentValidator.validate(next);
        return validation.isValid ? new Result_1.Success(next) : new Result_1.Failure(new ErrorHierarchy_1.ValidationError("TargetIntent invalid: ".concat(validation.errors.join(', '))));
    };
    return TargetService;
}());
exports.TargetService = TargetService;
