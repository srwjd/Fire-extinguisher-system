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
                        This is the API documentation for the Fire extinguisher system.
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
            }
        ],
    },
    apis: ["./router/useRouter.js"],
});

app.use(cors());
app.use(express.json());

// ใช้ router สำหรับเส้นทาง '/fire'
app.use('/fire', router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // ย้ายมาหลังจาก app ถูกกำหนดค่า

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 3000
app.listen(3000, () => console.log("Server running on port 3000"));
