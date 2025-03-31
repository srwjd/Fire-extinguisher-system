import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getReport, getFiresByIds, insertInspection, updateStatus } from "../controller/useController.js";

const router = Router();

/**
 * @swagger
 * /fire/login:
 *   post:
 *     description: example for login username = user, password = 123
 *     summary: Login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:   
 *       200:
 *         description: OK success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 userID:
 *                   type: number
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await getUserByUsername(username)
        if (result.length === 0) {
            return res.status(400).json({ message: 'not found' });
        }
        // const match = await bcrypt.compare(password, result[0].password);
        const match = password === result[0].password
        if (!match) {
            return res.status(400).json({ message: 'not found' })
        }
        // const token = await jwt.sign({ id: result[0].id }, jwt_secret, { expiresIn: '1h' });
        const token = jwt.sign({ id: result[0].id }, 'secret', { expiresIn: '1h' });
        const role = result[0].role_name
        const userID = result[0].user_id
        return res.status(200).json({ message: 'OK success', token, role, userID });
    } catch (error) {
        res.status(500).json({ message: 'error' });
    }
    res.status(200).json({ token: 'token' });
})

/**
 * @swagger
 * /fire/getreports/{userID}:
 *   get:
 *     description: example for get report userID = 1
 *     summary: get report
 *     tags: [Fire extinguisher]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: number
 *     responses:   
 *       200:
 *         description: OK success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 */
router.get('/getreports/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const result = await getReport(userID);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Not found' });
        }
        return res.status(200).json({ message: 'OK success', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /fire/getfire/{fire_ids}:
 *   get:
 *     description: example for get fire extinguisher fire_ids = 1,2
 *     summary: get fire extinguisher
 *     tags: [Fire extinguisher]
 *     parameters:
 *       - in: path
 *         name: fire_ids
 *         required: true
 *         schema:
 *           type: string
 *     responses:   
 *       200:
 *         description: OK success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 */
router.get('/getfire/:fire_ids', async (req, res) => {
    try {
        const fireIds = req.params.fire_ids.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        if (fireIds.length === 0) {
            return res.status(400).json({ message: "Invalid fire IDs" });
        }

        const result = await getFiresByIds(fireIds);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No fire extinguishers found' });
        }
        return res.status(200).json({ message: 'OK success', result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /fire/insertinspection/{fire_id}:
 *   put:
 *     description: example for insert inspection fire_id = 1, filename = 'test', description = 'test', date = '2023-01-01', time = '00:00:00', user_id = 1, assign_id = 1, condition_ok = true, pressure_ok = true, nozzle_clear = true, pin_sealed = true, placement_correct = true
 *     summary: insert inspection
 *     tags: [Fire extinguisher]
 *     parameters:
 *       - in: path
 *         name: fire_id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               user_id:
 *                 type: number
 *               assign_id:
 *                 type: number
 *               condition_ok:
 *                 type: boolean
 *               pressure_ok:
 *                 type: boolean
 *               nozzle_clear:
 *                 type: boolean
 *               pin_sealed:
 *                 type: boolean
 *               placement_correct:
 *                 type: boolean
 *     responses:   
 *       200:
 *         description: OK success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/insertinspection/:fire_id', async (req, res) => {
    try {
        const { fire_id } = req.params;
        const { filename, description, date, time, user_id, assign_id, condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct } = req.body;

        // เรียกใช้ insertInspection และรอผล
        await insertInspection({
            fire_id, filename, description, date, time, user_id, assign_id,
            condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct
        });

        // ส่ง Response ถ้าบันทึกสำเร็จ
        return res.status(200).json({ message: 'บันทึกผลการตรวจสอบเรียบร้อย' });

    } catch (error) {
        console.error("Error occurred while inserting inspection:", error);

        // ส่ง Response เมื่อเกิดข้อผิดพลาด
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: error.message });
    }
});

/**
 * @swagger
 * /fire/updatestatus:
 *   post:
 *     description: example for update status fire_id = 1
 *     summary: update status
 *     tags: [Fire extinguisher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fire_id:
 *                 type: number
 *     responses:   
 *       200:
 *         description: OK success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/updatestatus', async (req, res) => {
    const { fire_id } = req.body;
    try {
        const result = await updateStatus({fire_id});
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Fire extinguisher not found' });
        }
        return res.status(200).json({ message: 'OK success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router