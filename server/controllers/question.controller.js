import { Question } from "../models/question.model.js";
import config from "../config/default.mjs";
import logger from "../utils/logger.js";

export const addQuestion = async (req, res) => {
    try {
        const questionData = req.body;
        const existingQuestions = await Question.find({ level: questionData.level }).exec();

        if (existingQuestions.length >= config.maxQuestioninLevel) {
            return res.status(400).json({
                success: false,
                message: "Level is full, cannot add more questions",
            });
        }

        const order = existingQuestions.length + 1;

        const newQuestion = new Question({
            ...questionData,
            order,
        });

        await newQuestion.save();

        return res.status(201).json({
            success: true,
            message: "Question added successfully",
            data: newQuestion,
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed, Server error",
        });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find({}).sort({ level: 1, order: 1 }).exec();
        return res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
        });
    }
};
