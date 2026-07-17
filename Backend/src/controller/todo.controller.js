import Todo from "../models/todo.model.js";

// Fetch all todos for the logged-in user
export async function getTodos(req, res) {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos", error: error.message });
  }
}

// Create a new todo item
export async function createTodo(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Task text is required" });
    }

    const todo = new Todo({
      user: req.user._id,
      text: text.trim()
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create todo", error: error.message });
  }
}

// Toggle a todo item completed status
export async function toggleTodo(req, res) {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle todo status", error: error.message });
  }
}

// Delete a todo item
export async function deleteTodo(req, res) {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }
    res.json({ message: "Todo item deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete todo", error: error.message });
  }
}
