import type { RequestHandler } from "express";
import { getMe } from "@/modules/users/user.service.js";

export const getMeController: RequestHandler = async (req, res) => {
    const userId = req.user!.id;

    const user = await getMe(userId);

    return res.status(200).json({
        data: user,
    });
};
