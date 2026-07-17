import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo
} from "../controller/todo.controller.js";

const router = Router();

router.use(authenticate);

router.route("/")
  .get(getTodos)
  .post(createTodo);

router.route("/:id/toggle")
  .patch(toggleTodo);

router.route("/:id")
  .delete(deleteTodo);

export default router;
