import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Hello from Accusations!' });
});

export default app;
