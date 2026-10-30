import { config } from "dotenv";
config();

const port = process.env.PORT || 8080;
const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;

export default {
	port: port,
	backendUrl: backendUrl,
	dbUrl: process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/njath",
	jwtSecret: process.env.JWT_SECRET || "njath_super_secret_jwt_key_2024",
	appPassword: process.env.APP_PASSWORD || "",
	smtpEmail: process.env.SMTP_EMAIL || "",
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
	cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
	cookieSameSite: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax"),
	googleClientId: process.env.GOOGLE_CLIENT_ID || "",
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
	googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`,
	initialPoints: 25,
	saltRounds: 10,
	allowedLoan: 2,
	loginExpiry: "300h",
	cookieExpiry: 1080000000,
	maxLevels: 6,
	maxQuestioninLevel: 8,
	questionOpenPenelty: 10,
	wrongAnswerPenalty: 15,
	rightAnswerBonous: 20,
	hintPenalty: 5,
	minQuestionToclearLevel: 6,
	loanPenalty: 20
};
