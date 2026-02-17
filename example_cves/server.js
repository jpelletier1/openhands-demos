const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const lodash = require('lodash');
const moment = require('moment');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'super-secret-key-123';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory todo storage
let todos = [];
let todoId = 1;

// Routes
app.get('/', (req, res) => {
  res.render('index', { todos, user: req.session.user });
});

app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  
  // Vulnerable: using lodash without sanitization could lead to prototype pollution
  const newTodo = {
    id: todoId++,
    title: lodash.escape(title),
    description: lodash.escape(description),
    completed: false,
    createdAt: moment().toISOString()
  };
  
  todos.push(newTodo);
  res.redirect('/');
});

app.post('/todos/:id/complete', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (todo) {
    todo.completed = true;
  }
  
  res.redirect('/');
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  todos = todos.filter(t => t.id !== parseInt(id));
  res.json({ success: true });
});

// Vulnerable endpoint: SSRF via axios
app.post('/fetch-url', async (req, res) => {
  const { url } = req.body;
  
  try {
    // Vulnerable: No URL validation, could lead to SSRF
    const response = await axios.get(url);
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vulnerable: JWT none algorithm
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vulnerable: Using 'none' algorithm allows token forgery
  const token = jwt.sign({ username }, SECRET, { algorithm: 'none' });
  
  req.session.user = { username, token };
  res.json({ token });
});

// Vulnerable endpoint: prototype pollution simulation
app.post('/merge', (req, res) => {
  const { target } = req.body;
  const source = req.body.source || {};
  
  // Vulnerable: lodash merge can lead to prototype pollution
  const result = lodash.merge(target, source);
  res.json(result);
});

// Search functionality using vulnerable moment
app.get('/search', (req, res) => {
  const { date } = req.query;
  
  // Using old moment version with known vulnerabilities
  const parsed = moment(date, 'YYYY-MM-DD', true);
  const isValid = parsed.isValid();
  
  res.json({ date, valid: isValid, formatted: parsed.format() });
});

app.listen(PORT, () => {
  console.log(`To Do app running on http://localhost:${PORT}`);
});
