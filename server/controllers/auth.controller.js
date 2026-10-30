import config from "../config/default.mjs";
import {
	Organizer,
	Participant,
	USER_ROLE,
	AUTH_PROVIDER,
	User,
} from "../models/user.model.js";
import {
	hashPassword,
	comparePassword,
	generateJwtToken,
	sendMail,
	checkJwtToken,
	InitialiseEmptyMatrix,
} from "../utils/auth.util.js";
import logger from "../utils/logger.js";

export const registerParticipant = (role) => {
	return async (req, res) => {
		const params = req.body;
		params["password"] = await hashPassword(params["password"]);
		params["role"] = role;

		try {
			let user = null;

			if (role === USER_ROLE.PARTICIPANT) {
				user = new Participant(params);
			} else {
				user = new Organizer(params);
			}

			await user.save();
			return res.status(201).json({
				success: true,
				message: "User created successfully",
			});
		} catch (e) {
			if (e.code === 11000) {
				return res.status(409).json({
					success: false,
					message: "User with the same username, email, or phone already exists",
				});
			} else {
				logger.error(e);
				return res.status(500).json({
					success: false,
					message: "User was not created",
				});
			}
		}
	};
};

export const login = async (req, res) => {
	const userData = req.body;
	try {
		const user = await User.findOne({ email: userData.email.toLowerCase().trim() });

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User with the provided email doesn't exist.",
			});
		}

		if (!user.password && user.authProvider === AUTH_PROVIDER.GOOGLE) {
			return res.status(400).json({
				success: false,
				message: "This account was registered using Google. Please log in with Google.",
			});
		}

		const match = await comparePassword(userData.password, user.password);

		if (!match) {
			return res.status(401).json({
				success: false,
				message: "Incorrect password",
			});
		}

		const payload = {
			id: user._id,
			email: user.email,
			username: user.username,
			phone: user.phone,
			role: user.role,
		};

		const accessToken = generateJwtToken(payload);

		const cookieOptions = {
			maxAge: config.cookieExpiry || 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: config.cookieSameSite,
			path: "/",
			secure: config.cookieSecure,
		};

		res.cookie("access_token", accessToken, cookieOptions);

		return res.status(200).json({
			success: true,
			message: "Login successful",
			token: accessToken,
			data: {
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (e) {
		logger.error(e);
		return res.status(500).json({
			success: false,
			message: "Login failed, server error",
		});
	}
};

export const forgetPassword = async (req, res) => {
	const userData = req.body;
	try {
		const user = await User.findOne(userData).exec();

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "No user with the given data found",
			});
		}

		const payload = {
			id: user._id,
			email: user.email,
			phone: user.phone,
			username: user.username,
		};

		const token = generateJwtToken(payload);
		const subject = "Reset Password for NJATH";
		const resetLink = `${config.frontendUrl}/resetPass?token=${token}`;
		const mailText =
			`Hello, ${user.username}\n\n` +
			"Please click on the link below to reset your password:\n" +
			`${resetLink}\n\n` +
			"Thank you\n\nTeam NJATH";

		let result = false;
		try {
			result = await sendMail(user.email, subject, mailText);
		} catch (e) {
			logger.error(e);
			return res.status(500).json({
				success: false,
				message: "Server error while sending email",
			});
		}

		if (!result) {
			return res.status(500).json({
				success: false,
				message: "Mail could not be sent. Please check your credentials.",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Mail sent, please check your inbox (and spam folder)",
		});
	} catch (e) {
		logger.error(e);
		return res.status(500).json({
			success: false,
			message: "Action failed, please try again",
		});
	}
};

export const resetPassword = async (req, res) => {
	const token = req.params.token;
	const userData = req.body;

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Token not found",
		});
	}

	try {
		const payload = checkJwtToken(token);
		if (!payload.email || !payload.username) {
			return res.status(401).json({
				success: false,
				message: "Invalid token",
			});
		}

		try {
			const user = await User.findOne({
				email: payload.email,
				username: payload.username,
			});

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "Invalid token or user not found",
				});
			}

			userData.password = await hashPassword(userData.password);
			user.password = userData.password;

			await user.save();
			return res.status(200).json({
				success: true,
				message: "Password successfully reset",
			});
		} catch (e) {
			logger.error(e);
			return res.status(500).json({
				success: false,
				message: "Password reset failed",
			});
		}
	} catch (e) {
		logger.error(e);
		return res.status(401).json({
			success: false,
			message: "Invalid token",
		});
	}
};

export const logout = (req, res) => {
	try {
		res.clearCookie("access_token", {
			path: "/",
			sameSite: config.cookieSameSite,
			secure: config.cookieSecure,
		});

		return res.status(200).json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).json({
			success: false,
			message: "Logout failed, server error",
		});
	}
};

// ==========================================
// GOOGLE OAUTH CONTROLLERS
// ==========================================

export const googleAuthRedirect = (req, res) => {
	if (!config.googleClientId) {
		return res.status(500).json({
			success: false,
			message: "Google Client ID is not configured. Please set GOOGLE_CLIENT_ID in server .env",
		});
	}

	const state = req.query.redirect || "/levels";
	const params = new URLSearchParams({
		client_id: config.googleClientId,
		redirect_uri: config.googleCallbackUrl,
		response_type: "code",
		scope: "openid email profile",
		access_type: "offline",
		prompt: "select_account",
		state: encodeURIComponent(state),
	});

	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	return res.redirect(googleAuthUrl);
};

