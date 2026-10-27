const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 12000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store so the demo is self-contained
let todos = [];
let nextTodoId = 1;
let listName = 'My Todo List';

app.get('/api/todos', (req, res) => {
  res.json({ listName, todos });
});

app.post('/api/todos', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Todo title is required' });
  }
  const todo = {
    id: nextTodoId++,
    title,
    completed: false
  };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id, 10));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  if (typeof req.body.completed === 'boolean') {
    todo.completed = req.body.completed;
  }
  if (typeof req.body.title === 'string' && req.body.title.trim()) {
    todo.title = req.body.title.trim();
  }
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.status(204).end();
});

app.put('/api/list-name', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'List name is required' });
  }
  listName = name;
  res.json({ listName });
});

// Export app for testing and only listen when run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Todo app running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;