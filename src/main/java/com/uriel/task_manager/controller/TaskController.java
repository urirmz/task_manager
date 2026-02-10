package com.uriel.task_manager.controller;

import com.uriel.task_manager.dto.TaskListResponse;
import com.uriel.task_manager.dto.TaskResponse;
import com.uriel.task_manager.dto.TaskRequest;
import com.uriel.task_manager.dto.UserResponse;
import com.uriel.task_manager.entity.Task;
import com.uriel.task_manager.entity.TaskStatus;
import com.uriel.task_manager.entity.User;
import com.uriel.task_manager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final String SUCCESS = "SUCCESS";

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<TaskListResponse> getAllTasks(@RequestParam(required = false) String status) {
        List<Task> tasks;
        if (status != null && !status.isEmpty()) {
            tasks = taskService.getTasksByStatus(TaskStatus.valueOf(status.toUpperCase()));
        } else {
            tasks = taskService.getAllTasks();
        }

        TaskListResponse response = new TaskListResponse();
        response.setTasks(tasks.stream().map(this::mapToTaskResponse).toList());
        response.setApiStatus(SUCCESS);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        TaskResponse response = mapToTaskResponse(task);
        response.setApiStatus(SUCCESS);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest taskRequest) {
        Task task = taskService.createTask(taskRequest);
        TaskResponse response = mapToTaskResponse(task);
        response.setApiStatus(SUCCESS);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approveTask(@PathVariable Long id) {
        Task task = taskService.approveTask(id);
        TaskResponse response = mapToTaskResponse(task);
        response.setApiStatus(SUCCESS);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TaskResponse> rejectTask(@PathVariable Long id) {
        Task task = taskService.rejectTask(id);
        TaskResponse response = mapToTaskResponse(task);
        response.setApiStatus(SUCCESS);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTasksToCsv() {
        String csvData = taskService.generateTasksCsv();
        byte[] csvBytes = csvData.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tasks.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvBytes.length)
                .body(csvBytes);
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse dto = new TaskResponse();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setScheduledDateTime(task.getScheduledDateTime());
        dto.setCreatedDate(task.getCreatedDate());

        if (task.getAssignedUser() != null) {
            dto.setAssignedUser(mapToUserResponse(task.getAssignedUser()));
        }

        return dto;
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setRole(user.getRole().name());
        return dto;
    }

}