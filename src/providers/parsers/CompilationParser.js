"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationParser = void 0;
var StructuredParser_1 = require("./StructuredParser");
var CompilationParser = /** @class */ (function () {
    function CompilationParser() {
    }
    CompilationParser.parse = function (data) {
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
            content: (_d = (_c = (_b = (_a = raw.content) !== null && _a !== void 0 ? _a : raw.body) !== null && _b !== void 0 ? _b : raw.text) !== null && _c !== void 0 ? _c : raw.compiled_content) !== null && _d !== void 0 ? _d : '',
            format: (_g = (_f = (_e = raw.format) !== null && _e !== void 0 ? _e : raw.structure_format) !== null && _f !== void 0 ? _f : raw.type) !== null && _g !== void 0 ? _g : 'markdown',
            metadata: (_k = (_j = (_h = raw.metadata) !== null && _h !== void 0 ? _h : raw.meta) !== null && _j !== void 0 ? _j : raw.properties) !== null && _k !== void 0 ? _k : {},
        };
        return StructuredParser_1.CompilationStructureSchema.parse(normalized);
    };
    return CompilationParser;
}());
exports.CompilationParser = CompilationParser;
