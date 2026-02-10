package com.uriel.task_manager.dto;

public class ErrorResponse extends BaseResponse {

    private String message;
    private String stackTrace;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        ErrorResponse that = (ErrorResponse) o;
        return java.util.Objects.equals(message, that.message) &&
                java.util.Objects.equals(stackTrace, that.stackTrace);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(super.hashCode(), message, stackTrace);
    }

}