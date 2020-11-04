import express = require('express');
import { tasksController } from '../controller/tasksController';
const router = express.Router();

router.get('/', tasksController.showTasksDefault.bind(tasksController));

module.exports = router;
