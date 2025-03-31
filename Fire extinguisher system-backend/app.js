import express from "express";
import cors from "cors";
import path from "path"; // เพิ่มการ import path
import router from "./router/useRouter.js";

const app = express();


app.use(cors());
app.use(express.json());

// ใช้ router สำหรับเส้นทาง '/fire'
app.use('/fire', router);

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 3000
app.listen(3000, () => console.log("Server running on port 3000"));
