import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

import usersRouter from '../routes/users.router.ts';

app.use(express.json());

const corsOptions = {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE']
};

app.use(cors(corsOptions));

app.get('/', (req: Request, res: Response) => {
    res.send('1');
});

app.use('/users', usersRouter);

export default app;