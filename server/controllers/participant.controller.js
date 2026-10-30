import { Question, QuestionResponse } from "../models/question.model.js";
import { Participant } from "../models/user.model.js";
import config from "../config/default.mjs";
import { getClearedLevel } from "../utils/participant.util.js";
import logger from "../utils/logger.js";

// High-speed in-memory cache for the 48 static questions
let questionsCache = null;
const getCachedQuestions = async () => {
    if (!questionsCache || questionsCache.length === 0) {
        questionsCache = await Question.find({}).lean().exec();
    }
    return questionsCache;
};

export const getQuestion = async (req, res) => {
    const user = req.user;
    const level = parseInt(req.query.level, 10);
    const order = parseInt(req.query.order, 10);

    try {
        const allQuestions = await getCachedQuestions();
        const question = allQuestions.find((q) => q.level === level && q.order === order);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question requested doesn't exist",
            });
        }

        let response = await QuestionResponse.findOne({
            level: level,
            order: order,
            participant: user._id,
        }).exec();

        if (response) {
            // Asynchronously increment open count without delaying response
            QuestionResponse.updateOne({ _id: response._id }, { $inc: { opened: 1 } }).exec().catch(() => {});
            return res.status(200).json({
                success: true,
                data: {
                    title: question.title,
                    description: question.description,
                    imageUrl: question.imageUrl,
                    level: question.level,
                    order: question.order,
                },
            });
        }

        const currUser = await Participant.findOne({ _id: user._id }).exec();

        if (!currUser || currUser.points < config.questionOpenPenelty) {
            return res.status(400).json({
                success: false,
                message: "You don't have enough points to unlock this question",
            });
        }

        currUser.points -= config.questionOpenPenelty;
        await currUser.save();

        response = new QuestionResponse({
            level: level,
            order: order,
            participant: user._id,
            opened: 1,
        });
        await response.save();

        return res.status(200).json({
            success: true,
            data: {
                title: question.title,
                description: question.description,
                imageUrl: question.imageUrl,
                level: question.level,
                order: question.order,
            },
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed",
        });
    }
};

export const answerQuestion = async (req, res) => {
    const data = req.body;
    const user = req.user;
    const order = parseInt(data.order, 10);
    const level = parseInt(data.level, 10);

    try {
        const clearedLevel = await getClearedLevel(user);
        if (level > clearedLevel) {
            return res.status(401).json({
                success: false,
                message: "Clear previous levels first",
            });
        }

        const allQuestions = await getCachedQuestions();
        const question = allQuestions.find((q) => q.level === level && q.order === order);

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question not found",
            });
        }

        const response = await QuestionResponse.findOne({
            level: level,
            order: order,
            participant: user._id,
        }).exec();

        if (!response) {
            return res.status(401).json({
                success: false,
                message: "You cannot answer a question without opening it first",
            });
        }

        if (response.isCorrect) {
            return res.status(200).json({
                success: true,
                message: "You have already answered this question correctly",
            });
        }

        // Compare case-insensitive trimmed answers
        const isMatch =
            String(question.answer).trim().toLowerCase() ===
            String(data.answer).trim().toLowerCase();

        if (isMatch) {
            const currUser = await Participant.findById(user._id);

            currUser.points += config.rightAnswerBonous;
            if (!currUser.correctAnswers[level - 1]) {
                currUser.correctAnswers[level - 1] = [];
            }
            if (!currUser.correctAnswers[level - 1].includes(order)) {
                currUser.correctAnswers[level - 1].push(order);
            }
            currUser.markModified("correctAnswers");
            await currUser.save();

            response.answered += 1;
            response.isCorrect = true;
            await response.save();

            return res.status(200).json({
                success: true,
                message: "Congrats! Your answer is correct!",
            });
        } else {
            response.answered += 1;
            await response.save();

            return res.status(200).json({
                success: false,
                message: "Sorry, your answer is incorrect.",
            });
        }
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed",
        });
    }
};

export const getHint = async (req, res) => {
    const data = req.body;
    const user = req.user;
    const order = parseInt(data.order, 10);
    const level = parseInt(data.level, 10);

    try {
        const clearedLevel = await getClearedLevel(user);
        if (level > clearedLevel) {
            return res.status(401).json({
                success: false,
                message: "Clear previous levels first",
            });
        }

        const response = await QuestionResponse.findOne({
            level: level,
            order: order,
            participant: user._id,
        }).exec();

        if (!response) {
            return res.status(401).json({
                success: false,
                message: "You cannot get a hint without opening the question first",
            });
        }

        const hint = await Question.findOne({
            level: level,
            order: order,
        }).select("-_id hint").exec();

        if (!hint) {
            return res.status(400).json({
                success: false,
                message: "Question hint not found",
            });
        }

        if (!response.hintTaken) {
            const currUser = await Participant.findById(user._id);

            if (currUser.points < config.hintPenalty) {
                return res.status(401).json({
                    success: false,
                    message: "You don't have enough points to view hints",
                });
            }

            currUser.points -= config.hintPenalty;
            await currUser.save();
            response.hintTaken = true;
            await response.save();
        }

        return res.status(200).json({
            success: true,
            data: hint,
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed",
        });
    }
};

