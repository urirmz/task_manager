package com.uriel.task_manager.controller;

import com.uriel.task_manager.dto.AuthorizationResponse;
import com.uriel.task_manager.dto.LoginRequest;
import com.uriel.task_manager.dto.UserResponse;
import com.uriel.task_manager.entity.User;
import com.uriel.task_manager.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Objects;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@RestController
@RequestMapping("/api/authorization")
public class AuthorizationController {

    private static final String SUCCESS = "SUCCESS";

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @Autowired
    public AuthorizationController(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthorizationResponse> login(@RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        HttpSession session = request.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, securityContext);

        User user = userService.findByUsername(loginRequest.getUsername());

        AuthorizationResponse response = new AuthorizationResponse();
        response.setAuthenticated(true);
        response.setUser(mapToUserResponse(user));
        response.setApiStatus(SUCCESS);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthorizationResponse> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        AuthorizationResponse response = new AuthorizationResponse();
        response.setAuthenticated(false);
        response.setMessage("Logged out successfully");
        response.setApiStatus(SUCCESS);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/current")
    public ResponseEntity<AuthorizationResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                Objects.equals(authentication.getPrincipal(), "anonymousUser")) {
            AuthorizationResponse response = new AuthorizationResponse();
            response.setAuthenticated(false);
            response.setApiStatus("ERROR");
            return ResponseEntity.status(401).body(response);
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        AuthorizationResponse response = new AuthorizationResponse();
        response.setAuthenticated(true);
        response.setUser(mapToUserResponse(user));
        response.setApiStatus(SUCCESS);

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