import express from "express";
import cors from "cors";
import router from "./router/useRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/fire', router);

app.listen(3000, () => console.log("Server running on port 3000"));