import jwt from 'jsonwebtoken';
import { z } from 'zod';
const AuthHeaderSchema = z.object({
    authorization: z.string().startsWith('Bearer '),
});
export const authMiddleware = (req, res, next) => {
    try {
        const { authorization } = AuthHeaderSchema.parse(req.headers);
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.headers['x-user-id'] = decoded.userId;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Missing or invalid Authorization header' });
            return;
        }
        res.status(401).json({ error: 'Unauthorized: Invalid Token' });
    }
};
