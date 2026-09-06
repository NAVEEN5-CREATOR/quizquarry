package com.quizquarry.controller;

import com.quizquarry.dto.AiGenerateRequest;
import com.quizquarry.dto.BankQuestionDto;
import com.quizquarry.service.BankQuestionService;
import com.quizquarry.service.GeminiAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Questions", description = "Endpoints for managing bank questions, AI question generation, and answer explanations")
public class BankQuestionController {

    private final BankQuestionService bankQuestionService;
    private final GeminiAiService geminiAiService;

    public BankQuestionController(BankQuestionService bankQuestionService,
                                  GeminiAiService geminiAiService) {
        this.bankQuestionService = bankQuestionService;
        this.geminiAiService = geminiAiService;
    }

    @GetMapping
    @Operation(summary = "Get all questions for a given question bank ID")
    public ResponseEntity<List<BankQuestionDto>> getQuestionsByBankId(@RequestParam Long bankId) {
        return ResponseEntity.ok(bankQuestionService.getQuestionsByBankId(bankId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific question by ID")
    public ResponseEntity<BankQuestionDto> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(bankQuestionService.getQuestionById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Manually add a question to a question bank (Instructor only)")
    public ResponseEntity<BankQuestionDto> createQuestion(@Valid @RequestBody BankQuestionDto dto) {
        BankQuestionDto created = bankQuestionService.createQuestion(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Update an existing question (Instructor only)")
    public ResponseEntity<BankQuestionDto> updateQuestion(@PathVariable Long id,
                                                          @Valid @RequestBody BankQuestionDto dto) {
        return ResponseEntity.ok(bankQuestionService.updateQuestion(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete a question (Instructor only)")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        bankQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai-generate")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Generate MCQs using Google Gemini AI and save them to bank (Instructor only)")
    public ResponseEntity<List<BankQuestionDto>> generateQuestionsWithAi(@Valid @RequestBody AiGenerateRequest request) {
        List<BankQuestionDto> generated = geminiAiService.generateAndSaveQuestions(request);
        return new ResponseEntity<>(generated, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/explanation")
    @Operation(summary = "Retrieve detailed explanation and correct answer for a question")
    public ResponseEntity<Map<String, Object>> getQuestionExplanation(@PathVariable Long id) {
        return ResponseEntity.ok(bankQuestionService.getQuestionExplanation(id));
    }
}
