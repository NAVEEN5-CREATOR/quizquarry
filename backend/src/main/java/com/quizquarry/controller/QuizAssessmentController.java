package com.quizquarry.controller;

import com.quizquarry.dto.QuizAssessmentDto;
import com.quizquarry.model.SystemUser;
import com.quizquarry.service.AuthService;
import com.quizquarry.service.QuizAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@Tag(name = "Quiz Assessments", description = "CRUD and publishing operations for quizzes")
public class QuizAssessmentController {

    private final QuizAssessmentService quizAssessmentService;
    private final AuthService authService;

    public QuizAssessmentController(QuizAssessmentService quizAssessmentService, AuthService authService) {
        this.quizAssessmentService = quizAssessmentService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List quizzes (instructors see all their quizzes; students see PUBLISHED quizzes)")
    public ResponseEntity<List<QuizAssessmentDto>> getAllQuizzes(Authentication authentication) {
        SystemUser user = authentication != null ? authService.getUserByEmail(authentication.getName()) : null;
        return ResponseEntity.ok(quizAssessmentService.getAllQuizzes(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific quiz assessment by ID")
    public ResponseEntity<QuizAssessmentDto> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizAssessmentService.getQuizDtoById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a new quiz assessment (Instructor only)")
    public ResponseEntity<QuizAssessmentDto> createQuiz(@Valid @RequestBody QuizAssessmentDto dto,
                                                        Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        QuizAssessmentDto created = quizAssessmentService.createQuiz(dto, instructor);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Update an existing quiz assessment (Instructor only)")
    public ResponseEntity<QuizAssessmentDto> updateQuiz(@PathVariable Long id,
                                                        @Valid @RequestBody QuizAssessmentDto dto,
                                                        Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(quizAssessmentService.updateQuiz(id, dto, instructor));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Publish a quiz assessment for student taking (Instructor only)")
    public ResponseEntity<QuizAssessmentDto> publishQuiz(@PathVariable Long id,
                                                         Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(quizAssessmentService.publishQuiz(id, instructor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete a quiz assessment (Instructor only)")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id, Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        quizAssessmentService.deleteQuiz(id, instructor);
        return ResponseEntity.noContent().build();
    }
}
