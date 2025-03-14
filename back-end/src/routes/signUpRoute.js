import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { getDbConnection } from '../db';

export const signUpRoute = {
    path: '/api/signup',
    method: 'post',
    handler: async (req, res) => {
        const { email, password } = req.body;
        const db = getDbConnection('react-auth-db');
        const user = await db.collection('users').findOne({ email });

        if (user) {
            res.sendStatus(409);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const startingInfo = {
            hairColor: '',
            favoriteFood: '',
            bio: '',
        };

        const result = await db.collection('user').insertOne({
            email,
            passwordHash,
            info: startingInfo,
            isVerified: false,
        })
        const { insertedId } = result;

        jwt.sign({
            id: insertedId,
            email,
            info: startingInfo,
            isVerified: false
        },
        process.env.JWT_SECRET),
        {
            expiresIn: '2d'
        },
        (err, token) => {
            if (err) {
                return res.result(500).send(err);
            } 
            
            return res.status(200).json({ token });
        }

    }
}