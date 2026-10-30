import { getClearedLevel } from "../utils/participant.util.js";

export const validateLevelParams = async (req, res, next) => {
    const user = req.user;
    const level = parseInt(req.query.level, 10);
    const frontendOrder = parseInt(req.query.order, 10);

    if (isNaN(level)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid level parameter. Please provide a number.'
        });
    }

    if (isNaN(frontendOrder)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order parameter. Please provide a number.'
        });
    }

    try {
        const cleared = await getClearedLevel(user);
        if (level > cleared) {
            return res.status(401).json({
                success: false,
                message: "Clear previous levels first"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to validate level parameters"
        });
    }
};
