"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeParser = void 0;
var StructuredParser_1 = require("./StructuredParser");
var KnowledgeParser = /** @class */ (function () {
    function KnowledgeParser() {
    }
    KnowledgeParser.parse = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                // let zod fail below
            }
        }
        if (!data || typeof data !== 'object') {
            throw new Error('Expected JSON object');
        }
        var raw = data;
        // Field normalization / aliases
        var normalized = {
            fact: (_c = (_b = (_a = raw.fact) !== null && _a !== void 0 ? _a : raw.primary_fact) !== null && _b !== void 0 ? _b : raw.main_fact) !== null && _c !== void 0 ? _c : raw.statement,
            confidence: (_f = (_e = (_d = raw.confidence) !== null && _d !== void 0 ? _d : raw.confidence_score) !== null && _e !== void 0 ? _e : raw.certainty) !== null && _f !== void 0 ? _f : 1,
            sourceType: (_k = (_j = (_h = (_g = raw.sourceType) !== null && _g !== void 0 ? _g : raw.source_type) !== null && _h !== void 0 ? _h : raw.origin) !== null && _j !== void 0 ? _j : raw.source) !== null && _k !== void 0 ? _k : 'extracted',
            sourceRef: (_p = (_o = (_m = (_l = raw.sourceRef) !== null && _l !== void 0 ? _l : raw.source_ref) !== null && _m !== void 0 ? _m : raw.reference) !== null && _o !== void 0 ? _o : raw.citation) !== null && _p !== void 0 ? _p : 'LLM Generated',
        };
        return StructuredParser_1.KnowledgeFactSchema.parse(normalized);
    };
    return KnowledgeParser;
}());
exports.KnowledgeParser = KnowledgeParser;
