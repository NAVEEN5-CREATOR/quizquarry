package com.quizquarry.controller;

import com.quizquarry.dto.QuestionBankDto;
import com.quizquarry.model.SystemUser;
import com.quizquarry.service.AuthService;
import com.quizquarry.service.QuestionBankService;
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
@RequestMapping("/api/banks")
@Tag(name = "Question Banks", description = "CRUD operations for managing question pools and subject areas")
public class QuestionBankController {

    private final QuestionBankService questionBankService;
    private final AuthService authService;

    public QuestionBankController(QuestionBankService questionBankService, AuthService authService) {
        this.questionBankService = questionBankService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List question banks (instructor views own banks; student views available banks)")
    public ResponseEntity<List<QuestionBankDto>> getAllBanks(Authentication authentication) {
        SystemUser user = authentication != null ? authService.getUserByEmail(authentication.getName()) : null;
        return ResponseEntity.ok(questionBankService.getAllBanks(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific question bank by ID")
    public ResponseEntity<QuestionBankDto> getBankById(@PathVariable Long id) {
        return ResponseEntity.ok(questionBankService.getBankDtoById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a new question bank (Instructor only)")
    public ResponseEntity<QuestionBankDto> createBank(@Valid @RequestBody QuestionBankDto dto,
                                                      Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        QuestionBankDto created = questionBankService.createBank(dto, instructor);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Update an existing question bank (Instructor only)")
    public ResponseEntity<QuestionBankDto> updateBank(@PathVariable Long id,
                                                      @Valid @RequestBody QuestionBankDto dto,
                                                      Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(questionBankService.updateBank(id, dto, instructor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete a question bank (Instructor only)")
    public ResponseEntity<Void> deleteBank(@PathVariable Long id, Authentication authentication) {
        SystemUser instructor = authService.getUserByEmail(authentication.getName());
        questionBankService.deleteBank(id, instructor);
        return ResponseEntity.noContent().build();
    }
}
