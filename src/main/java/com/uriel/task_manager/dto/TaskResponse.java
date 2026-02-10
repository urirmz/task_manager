package com.uriel.task_manager.dto;

import com.uriel.task_manager.entity.TaskPriority;
import com.uriel.task_manager.entity.TaskStatus;
import java.time.LocalDateTime;
import java.util.Objects;

public class TaskResponse extends BaseResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private UserResponse assignedUser;
    private LocalDateTime scheduledDateTime;
    private LocalDateTime createdDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public UserResponse getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(UserResponse assignedUser) {
        this.assignedUser = assignedUser;
    }

    public LocalDateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(LocalDateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        TaskResponse that = (TaskResponse) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(title, that.title) &&
                Objects.equals(description, that.description) &&
                status == that.status &&
                priority == that.priority &&
                Objects.equals(assignedUser, that.assignedUser) &&
                Objects.equals(scheduledDateTime, that.scheduledDateTime) &&
                Objects.equals(createdDate, that.createdDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, title, description, status, priority, assignedUser, scheduledDateTime,
                createdDate);
    }

}