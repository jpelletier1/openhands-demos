const test = require('node:test');
const assert = require('node:assert');
const app = require('../example_todo_app/server.js');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(() => {
  server.close();
});

test('GET /api/todos returns the default list name and no todos', async () => {
  const res = await fetch(`${baseUrl}/api/todos`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.listName, 'My Todo List');
  assert.ok(Array.isArray(data.todos));
});

test('GET / serves the todo app HTML', async () => {
  const res = await fetch(baseUrl);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /Todo App/);
});

test('POST /api/todos creates a todo', async () => {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Buy groceries' })
  });
  assert.strictEqual(res.status, 201);
  const todo = await res.json();
  assert.strictEqual(todo.title, 'Buy groceries');
  assert.strictEqual(todo.completed, false);
  assert.ok(todo.id);
});

test('POST /api/todos rejects an empty title', async () => {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' })
  });
  assert.strictEqual(res.status, 400);
});

test('PUT /api/todos/:id toggles completed status', async () => {
  const createRes = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Walk the dog' })
  });
  const todo = await createRes.json();

  const res = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  assert.strictEqual(res.status, 200);
  const updated = await res.json();
  assert.strictEqual(updated.completed, true);
});

test('PUT /api/todos/:id returns 404 for an unknown id', async () => {
  const res = await fetch(`${baseUrl}/api/todos/999999`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  assert.strictEqual(res.status, 404);
});

test('DELETE /api/todos/:id removes a todo', async () => {
  const createRes = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Temporary todo' })
  });
  const todo = await createRes.json();

  const res = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
    method: 'DELETE'
  });
  assert.strictEqual(res.status, 204);
});

test('PUT /api/list-name changes the list name', async () => {
  const res = await fetch(`${baseUrl}/api/list-name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Work Tasks' })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.listName, 'Work Tasks');

  const getRes = await fetch(`${baseUrl}/api/todos`);
  const getData = await getRes.json();
  assert.strictEqual(getData.listName, 'Work Tasks');
});

test('PUT /api/list-name rejects an empty name', async () => {
  const res = await fetch(`${baseUrl}/api/list-name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '   ' })
  });
  assert.strictEqual(res.status, 400);
});