import mongoose from "mongoose";
import config from "../config/default.mjs";
import { User, Participant, Admin, Organizer, USER_ROLE } from "../models/user.model.js";
import { Question, QuestionResponse } from "../models/question.model.js";
import { hashPassword, InitialiseEmptyMatrix } from "../utils/auth.util.js";
import logger from "../utils/logger.js";

async function seed() {
    try {
        logger.info("Connecting to database for seeding: " + config.dbUrl);
        await mongoose.connect(config.dbUrl);
        logger.info("Connected to MongoDB.");

        logger.info("Clearing existing questions and users...");
        await User.deleteMany({});
        await Question.deleteMany({});
        await QuestionResponse.deleteMany({});

        // 1. Create Admin
        const hashedPassword = await hashPassword("password123");

        const admin = new Admin({
            username: "admin",
            email: "admin@njath.com",
            password: hashedPassword,
            role: USER_ROLE.ADMIN,
            phone: "9999999999",
            fullname: "System Administrator",
        });
        await admin.save();
        logger.info("✅ Admin created: admin@njath.com / password123");

        // 2. Create Organizer
        const organizer = new Organizer({
            username: "organizer",
            email: "organizer@njath.com",
            password: hashedPassword,
            role: USER_ROLE.ORGANIZER,
            phone: "8888888888",
            fullname: "NJATH Organizer",
        });
        await organizer.save();
        logger.info("✅ Organizer created: organizer@njath.com / password123");

        // 3. Create Sample Participants
        const participant1 = new Participant({
            username: "treasurehunter",
            email: "player1@njath.com",
            password: hashedPassword,
            role: USER_ROLE.PARTICIPANT,
            phone: "1234567890",
            fullname: "Alice Hunter",
            points: 50,
            remainingLoan: 2,
            correctAnswers: InitialiseEmptyMatrix(),
        });
        await participant1.save();

        const participant2 = new Participant({
            username: "cryptic_solver",
            email: "player2@njath.com",
            password: hashedPassword,
            role: USER_ROLE.PARTICIPANT,
            phone: "9876543210",
            fullname: "Bob Cryptic",
            points: 40,
            remainingLoan: 2,
            correctAnswers: InitialiseEmptyMatrix(),
        });
        await participant2.save();
        logger.info("✅ Sample participants created (player1@njath.com, player2@njath.com / password123)");

        // 4. Seed Questions across 6 Levels (8 questions per level)
        const sampleQuestions = [
            // Level 1: Beginner Enigmas
            {
                level: 1,
                order: 1,
                title: "The Genesis Code",
                description: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
                hint: "Sound bouncing off walls.",
                answer: "echo",
                imageUrl: "",
            },
            {
                level: 1,
                order: 2,
                title: "Digital Key",
                description: "The base of all computing, where everything is either 0 or 1. What number system am I?",
                hint: "Two states, bi-...",
                answer: "binary",
                imageUrl: "",
            },
            {
                level: 1,
                order: 3,
                title: "Ancient Caesar",
                description: "Decrypt the ciphertext with shift 3: 'KHOOR ZRUOG'",
                hint: "Reverse the 3-letter rotation.",
                answer: "hello world",
                imageUrl: "",
            },
            {
                level: 1,
                order: 4,
                title: "Web Anchor",
                description: "The protocol that powers the World Wide Web securely.",
                hint: "Hypertext Transfer Protocol with SSL/TLS.",
                answer: "https",
                imageUrl: "",
            },
            {
                level: 1,
                order: 5,
                title: "The First Bug",
                description: "In 1947, Grace Hopper found an actual insect inside the Harvard Mark II computer. What insect was it?",
                hint: "Drawn to lamps at night.",
                answer: "moth",
                imageUrl: "",
            },
            {
                level: 1,
                order: 6,
                title: "Infinite Loop",
                description: "What mathematical symbol resembles a figure eight on its side?",
                hint: "Beyond measure, endless.",
                answer: "infinity",
                imageUrl: "",
            },
            {
                level: 1,
                order: 7,
                title: "The Secret Language",
                description: "Dots and dashes transmitted across telegraph wires.",
                hint: "Named after Samuel ...",
                answer: "morse code",
                imageUrl: "",
            },
            {
                level: 1,
                order: 8,
                title: "The Python Origin",
                description: "The Python programming language was named after which British comedy troupe?",
                hint: "Flying Circus...",
                answer: "monty python",
                imageUrl: "",
            },

            // Level 2: Cyphers & Riddles
            {
                level: 2,
                order: 1,
                title: "Base Sixty Four",
                description: "Decode: 'TkpBVEggMjAyNA=='",
                hint: "Popular encoding scheme using 64 ASCII characters.",
                answer: "NJATH 2024",
                imageUrl: "",
            },
            {
                level: 2,
                order: 2,
                title: "Hashing Mystery",
                description: "A 128-bit cryptographic hash function designed by Ronald Rivest in 1991, commonly used for checksums but broken for collision resistance.",
                hint: "Message Digest algorithm 5.",
                answer: "md5",
                imageUrl: "",
            },
            {
                level: 2,
                order: 3,
                title: "The Enigma Breaker",
                description: "The father of theoretical computer science who cracked the Enigma machine at Bletchley Park.",
                hint: "The Turing Test was named after him.",
                answer: "alan turing",
                imageUrl: "",
            },
            {
                level: 2,
                order: 4,
                title: "Git Origin",
                description: "Who created Git in 2005 to manage the Linux kernel source code?",
                hint: "The creator of Linux kernel.",
                answer: "linus torvalds",
                imageUrl: "",
            },
            {
                level: 2,
                order: 5,
                title: "Networking Handshake",
                description: "The standard 3-way handshake packets: SYN, SYN-ACK, and what?",
                hint: "Acknowledgment.",
                answer: "ack",
                imageUrl: "",
            },
            {
                level: 2,
                order: 6,
                title: "Hexadecimal Clue",
                description: "What English word does the hex value 0xDEADBEEF humorously reference in software debugging?",
                hint: "Dead beef.",
                answer: "dead beef",
                imageUrl: "",
            },
            {
                level: 2,
                order: 7,
                title: "The First Programmer",
                description: "Who is celebrated as the world's first computer programmer for writing an algorithm for the Analytical Engine?",
                hint: "Daughter of Lord Byron, surname Lovelace.",
                answer: "ada lovelace",
                imageUrl: "",
            },
            {
                level: 2,
                order: 8,
                title: "HTTP Status Code",
                description: "HTTP status code returned when a client tries to access an unauthorized or forbidden resource.",
                hint: "Not 401 (Unauthorized), but 403 (...)",
                answer: "forbidden",
                imageUrl: "",
            },
        ];

        // Fill remaining levels (3, 4, 5, 6) with procedural template questions if not explicitly listed
        for (let lvl = 3; lvl <= config.maxLevels; lvl++) {
            for (let ord = 1; ord <= config.maxQuestioninLevel; ord++) {
                sampleQuestions.push({
                    level: lvl,
                    order: ord,
                    title: `Level ${lvl} Mystery #${ord}`,
                    description: `Solve the mystery of level ${lvl}, chamber ${ord}. Look closely at the clues hidden within the riddle.`,
                    hint: `The answer is the keyword 'chamber${ord}'`,
                    answer: `chamber${ord}`,
                    imageUrl: "",
                });
            }
        }

        // Insert into Question collection
        await Question.insertMany(sampleQuestions);
        logger.info(`✅ Successfully seeded ${sampleQuestions.length} questions across ${config.maxLevels} levels!`);

        logger.info("🎉 Database seeding complete!");
        process.exit(0);
    } catch (err) {
        logger.error("Seeding failed: " + err);
        process.exit(1);
    }
}

seed();

