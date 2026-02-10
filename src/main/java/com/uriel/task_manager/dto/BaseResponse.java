package com.uriel.task_manager.dto;

import jakarta.annotation.Nullable;

import java.time.LocalDateTime;
import java.util.Objects;

public class BaseResponse {

    private @Nullable String apiStatus;
    private @Nullable LocalDateTime timeStamp;

    public BaseResponse() {
        this.timeStamp = LocalDateTime.now();
    }

    public String getApiStatus() {
        return apiStatus;
    }

    public void setApiStatus(String apiStatus) {
        this.apiStatus = apiStatus;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass())
            return false;

        BaseResponse that = (BaseResponse) o;
        return Objects.equals(apiStatus, that.apiStatus) && Objects.equals(timeStamp, that.timeStamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(apiStatus, timeStamp);
    }

}