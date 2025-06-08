import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

import usersRouter from './routes/users.router';

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('1');
});

app.use('/users', usersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});