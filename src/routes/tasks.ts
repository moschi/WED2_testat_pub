import express = require('express');
import { tasksController } from '../controller/tasksController';
const router = express.Router();

router.get('/', tasksController.showTasksDefault.bind(tasksController));
router.get('/sort/:attr/:dir/', tasksController.showTasksSorted.bind(tasksController));
router.get('/toggle/:prop/', tasksController.toggleProp.bind(tasksController));

router.get('/:taskid/', tasksController.showTask.bind(tasksController));
router.post('/:taskid', tasksController.saveTask.bind(tasksController));

module.exports = router;
