import os

WORKSPACE = r"C:\Users\iamka\Desktop\njath\njath-next-website"
controller_path = os.path.join(WORKSPACE, "server", "controllers", "participant.controller.js")

with open(controller_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add in-memory questions cache at the top
top_import = 'import logger from "../utils/logger.js";'
top_cache = '''import logger from "../utils/logger.js";

// High-speed in-memory cache for the 48 static questions
let questionsCache = null;
const getCachedQuestions = async () => {
    if (!questionsCache || questionsCache.length === 0) {
        questionsCache = await Question.find({}).lean().exec();
    }
    return questionsCache;
};'''

content = content.replace(top_import, top_cache, 1)

# Replace Question.findOne in getQuestion
old_get_question = '''export const getQuestion = async (req, res) => {
    const user = req.user;
    const level = parseInt(req.query.level, 10);
    const order = parseInt(req.query.order, 10);

    try {
        const question = await Question.findOne({
            level: level,
            order: order,
        }).select("-_id title description imageUrl level order").exec();

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
            response.opened += 1;
            await response.save();
        } else {
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
        }

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
};'''

new_get_question = '''export const getQuestion = async (req, res) => {
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
};'''

content = content.replace(old_get_question, new_get_question, 1)

# In answerQuestion, use cached questions
old_answer_lookup = '''        const question = await Question.findOne({
            level: level,
            order: order,
        }).exec();'''

new_answer_lookup = '''        const allQuestions = await getCachedQuestions();
        const question = allQuestions.find((q) => q.level === level && q.order === order);'''

content = content.replace(old_answer_lookup, new_answer_lookup, 1)

# In getHint, use cached questions
old_hint_lookup = '''        const question = await Question.findOne({
            level: level,
            order: order,
        }).select("-_id hint").exec();'''

new_hint_lookup = '''        const allQuestions = await getCachedQuestions();
        const question = allQuestions.find((q) => q.level === level && q.order === order);'''

content = content.replace(old_hint_lookup, new_hint_lookup, 1)

# In getLevelDetails, use .lean()
old_level_details = '''        const questionResponses = await QuestionResponse.find({
            level: level,
            participant: user._id,
        }).select("-_id order isCorrect hintTaken").exec();'''

new_level_details = '''        const questionResponses = await QuestionResponse.find({
            level: level,
            participant: user._id,
        }).select("-_id order isCorrect hintTaken").lean().exec();'''

content = content.replace(old_level_details, new_level_details, 1)

with open(controller_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated participant.controller.js with question caching and performance enhancements!")
