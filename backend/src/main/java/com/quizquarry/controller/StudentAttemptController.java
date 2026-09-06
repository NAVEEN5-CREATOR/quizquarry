package com.quizquarry.controller;

import com.quizquarry.dto.*;
import com.quizquarry.model.SystemUser;
import com.quizquarry.service.AuthService;
import com.quizquarry.service.StudentAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attempts")
@Tag(name = "Student Attempts & Analytics", description = "Endpoints for starting, taking, submitting assessments, score calculations, leaderboard, and reporting")
public class StudentAttemptController {

    private final StudentAttemptService studentAttemptService;
    private final AuthService authService;

    public StudentAttemptController(StudentAttemptService studentAttemptService, AuthService authService) {
        this.studentAttemptService = studentAttemptService;
        this.authService = authService;
    }

    @PostMapping("/start/{quizId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start a new quiz attempt (Student only; max 3 attempts; questions allocated check)")
    public ResponseEntity<AttemptStartResponse> startAttempt(@PathVariable Long quizId,
                                                             Authentication authentication) {
        SystemUser student = authService.getUserByEmail(authentication.getName());
        AttemptStartResponse response = studentAttemptService.startAttempt(quizId, student);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit answers for scoring and completion (Student only)")
    public ResponseEntity<AttemptResultDto> submitAttempt(@PathVariable Long id,
                                                          @RequestBody AttemptSubmitRequest request,
                                                          Authentication authentication) {
        SystemUser student = authService.getUserByEmail(authentication.getName());
        AttemptResultDto result = studentAttemptService.submitAttempt(id, request, student);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get active attempt metadata and remaining countdown time")
    public ResponseEntity<Map<String, Object>> getAttempt(@PathVariable Long id,
                                                          Authentication authentication) {
        SystemUser user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(studentAttemptService.getAttemptInfo(id, user));
    }

    @GetMapping("/results/{id}")
    @Operation(summary = "Get detailed results, score percentage, and question-by-question review with explanations")
    public ResponseEntity<AttemptResultDto> getAttemptResults(@PathVariable Long id,
                                                              Authentication authentication) {
        SystemUser user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(studentAttemptService.getAttemptResult(id, user));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top student scores and rankings")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(@RequestParam(required = false) Long quizId) {
        return ResponseEntity.ok(studentAttemptService.getLeaderboard(quizId));
    }

    @GetMapping("/instructor-report")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Get comprehensive quiz and student performance report (Instructor only)")
    public ResponseEntity<InstructorReportDto> getInstructorReport(Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(studentAttemptService.getInstructorReport(instructor));
    }

    @GetMapping("/submission-stats")
    @Operation(summary = "Get global assessment submission statistics and activity")
    public ResponseEntity<SubmissionStatsDto> getSubmissionStats() {
        return ResponseEntity.ok(studentAttemptService.getSubmissionStats());
    }
}