export const getLevelDetails = async (req, res) => {
    const user = req.user;
    const level = parseInt(req.query.level, 10);

    if (isNaN(level)) {
        return res.status(400).json({
            success: false,
            message: "Invalid level parameter. Please provide a number.",
        });
    }

    try {
        const cleared = await getClearedLevel(user);
        if (level > cleared) {
            return res.status(401).json({
                success: false,
                message: "Clear previous levels first",
            });
        }

        const questionResponses = await QuestionResponse.find({
            level: level,
            participant: user._id,
        }).select("-_id order isCorrect hintTaken").lean().exec();

        const questions = [];
        for (let i = 0; i < config.maxQuestioninLevel; i++) {
            questions.push({
                type: 0,
                title: `Question ${i + 1}`,
            });
        }

        /**
         * 0 -> not opened
         * 1 -> opened
         * 2 -> hint taken
         * 3 -> answered correctly
         */
        let questionSolved = 0;
        questionResponses.forEach((ele) => {
            if (ele.order >= 1 && ele.order <= config.maxQuestioninLevel) {
                const qIdx = ele.order - 1;
                questions[qIdx].type = 1;

                if (ele.hintTaken) {
                    questions[qIdx].type = 2;
                }

                if (ele.isCorrect) {
                    questions[qIdx].type = 3;
                    questionSolved++;
                }
            }
        });

        const isSolved = questionSolved >= config.maxQuestioninLevel;

        return res.status(200).json({
            success: true,
            data: {
                question: questions,
                totalQuestions: config.maxQuestioninLevel,
                isSolved: isSolved,
            },
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed",
        });
    }
};

export const getLoan = async (req, res) => {
    const user = req.user;
    const level = parseInt(req.query.level, 10);
    const safe = parseInt(req.query.safe, 10);
    const order = parseInt(req.query.order, 10);

    if (isNaN(safe)) {
        return res.status(400).json({
            success: false,
            message: "Invalid safe parameter. Please provide a number.",
        });
    }

    try {
        const currUser = await Participant.findById(user._id);

        let response = await QuestionResponse.findOne({
            level: level,
            order: order,
            participant: currUser._id,
        }).exec();

        if (response) {
            return res.status(401).json({
                success: false,
                message: "You have already opened this question",
            });
        }

        if (currUser.remainingLoan <= 0) {
            return res.status(401).json({
                success: false,
                message: "You cannot take more loan",
            });
        }

        if (safe !== 0) {
            if (currUser.points > config.loanPenalty) {
                return res.status(401).json({
                    success: false,
                    message: "You have enough points; you don't need to take a loan",
                });
            }
        }

        response = new QuestionResponse({
            level: level,
            order: order,
            participant: user._id,
            opened: 1,
        });

        currUser.points -= config.loanPenalty;
        currUser.remainingLoan -= 1;

        await currUser.save();
        await response.save();

        const question = await Question.findOne({
            level: level,
            order: order,
        }).select("-_id title description imageUrl level order").exec();

        return res.status(200).json({
            success: true,
            data: question,
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Action failed",
        });
    }
};

export const getParticipantData = async (req, res) => {
    try {
        const clearedLevel = await getClearedLevel(req.user);
        const levels = clearedLevel - 1;

        const levelDetail = [];
        levelDetail.push(1); // Level 1 is always unlocked
        for (let i = 1; i < config.maxLevels; i++) {
            const isUnlocked = i <= levels ? 1 : 0;
            levelDetail.push(isUnlocked);
        }

        return res.status(200).json({
            success: true,
            data: {
                isBanned: req.user.isBaned || false,
                remainingLoan: req.user.remainingLoan,
                username: req.user.username,
                email: req.user.email,
                points: req.user.points,
                levelDetail: levelDetail,
            },
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch participant data",
        });
    }
};

// High-concurrency in-memory cache for leaderboard (5-second TTL)
let cachedParticipants = null;
let lastLeaderboardFetchTime = 0;
const LEADERBOARD_CACHE_TTL = 5000; // 5 seconds

export const getLeaderBoard = async (req, res) => {
    try {
        const participantUsername = req.user.username;
        const now = Date.now();

        if (!cachedParticipants || now - lastLeaderboardFetchTime > LEADERBOARD_CACHE_TTL) {
            cachedParticipants = await Participant.find({})
                .select("-_id -__t username points")
                .sort({ points: -1 })
                .limit(500)
                .lean()
                .exec();
            lastLeaderboardFetchTime = now;
        }

        let rank =
            cachedParticipants.findIndex((p) => p.username === participantUsername) + 1;

        if (rank === 0) {
            rank = cachedParticipants.length + 1;
        }

        return res.status(200).json({
            success: true,
            data: cachedParticipants,
            myRank: rank,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
