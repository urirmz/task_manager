let currentUser = null;
let allTasks = [];
let allUsers = [];

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const userGreeting = document.getElementById("userGreeting");
const userRole = document.getElementById("userRole");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");
const assignedUser = document.getElementById("assignedUser");
const exportCsvBtn = document.getElementById("exportCsvBtn");

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
      filterAndDisplayTasks();
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
