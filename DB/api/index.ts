import express, { Request, Response } from 'express';
import cors from 'cors';


const app = express();

import usersRouter from '../routes/users.router';
import productsRouter from '../routes/products.router';

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
app.use('/products', productsRouter);

export default app;