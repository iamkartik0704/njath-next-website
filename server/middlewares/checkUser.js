import { User } from "../models/user.model.js";
import { checkJwtToken } from "../utils/auth.util.js";
import logger from "../utils/logger.js";

export const checkUser = (userRole) => {
    return async (req, res, next) => {
        let token = req.cookies.access_token;

        if (!token && req.headers.authorization) {
            if (req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.slice(7).trim();
            } else {
                token = req.headers.authorization.trim();
            }
        }

        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorised, Token not found",
            });
        }

        try {
            const payload = checkJwtToken(token);
            if (!payload || (!payload.email && !payload.id && !payload.username)) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorised, Invalid token",
                });
            }

            let user = null;
            if (payload.id) {
                user = await User.findById(payload.id).exec();
            }
            if (!user && payload.email) {
                user = await User.findOne({ email: payload.email }).exec();
            }
            if (!user && payload.username) {
                user = await User.findOne({ username: payload.username }).exec();
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorised, Invalid token or user no longer exists",
                });
            }

            if (!userRole.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorised for this action",
                });
            }

            req.user = user;
            next();
        } catch (e) {
            logger.error(e);
            return res.status(401).json({
                success: false,
                message: "Session expired or invalid token",
            });
        }
    };
};
