package com.quizquarry.service;

import com.quizquarry.dto.BankQuestionDto;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.exception.ResourceNotFoundException;
import com.quizquarry.model.BankQuestion;
import com.quizquarry.model.QuestionBank;
import com.quizquarry.repository.BankQuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BankQuestionService {

    private final BankQuestionRepository bankQuestionRepository;
    private final QuestionBankService questionBankService;

    public BankQuestionService(BankQuestionRepository bankQuestionRepository,
                               QuestionBankService questionBankService) {
        this.bankQuestionRepository = bankQuestionRepository;
        this.questionBankService = questionBankService;
    }

    public List<BankQuestionDto> getQuestionsByBankId(Long bankId) {
        return bankQuestionRepository.findByQuestionBankId(bankId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BankQuestionDto getQuestionById(Long id) {
        BankQuestion question = bankQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return toDto(question);
    }

    public BankQuestion getEntityById(Long id) {
        return bankQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    @Transactional
    public BankQuestionDto createQuestion(BankQuestionDto dto) {
        QuestionBank bank = questionBankService.getBankEntityById(dto.getQuestionBankId());

        validateQuestionDto(dto);

        BankQuestion question = new BankQuestion(
                bank,
                dto.getQuestionText().trim(),
                dto.getOptions(),
                dto.getCorrectAnswer().trim(),
                dto.getExplanation().trim(),
                dto.getDifficultyLevel(),
                dto.getIsAiGenerated() != null ? dto.getIsAiGenerated() : false
        );

        BankQuestion saved = bankQuestionRepository.save(question);
        return toDto(saved);
    }

    @Transactional
    public BankQuestionDto updateQuestion(Long id, BankQuestionDto dto) {
        BankQuestion question = getEntityById(id);
        validateQuestionDto(dto);

        question.setQuestionText(dto.getQuestionText().trim());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer().trim());
        question.setExplanation(dto.getExplanation().trim());
        if (dto.getDifficultyLevel() != null) {
            question.setDifficultyLevel(dto.getDifficultyLevel());
        }

        BankQuestion updated = bankQuestionRepository.save(question);
        return toDto(updated);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        BankQuestion question = getEntityById(id);
        bankQuestionRepository.delete(question);
    }

    public Map<String, Object> getQuestionExplanation(Long id) {
        BankQuestion question = getEntityById(id);
        Map<String, Object> map = new HashMap<>();
        map.put("questionId", question.getId());
        map.put("questionText", question.getQuestionText());
        map.put("correctAnswer", question.getCorrectAnswer());
        map.put("explanation", question.getExplanation());
        return map;
    }

    private void validateQuestionDto(BankQuestionDto dto) {
        if (dto.getOptions() == null || dto.getOptions().size() < 2) {
            throw new BadRequestException("A question must have at least 2 options");
        }
        boolean answerInOptions = dto.getOptions().stream()
                .anyMatch(opt -> opt.trim().equalsIgnoreCase(dto.getCorrectAnswer().trim()));
        if (!answerInOptions) {
            throw new BadRequestException("Correct answer must match one of the available options");
        }
    }

    public BankQuestionDto toDto(BankQuestion q) {
        BankQuestionDto dto = new BankQuestionDto();
        dto.setId(q.getId());
        dto.setQuestionBankId(q.getQuestionBank().getId());
        dto.setQuestionText(q.getQuestionText());
        dto.setOptions(q.getOptions());
        dto.setCorrectAnswer(q.getCorrectAnswer());
        dto.setExplanation(q.getExplanation());
        dto.setDifficultyLevel(q.getDifficultyLevel());
        dto.setIsAiGenerated(q.getIsAiGenerated());
        dto.setCreatedAt(q.getCreatedAt());
        return dto;
    }
}
