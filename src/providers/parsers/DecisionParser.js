"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionParser = void 0;
var StructuredParser_1 = require("./StructuredParser");
var DecisionParser = /** @class */ (function () {
    function DecisionParser() {
    }
    DecisionParser.parse = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
            decisionId: (_c = (_b = (_a = raw.decisionId) !== null && _a !== void 0 ? _a : raw.decision_id) !== null && _b !== void 0 ? _b : raw.id) !== null && _c !== void 0 ? _c : "dec-".concat(Date.now()),
            status: (_f = (_e = (_d = raw.status) !== null && _d !== void 0 ? _d : raw.state) !== null && _e !== void 0 ? _e : raw.decision_status) !== null && _f !== void 0 ? _f : 'Draft',
            conclusionsEmployed: (_k = (_j = (_h = (_g = raw.conclusionsEmployed) !== null && _g !== void 0 ? _g : raw.conclusions_employed) !== null && _h !== void 0 ? _h : raw.conclusions) !== null && _j !== void 0 ? _j : raw.used_conclusions) !== null && _k !== void 0 ? _k : [],
        };
        return StructuredParser_1.DecisionGraphSchema.parse(normalized);
    };
    return DecisionParser;
}());
exports.DecisionParser = DecisionParser;
