import { env } from "./config/env.js";
import app from "./app.js";

const PORT = env;

app.listen(PORT, () => {
    console.log(`TaskFlow API is running on http://localhost:${PORT}`);
});