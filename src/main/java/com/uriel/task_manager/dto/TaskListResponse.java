package com.uriel.task_manager.dto;

import java.util.List;
import java.util.Objects;

public class TaskListResponse extends BaseResponse {
    private List<TaskResponse> tasks;

    public List<TaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        TaskListResponse that = (TaskListResponse) o;
        return Objects.equals(tasks, that.tasks);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), tasks);
    }

}