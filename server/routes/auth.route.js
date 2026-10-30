import { Router } from "express";
import {
	forgetPassword,
	login,
	logout,
	registerParticipant,
	resetPassword,
	googleAuthRedirect,
	googleAuthCallback,
	googleAuthVerifyToken,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
	userSchemaForgetPassword,
	userSchemaLogin,
	userSchemaRegister,
	userSchemaResetPassword,
} from "../utils/auth.util.js";
import { checkUser } from "../middlewares/checkUser.js";
import { USER_ROLE } from "../models/user.model.js";

const authRouter = Router();

// Standard Registration & Login
authRouter.post(
	"/register-participant",
	validateBody(userSchemaRegister),
	registerParticipant(USER_ROLE.PARTICIPANT)
);

authRouter.post(
	"/register-organiser",
	validateBody(userSchemaRegister),
	checkUser([USER_ROLE.ADMIN]),
	registerParticipant(USER_ROLE.ORGANIZER)
);

authRouter.get(
	"/login",
	checkUser([USER_ROLE.PARTICIPANT]),
	(req, res) => {
		return res.status(200).json({
			message: "Login successful",
			success: true,
			user: {
				id: req.user._id,
				username: req.user.username,
				email: req.user.email,
				role: req.user.role,
			},
		});
	}
);

authRouter.post(
	"/login",
	validateBody(userSchemaLogin),
	login
);

// Password Management
authRouter.post(
	"/forget-password",
	validateBody(userSchemaForgetPassword),
	forgetPassword
);

authRouter.post(
	"/reset-password/:token",
	validateBody(userSchemaResetPassword),
	resetPassword
);

authRouter.get(
	"/logout",
	logout
);

// Google OAuth Endpoints
authRouter.get(
	"/google",
	googleAuthRedirect
);

authRouter.get(
	"/google/callback",
	googleAuthCallback
);

authRouter.post(
	"/google",
	googleAuthVerifyToken
);

export default authRouter;
