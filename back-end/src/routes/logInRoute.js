import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getDbConnection} from '../db'

export const logInRoute = {
    path: '/api/login',
    method: 'post',
    handler: async (req, res) => {
        const { email, password } = req.body;
        const db = getDbConnection('react-auth-db');
        const user = await db.collection('users').findOne({ email });

        if (!user) return res.sendStatus(401);

        const { _id:id, isVerified, passwordHash, info} = user;

        const isCorrect = await bcrypt.compare(password, passwordHash);

        if (isCorrect) {
            jwt.sign( { id, isVerified, email, info}, process.env.JWT_SECRET, {expires: '2d'}, (err, token)  => {
                if (err) {
                    res.sendStatus(500).json(err);
                }

                res.status(200).json({ token });
            });
        } else {
            res.sendStatus(401);
        }
    }
}