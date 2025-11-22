import app from './app';
import dotenv from 'dotenv';
import connectToMongo from './db/db';
dotenv.config();

const PORT = process.env.PORT || 8080;
connectToMongo();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
