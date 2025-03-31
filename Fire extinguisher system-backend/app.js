import express from "express";
import cors from "cors";
import path from "path"; // เพิ่มการ import path
import router from "./router/useRouter.js";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

// ตั้งค่า swaggerSpec สำหรับ OpenAPI
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
    apis: ["./router/useRouter.js"], // ตรวจสอบว่า router มีการใส่ annotations สำหรับ Swagger
});


app.use(cors());
app.use(express.json());

// ใช้ router สำหรับเส้นทาง '/fire'
app.use('/fire', router);

// ตั้งค่าให้ Swagger UI สามารถเข้าถึงได้ที่ /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 3000
app.listen(3000, () => console.log("Server running on port 3000"));
