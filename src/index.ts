import dotenv from 'dotenv';
import { createApp } from './app';
dotenv.config();

const main = async () => {
    const app = await createApp();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

main();