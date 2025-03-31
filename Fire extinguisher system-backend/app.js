import express from "express";
import cors from "cors";
import router from "./router/useRouter.js";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Fire extinguisher system API Documentation",
            description: `
**ชื่อ**: นางสาวสิราวรรณ จันแดง  
**รหัสนักศึกษา**: 66012968  
**สาขา**: วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์  
**คณะ**: เทคโนโลยีสารสนเทศ  
**มหาวิทยาลัย**: ศรีปทุม 

เป็นผู้สร้าง Back End API และ จัดทำเอกสาร API ฉบับนี้

**โครงงาน**: Fire extinguisher system  
**เวอร์ชัน**: 1.0.0  
**มาตรฐาน**: OpenAPI 3.0.0 

ประกอบด้วย:
- User จำนวน 1 API
- Fire extinguisher จำนวน 4 APIs
`,
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:3000`,
                description: "Local server",
            },
        ],
        tags: [
            {
                name: "User",
                description: "User related endpoints",
            },
            {
                name: "Fire extinguisher",
                description: "Fire extinguisher related endpoints",
            },
        ],
    },
    apis: ["./router/useRouter.js"],
});

app.use(cors());
app.use(express.json());

app.use('/fire', router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // ย้ายมาหลังจาก app ถูกกำหนดค่า

app.listen(3000, () => console.log("Server running on port 3000"));