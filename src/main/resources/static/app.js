let currentUser = null;
let allTasks = [];
let allUsers = [];
let currentView = "list";
let calendarDate = new Date();

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const userGreeting = document.getElementById("userGreeting");
const userRole = document.getElementById("userRole");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const listControls = document.getElementById("listControls");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");
const assignedUser = document.getElementById("assignedUser");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const listViewBtn = document.getElementById("listViewBtn");
const calendarViewBtn = document.getElementById("calendarViewBtn");
const listView = document.getElementById("listView");
const calendarView = document.getElementById("calendarView");
const calendarDays = document.getElementById("calendarDays");
const currentMonthYear = document.getElementById("currentMonthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
  taskForm.addEventListener("submit", handleCreateTask);
  statusFilter.addEventListener("change", filterAndDisplayTasks);
  sortBy.addEventListener("change", filterAndDisplayTasks);
  exportCsvBtn.addEventListener("click", handleExportTasks);

  listViewBtn.addEventListener("click", () => switchView("list"));
  calendarViewBtn.addEventListener("click", () => switchView("calendar"));
  prevMonthBtn.addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });
}

function switchView(view) {
  currentView = view;
  if (view === "list") {
    listView.style.display = "block";
    calendarView.style.display = "none";
    listControls.style.display = "flex";
    listViewBtn.classList.add("active");
    calendarViewBtn.classList.remove("active");
    filterAndDisplayTasks();
  } else {
    listView.style.display = "none";
    calendarView.style.display = "block";
    listControls.style.display = "none";
    listViewBtn.classList.remove("active");
    calendarViewBtn.classList.add("active");
    renderCalendar();
  }
}

async function checkAuth() {
  try {
    const response = await fetch("/api/authorization/current", {
      credentials: "include",
    });
    const data = await response.json();

    if (data.authenticated) {
      currentUser = data.user;
      showDashboard();
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin();
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/authorization/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.apiStatus === 'SUCCESS') {
      currentUser = data.user;
      showDashboard();
    } else {
      showError(data.message || "Login failed");
    }
  } catch (error) {
    showError("An error occurred during login");
  }
}

