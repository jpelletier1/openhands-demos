# Example Todo App

A simple todo list application built with Node.js, Express, HTML, CSS, and JavaScript. Demonstrates basic CRUD operations and a dynamic, in-memory todo list.

## Features

- **Add Todos**: Add new todo items to the list
- **Complete Todos**: Mark todos as complete with a checkbox
- **Delete Todos**: Remove todos from the list
- **Change List Name**: Rename the todo list to anything you like

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js with Express

## Installation

1. Navigate to the example directory:
```bash
cd example_todo_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:12000
```

## Project Structure

```
openhands-demos/
└── example_todo_app/          # Todo list demo application
    ├── public/
    │   ├── css/
    │   │   └── style.css      # Styling for the todo app
    │   ├── js/
    │   │   └── app.js         # Frontend logic (fetch API calls)
    │   └── index.html         # Main HTML file
    ├── server.js              # Node.js Express server with REST API
    ├── package.json           # Project dependencies
    └── README.md              # This file
```

## How to Use

1. **Add a Todo**: Type a task in the input box and click "Add Todo"
2. **Complete a Todo**: Check the checkbox next to a todo to mark it complete
3. **Delete a Todo**: Click the "Delete" button to remove a todo
4. **Rename the List**: Click "Rename", enter a new name, and click "Save"

## API

- `GET /api/todos` - Get the list name and all todos
- `POST /api/todos` - Create a todo (`{ "title": "..." }`)
- `PUT /api/todos/:id` - Update a todo (title or completed status)
- `DELETE /api/todos/:id` - Delete a todo
- `PUT /api/list-name` - Change the list name (`{ "name": "..." }`)

## License

MIT