export const googleAuthCallback = async (req, res) => {
	const { code, error } = req.query;

	if (error || !code) {
		logger.error(`Google OAuth canceled or errored: ${error || "No code provided"}`);
		return res.redirect(`${config.frontendUrl}/login?error=Google+login+cancelled`);
	}

	try {
		// 1. Exchange authorization code for tokens
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code: code,
				client_id: config.googleClientId,
				client_secret: config.googleClientSecret,
				redirect_uri: config.googleCallbackUrl,
				grant_type: "authorization_code",
			}),
		});

		const tokenData = await tokenResponse.json();
		if (!tokenResponse.ok || !tokenData.access_token) {
			logger.error({ tokenData }, "Google token exchange failed");
			return res.redirect(`${config.frontendUrl}/login?error=Google+token+exchange+failed`);
		}

		// 2. Fetch user profile from Google UserInfo endpoint
		const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
			headers: { Authorization: `Bearer ${tokenData.access_token}` },
		});

		const profile = await userInfoResponse.json();
		if (!userInfoResponse.ok || !profile.email) {
			logger.error({ profile }, "Failed to fetch user profile from Google");
			return res.redirect(`${config.frontendUrl}/login?error=Failed+to+fetch+Google+profile`);
		}

		// 3. Find or create Participant user
		let user = await User.findOne({
			$or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }],
		});

		if (!user) {
			// Generate a unique username based on email
			let baseUsername = profile.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
			if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
			let username = baseUsername;
			let counter = 1;
			while (await User.findOne({ username })) {
				username = `${baseUsername}${counter++}`;
			}

			user = new Participant({
				username: username,
				email: profile.email.toLowerCase(),
				fullname: profile.name || username,
				googleId: profile.sub,
				authProvider: AUTH_PROVIDER.GOOGLE,
				avatar: profile.picture || "",
				role: USER_ROLE.PARTICIPANT,
				points: config.initialPoints,
				remainingLoan: config.allowedLoan,
				correctAnswers: InitialiseEmptyMatrix(),
			});

			await user.save();
			logger.info(`New participant registered via Google: ${user.username} (${user.email})`);
		} else {
			// Link Google ID if registered with same email locally
			if (!user.googleId) {
				user.googleId = profile.sub;
				user.authProvider = AUTH_PROVIDER.GOOGLE;
			}
			if (profile.picture && !user.avatar) {
				user.avatar = profile.picture;
			}
			await user.save();
		}

		// 4. Issue JWT access_token
		const payload = {
			id: user._id,
			email: user.email,
			username: user.username,
			role: user.role,
		};

		const accessToken = generateJwtToken(payload);

		const cookieOptions = {
			maxAge: config.cookieExpiry || 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: config.cookieSameSite,
			path: "/",
			secure: config.cookieSecure,
		};

		res.cookie("access_token", accessToken, cookieOptions);

		// 5. Redirect back to frontend with token param (for cross-domain Safari/Chrome cookie fallback)
		return res.redirect(`${config.frontendUrl}/levels?token=${encodeURIComponent(accessToken)}`);
	} catch (err) {
		logger.error(err, "Google OAuth callback error");
		return res.redirect(`${config.frontendUrl}/login?error=Google+authentication+failed`);
	}
};

export const googleAuthVerifyToken = async (req, res) => {
	const { credential } = req.body;
	if (!credential) {
		return res.status(400).json({ success: false, message: "Google credential token is required" });
	}

	try {
		// Verify id_token with Google tokeninfo endpoint
		const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
		const profile = await verifyResponse.json();

		if (!verifyResponse.ok || !profile.email) {
			return res.status(401).json({ success: false, message: "Invalid Google credential" });
		}

		if (config.googleClientId && profile.aud !== config.googleClientId) {
			return res.status(401).json({ success: false, message: "Google Client ID mismatch" });
		}

		let user = await User.findOne({
			$or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }],
		});

		if (!user) {
			let baseUsername = profile.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
			if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
			let username = baseUsername;
			let counter = 1;
			while (await User.findOne({ username })) {
				username = `${baseUsername}${counter++}`;
			}

			user = new Participant({
				username: username,
				email: profile.email.toLowerCase(),
				fullname: profile.name || username,
				googleId: profile.sub,
				authProvider: AUTH_PROVIDER.GOOGLE,
				avatar: profile.picture || "",
				role: USER_ROLE.PARTICIPANT,
				points: config.initialPoints,
				remainingLoan: config.allowedLoan,
				correctAnswers: InitialiseEmptyMatrix(),
			});

			await user.save();
		} else {
			if (!user.googleId) user.googleId = profile.sub;
			if (profile.picture && !user.avatar) user.avatar = profile.picture;
			await user.save();
		}

		const payload = {
			id: user._id,
			email: user.email,
			username: user.username,
			role: user.role,
		};

		const accessToken = generateJwtToken(payload);

		res.cookie("access_token", accessToken, {
			maxAge: config.cookieExpiry || 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: config.cookieSameSite,
			path: "/",
			secure: config.cookieSecure,
		});

		return res.status(200).json({
			success: true,
			message: "Google login successful",
			data: {
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		logger.error(err);
		return res.status(500).json({ success: false, message: "Google verification failed" });
	}
};
