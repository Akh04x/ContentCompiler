"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetParser = void 0;
var StructuredParser_1 = require("./StructuredParser");
var TargetParser = /** @class */ (function () {
    function TargetParser() {
    }
    TargetParser.parse = function (data) {
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
        var formats = (_c = (_b = (_a = raw.formats) !== null && _a !== void 0 ? _a : raw.target_formats) !== null && _b !== void 0 ? _b : raw.format) !== null && _c !== void 0 ? _c : [];
        if (!Array.isArray(formats) && typeof formats === 'string')
            formats = [formats];
        var channels = (_f = (_e = (_d = raw.channels) !== null && _d !== void 0 ? _d : raw.target_channels) !== null && _e !== void 0 ? _e : raw.channel) !== null && _f !== void 0 ? _f : [];
        if (!Array.isArray(channels) && typeof channels === 'string')
            channels = [channels];
        // Field normalization / aliases
        var normalized = {
            title: (_k = (_j = (_h = (_g = raw.title) !== null && _g !== void 0 ? _g : raw.intent_title) !== null && _h !== void 0 ? _h : raw.name) !== null && _j !== void 0 ? _j : raw.intent) !== null && _k !== void 0 ? _k : "Intent ".concat(Date.now()),
            formats: formats,
            channels: channels,
        };
        return StructuredParser_1.TargetIntentSchema.parse(normalized);
    };
    return TargetParser;
}());
exports.TargetParser = TargetParser;
