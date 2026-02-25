let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

$(document).ready(function () {

  fetchTasks();

  // Theme toggle
  $('#themeToggle').click(() => $('body').toggleClass('dark'));

  // Open modal
  $('#openModal').click(() => $('#taskModal').show());
  $('.close').click(() => $('#taskModal').hide());

  // Add Task via AJAX simulation
  $('#addTaskBtn').click(function () {
    let title = $('#taskTitle').val().trim();
    if (!title) return alert('Enter task');

    $.ajax({
      url: 'https://jsonplaceholder.typicode.com/todos',
      method: 'POST',
      data: JSON.stringify({ title, completed: false }),
      contentType: "application/json",
      success: function (res) {
        tasks.push({ id: Date.now(), title, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        $('#taskModal').hide();
        $('#taskTitle').val('');
      }
    });
  });

  // Search
  $('#search').on('input', renderTasks);

  // Filter
  $('#filter').change(renderTasks);
});

function fetchTasks() {
  $('#loader').show();

  $.ajax({
    url: 'https://jsonplaceholder.typicode.com/todos?_limit=5',
    success: function (data) {
      if (tasks.length === 0) {
        tasks = data;
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
      $('#loader').hide();
      renderTasks();
    }
  });
}

function renderTasks() {
    let search = $('#search').val().toLowerCase();
    let filter = $('#filter').val();
  
    $('#taskList').empty();
  
    tasks
      .filter(t => t.title.toLowerCase().includes(search))
      .filter(t =>
        filter === 'all' ||
        (filter === 'completed' && t.completed) ||
        (filter === 'pending' && !t.completed)
      )
      .forEach((task, index) => {
        $('#taskList').append(`
          <li draggable="true"
              class="task-item ${task.completed ? 'completed' : ''}"
              data-index="${index}">
            <span class="task-title" onclick="toggleTask(${task.id})">
              ${task.title}
            </span>
            <button onclick="deleteTask(${task.id})">❌</button>
          </li>
        `);
      });
  
    enableDragDrop(); // 👈 REQUIRED
  }
  

function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}
let dragStartIndex;

function enableDragDrop() {
  const items = document.querySelectorAll('.task-item');

  items.forEach(item => {

    item.addEventListener('dragstart', () => {
      dragStartIndex = +item.dataset.index;
    });

    item.addEventListener('dragover', e => e.preventDefault());

    item.addEventListener('drop', () => {
      const dragEndIndex = +item.dataset.index;
      swapTasks(dragStartIndex, dragEndIndex);
    });

  });
}

function swapTasks(from, to) {
  const temp = tasks[from];
  tasks[from] = tasks[to];
  tasks[to] = temp;

  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

