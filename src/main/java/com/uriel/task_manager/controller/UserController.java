package com.uriel.task_manager.controller;

import com.uriel.task_manager.dto.UserListResponse;
import com.uriel.task_manager.dto.UserResponse;
import com.uriel.task_manager.entity.User;
import com.uriel.task_manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserListResponse> getAllUsers() {
        List<User> users = userService.getAllUsers();

        UserListResponse response = new UserListResponse();
        response.setUsers(users.stream().map(this::mapToUserResponse).toList());
        response.setApiStatus("SUCCESS");

        return ResponseEntity.ok(response);
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