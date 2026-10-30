import mongoose from "mongoose";
import config from "../config/default.mjs";
import { User, Participant, Admin, Organizer, USER_ROLE } from "../models/user.model.js";
import { Question, QuestionResponse } from "../models/question.model.js";
import { hashPassword, InitialiseEmptyMatrix } from "../utils/auth.util.js";
import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    try {
        const dbUrl = process.env.MONGODB_URL || config.dbUrl;
        logger.info("Connecting to database for seeding: " + dbUrl);
        await mongoose.connect(dbUrl);
        logger.info("Connected to MongoDB.");

        logger.info("Refreshing questions bank and question responses...");
        await Question.deleteMany({});
        await QuestionResponse.deleteMany({});

        // Reset points for any existing participants so they have plenty of points to test
        await Participant.updateMany({}, { $set: { points: 50 } });
        logger.info("Existing participants points reset to 50.");

        // 1. Create or Update Admin
        const hashedPassword = await hashPassword("password123");
        await Admin.findOneAndUpdate(
            { email: "admin@njath.com" },
            {
                username: "admin",
                email: "admin@njath.com",
                password: hashedPassword,
                role: USER_ROLE.ADMIN,
                phone: "9999999999",
                fullname: "System Administrator",
            },
            { upsert: true, new: true }
        );
        logger.info("✅ Admin ready: admin@njath.com / password123");

        // 2. Create or Update Organizer
        await Organizer.findOneAndUpdate(
            { email: "organizer@njath.com" },
            {
                username: "organizer",
                email: "organizer@njath.com",
                password: hashedPassword,
                role: USER_ROLE.ORGANIZER,
                phone: "8888888888",
                fullname: "NJATH Organizer",
            },
            { upsert: true, new: true }
        );
        logger.info("✅ Organizer ready: organizer@njath.com / password123");

        // 3. Load all 48 extracted questions from extracted_questions.json
        const questionsPath = path.join(__dirname, "extracted_questions.json");
        const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

        await Question.insertMany(questions);
        logger.info(`✅ Successfully seeded ${questions.length} authentic NJATH questions across 6 levels!`);

        logger.info("🎉 Database seeding complete!");
        process.exit(0);
    } catch (err) {
        logger.error("Seeding failed: " + err);
        process.exit(1);
    }
}

seed();
