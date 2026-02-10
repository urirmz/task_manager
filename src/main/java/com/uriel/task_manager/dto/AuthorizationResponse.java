package com.uriel.task_manager.dto;

import java.util.Objects;

public class AuthorizationResponse extends BaseResponse {

    private boolean authenticated;
    private UserResponse user;
    private String message;

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        AuthorizationResponse that = (AuthorizationResponse) o;
        return authenticated == that.authenticated &&
                Objects.equals(user, that.user) &&
                Objects.equals(message, that.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), authenticated, user, message);
    }

}