async function handleLogout() {
  try {
    await fetch("/api/authorization/logout", {
      method: "POST",
      credentials: "include",
    });
    currentUser = null;
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function showLogin() {
  loginSection.style.display = "flex";
  dashboardSection.style.display = "none";
  loginForm.reset();
  loginError.classList.remove("show");
}

function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";

  userGreeting.textContent = `Welcome, ${currentUser.name}`;
  userRole.textContent = currentUser.role;

  loadUsers();
  loadTasks();
}

function showError(message) {
  loginError.textContent = message;
  loginError.classList.add("show");
}

async function loadUsers() {
  try {
    const response = await fetch("/api/users", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      allUsers = data.users;
      assignedUser.innerHTML = '<option value="">Unassigned</option>';
      allUsers.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (${user.role})`;
        assignedUser.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

async function loadTasks() {
  try {
    const response = await fetch("/api/tasks", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      allTasks = data.tasks;
      updateStatistics();
      if (currentView === "calendar") {
        renderCalendar();
      } else {
        filterAndDisplayTasks();
      }
    } else {
      taskList.innerHTML =
        '<p class="error-message show">Failed to load tasks</p>';
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
    taskList.innerHTML =
      '<p class="error-message show">Error loading tasks</p>';
  }
}

async function handleCreateTask(e) {
  e.preventDefault();

  const taskData = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDescription").value,
    scheduledDateTime: document.getElementById("taskDateTime").value || null,
    priority: document.getElementById("taskPriority").value,
    assignedUserId: document.getElementById("assignedUser").value || null,
  };

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      taskForm.reset();
      toggleCreateForm();
      loadTasks();
    } else {
      const error = await response.json();
      alert("Error creating task: " + (error.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error creating task:", error);
    alert("Error creating task");
  }
}

function handleExportTasks() {
  window.location.href = "/api/tasks/export";
}

async function approveTask(taskId) {
  if (!confirm("Are you sure you want to approve this task?")) return;

  try {
    const response = await fetch(`/api/tasks/${taskId}/approve`, {
      method: "PUT",
      credentials: "include",
    });

    if (response.ok) {
      loadTasks();
    } else {
      const error = await response.json();
      alert("Error approving task: " + (error.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error approving task:", error);
    alert("Error approving task");
  }
}

async function rejectTask(taskId) {
  if (!confirm("Are you sure you want to reject this task?")) return;

  try {
    const response = await fetch(`/api/tasks/${taskId}/reject`, {
      method: "PUT",
      credentials: "include",
    });

    if (response.ok) {
      loadTasks();
    } else {
      const error = await response.json();
      alert("Error rejecting task: " + (error.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error rejecting task:", error);
    alert("Error rejecting task");
  }
}

function updateStatistics() {
  const pending = allTasks.filter((t) => t.status === "PENDING").length;
  const approved = allTasks.filter((t) => t.status === "APPROVED").length;
  const rejected = allTasks.filter((t) => t.status === "REJECTED").length;

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("approvedCount").textContent = approved;
  document.getElementById("rejectedCount").textContent = rejected;
}

function filterAndDisplayTasks() {
  let filteredTasks = [...allTasks];

  const statusValue = statusFilter.value;
  if (statusValue) {
    filteredTasks = filteredTasks.filter((task) => task.status === statusValue);
  }

  const sortValue = sortBy.value;
  if (sortValue === "date") {
    filteredTasks.sort((a, b) => {
      const dateA = a.scheduledDateTime
        ? new Date(a.scheduledDateTime)
        : new Date(a.createdDate);
      const dateB = b.scheduledDateTime
        ? new Date(b.scheduledDateTime)
        : new Date(b.createdDate);
      return dateA - dateB;
    });
  } else if (sortValue === "priority") {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    filteredTasks.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
    );
  }

  displayTasks(filteredTasks);
}

function displayTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No tasks found</p>
            </div>
        `;
    return;
  }

  taskList.innerHTML = tasks.map((task) => createTaskCard(task)).join("");
}

function createTaskCard(task) {
  const canApprove = currentUser.role === "MANAGER";
  const isPending = task.status === "PENDING";
  const showActions = canApprove && isPending;

  const scheduledDate = task.scheduledDateTime
    ? new Date(task.scheduledDateTime).toLocaleString()
    : "Not scheduled";

  const createdDate = new Date(task.createdDate).toLocaleString();

  return `
        <div class="task-item">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <div class="task-meta">
                        <span class="badge badge-${task.status.toLowerCase()}">${task.status}</span>
                        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                    </div>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
            <div class="task-details">
                <span>📅 Scheduled: ${scheduledDate}</span>
                <span>🕐 Created: ${createdDate}</span>
                ${task.assignedUser ? `<span>👤 Assigned to ${escapeHtml(task.assignedUser.name)}</span>` : "<span>👤 Unassigned</span>"}
            </div>
            ${
              showActions
                ? `
                <div class="task-actions">
                    <button class="btn btn-success btn-sm" onclick="approveTask(${task.id})">
                        ✓ Approve
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectTask(${task.id})">
                        ✗ Reject
                    </button>
                </div>
            `
                : ""
            }
        </div>
    `;
}

function toggleCreateForm() {
  const form = document.getElementById("createTaskForm");
  const icon = document.getElementById("toggleIcon");

  if (form.style.display === "none") {
    form.style.display = "block";
    icon.classList.add("open");
  } else {
    form.style.display = "none";
    icon.classList.remove("open");
  }
}

function renderCalendar() {
  calendarDays.innerHTML = "";
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  currentMonthYear.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(calendarDate);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    calendarDays.appendChild(createDayCell(day, true));
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = isCurrentMonth && today.getDate() === i;
    calendarDays.appendChild(createDayCell(i, false, isToday));
  }

  // Next month padding
  const totalCells = firstDay + daysInMonth;
  const nextMonthPadding = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarDays.appendChild(createDayCell(i, true));
  }
}

function createDayCell(day, isOtherMonth, isToday = false) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";
  if (isOtherMonth) cell.classList.add("other-month");
  if (isToday) cell.classList.add("today");

  const dayNum = document.createElement("span");
  dayNum.className = "day-number";
  dayNum.textContent = day;
  cell.appendChild(dayNum);

  if (!isOtherMonth) {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = allTasks.filter(task => {
      if (!task.scheduledDateTime) return false;
      return task.scheduledDateTime.startsWith(dateStr);
    });

    if (dayTasks.length > 0) {
      const container = document.createElement("div");
      container.className = "calendar-tasks";
      dayTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = `calendar-task-item ${task.status.toLowerCase()}`;
        item.textContent = task.title;
        item.title = `${task.title} (${task.status})`;
        container.appendChild(item);
      });
      cell.appendChild(container);
    }
  }

  return cell;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
