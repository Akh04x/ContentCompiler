"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningParser = void 0;
var StructuredParser_1 = require("./StructuredParser");
var ReasoningParser = /** @class */ (function () {
    function ReasoningParser() {
    }
    ReasoningParser.parse = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                // drop through
            }
        }
        if (!data || typeof data !== 'object') {
            throw new Error('Expected JSON object');
        }
        var raw = data;
        // Field normalization / aliases
        var normalized = {
            id: (_c = (_b = (_a = raw.id) !== null && _a !== void 0 ? _a : raw.conclusion_id) !== null && _b !== void 0 ? _b : raw.candidate_id) !== null && _c !== void 0 ? _c : "conclusion-".concat(Date.now()),
            justification: (_f = (_e = (_d = raw.justification) !== null && _d !== void 0 ? _d : raw.reasoning) !== null && _e !== void 0 ? _e : raw.explanation) !== null && _f !== void 0 ? _f : raw.rationale,
            confidence: (_j = (_h = (_g = raw.confidence) !== null && _g !== void 0 ? _g : raw.confidence_score) !== null && _h !== void 0 ? _h : raw.certainty) !== null && _j !== void 0 ? _j : 1,
            factsUsed: (_o = (_m = (_l = (_k = raw.factsUsed) !== null && _k !== void 0 ? _k : raw.facts_used) !== null && _l !== void 0 ? _l : raw.supporting_facts) !== null && _m !== void 0 ? _m : raw.facts) !== null && _o !== void 0 ? _o : [],
        };
        return StructuredParser_1.CandidateConclusionSchema.parse(normalized);
    };
    return ReasoningParser;
}());
exports.ReasoningParser = ReasoningParser;
