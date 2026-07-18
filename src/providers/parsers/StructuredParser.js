"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationStructureSchema = exports.TargetIntentSchema = exports.DecisionGraphSchema = exports.CandidateConclusionSchema = exports.KnowledgeFactSchema = void 0;
var zod_1 = require("zod");
exports.KnowledgeFactSchema = zod_1.z.object({
    fact: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    sourceType: zod_1.z.string(),
    sourceRef: zod_1.z.string(),
});
exports.CandidateConclusionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    justification: zod_1.z.string(),
    confidence: zod_1.z.number(),
    factsUsed: zod_1.z.array(zod_1.z.string()),
});
exports.DecisionGraphSchema = zod_1.z.object({
    decisionId: zod_1.z.string(),
    status: zod_1.z.string(),
    conclusionsEmployed: zod_1.z.array(zod_1.z.string()),
});
exports.TargetIntentSchema = zod_1.z.object({
    title: zod_1.z.string(),
    formats: zod_1.z.array(zod_1.z.string()),
    channels: zod_1.z.array(zod_1.z.string()),
});
exports.CompilationStructureSchema = zod_1.z.object({
    content: zod_1.z.string(),
    format: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
});
