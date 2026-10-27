document.addEventListener('DOMContentLoaded', function () {
  var listNameEl = document.getElementById('list-name');
  var renameForm = document.getElementById('rename-form');
  var listNameInput = document.getElementById('list-name-input');
  var editNameBtn = document.getElementById('edit-name-btn');
  var cancelRenameBtn = document.getElementById('cancel-rename-btn');

  var todoForm = document.getElementById('todo-form');
  var todoInput = document.getElementById('todo-input');
  var todoList = document.getElementById('todo-list');
  var emptyState = document.getElementById('empty-state');

  function showError(message) {
    var banner = document.querySelector('.error-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'error-banner';
      var container = document.querySelector('.container');
      container.insertBefore(banner, container.firstChild);
    }
    banner.textContent = message;
    setTimeout(function () {
      banner.remove();
    }, 3000);
  }

  function renderEmptyState() {
    emptyState.classList.toggle('hidden', todoList.children.length > 0);
  }

  function createTodoElement(todo) {
    var li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-check';
    checkbox.checked = todo.completed;

    var title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.title;
    if (todo.completed) {
      title.classList.add('completed');
    }

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete todo');

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(deleteBtn);
    return li;
  }

  function appendTodo(todo) {
    var li = createTodoElement(todo);
    todoList.appendChild(li);
    renderEmptyState();
    return li;
  }

  function loadTodos() {
    fetch('/api/todos')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        listNameEl.textContent = data.listName;
        todoList.innerHTML = '';
        data.todos.forEach(function (todo) {
          todoList.appendChild(createTodoElement(todo));
        });
        renderEmptyState();
      })
      .catch(function () {
        showError('Failed to load todos.');
      });
  }

  todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = todoInput.value.trim();
    if (!title) return;

    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to add todo');
        return res.json();
      })
      .then(function (todo) {
        todoInput.value = '';
        appendTodo(todo);
      })
      .catch(function () {
        showError('Failed to add todo.');
      });
  });

  todoList.addEventListener('change', function (e) {
    if (!e.target.classList.contains('todo-check')) return;
    var li = e.target.closest('.todo-item');
    var id = parseInt(li.dataset.id, 10);

    fetch('/api/todos/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: e.target.checked })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to update todo');
        return res.json();
      })
      .then(function (todo) {
        var title = li.querySelector('.todo-title');
        title.classList.toggle('completed', todo.completed);
      })
      .catch(function () {
        showError('Failed to update todo.');
      });
  });

  todoList.addEventListener('click', function (e) {
    if (!e.target.classList.contains('delete-btn')) return;
    var li = e.target.closest('.todo-item');
    var id = parseInt(li.dataset.id, 10);

    fetch('/api/todos/' + id, { method: 'DELETE' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to delete todo');
        li.remove();
        renderEmptyState();
      })
      .catch(function () {
        showError('Failed to delete todo.');
      });
  });

  editNameBtn.addEventListener('click', function () {
    listNameInput.value = listNameEl.textContent;
    renameForm.classList.remove('hidden');
    listNameInput.focus();
    editNameBtn.classList.add('hidden');
  });

  cancelRenameBtn.addEventListener('click', function () {
    renameForm.classList.add('hidden');
    editNameBtn.classList.remove('hidden');
  });

  renameForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = listNameInput.value.trim();
    if (!name) return;

    fetch('/api/list-name', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to rename list');
        return res.json();
      })
      .then(function (data) {
        listNameEl.textContent = data.listName;
        renameForm.classList.add('hidden');
        editNameBtn.classList.remove('hidden');
      })
      .catch(function () {
        showError('Failed to rename list.');
      });
  });

  loadTodos();
});