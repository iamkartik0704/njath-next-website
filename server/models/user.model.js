import mongoose from "mongoose";
import config from "../config/default.mjs";
import { InitialiseEmptyMatrix } from "../utils/auth.util.js";

export const USER_ROLE = {
	PARTICIPANT: "PARTICIPANT",
	ADMIN: "ADMIN",
	ORGANIZER: "ORGANIZER",
};

export const AUTH_PROVIDER = {
	LOCAL: "local",
	GOOGLE: "google",
};

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: false, // Optional for Google OAuth users
		},
		role: {
			type: String,
			required: true,
			enum: Object.values(USER_ROLE),
		},
		phone: {
			type: String,
			required: false, // Optional for Google OAuth users
			sparse: true,
		},
		fullname: {
			type: String,
			required: true,
		},
		googleId: {
			type: String,
			sparse: true,
			unique: true,
		},
		authProvider: {
			type: String,
			default: AUTH_PROVIDER.LOCAL,
			enum: Object.values(AUTH_PROVIDER),
		},
		avatar: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const participantSchema = new mongoose.Schema({
	isBaned: {
		type: Boolean,
		default: false,
	},
	points: {
		type: Number,
		default: config.initialPoints,
	},
	remainingLoan: {
		type: Number,
		default: config.allowedLoan,
	},
	correctAnswers: {
		type: [[Number]],
		default: InitialiseEmptyMatrix,
	},
});

const adminSchema = new mongoose.Schema({
	adminCommonField: String,
});

const organizerSchema = new mongoose.Schema({
	organizerCommonField: String,
});

export const User = mongoose.model("User", UserSchema);

export const Participant = User.discriminator("Participant", participantSchema);
export const Admin = User.discriminator("Admin", adminSchema);
export const Organizer = User.discriminator("Organizer", organizerSchema);
