import mongoose from "mongoose";
import config from "../config/default.mjs";

const QuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hint: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    level: Number,
    order: Number,
});

// Fast index lookup for level & order
QuestionSchema.index({ level: 1, order: 1 });

const QuestionResponseSchema = new mongoose.Schema({
    level: Number,
    order: Number,
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    },
    opened: {
        type: Number,
        default: 0
    },
    answered: {
        type: Number,
        default: 0
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    hintTaken: {
        type: Boolean,
        default: false
    },
});

// Compound index for user question lookups
QuestionResponseSchema.index({ participant: 1, level: 1, order: 1 });
QuestionResponseSchema.index({ participant: 1 });

export const Question = mongoose.model("Question", QuestionSchema);
export const QuestionResponse = mongoose.model("QuestionResponse", QuestionResponseSchema);
