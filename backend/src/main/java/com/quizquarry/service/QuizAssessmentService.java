package com.quizquarry.service;

import com.quizquarry.dto.QuizAssessmentDto;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.exception.ResourceNotFoundException;
import com.quizquarry.exception.UnauthorizedException;
import com.quizquarry.model.QuestionBank;
import com.quizquarry.model.QuizAssessment;
import com.quizquarry.model.QuizStatus;
import com.quizquarry.model.Role;
import com.quizquarry.model.SystemUser;
import com.quizquarry.repository.BankQuestionRepository;
import com.quizquarry.repository.QuizAssessmentRepository;
import com.quizquarry.repository.StudentAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizAssessmentService {

    private final QuizAssessmentRepository quizAssessmentRepository;
    private final QuestionBankService questionBankService;
    private final BankQuestionRepository bankQuestionRepository;
    private final StudentAttemptRepository studentAttemptRepository;

    public QuizAssessmentService(QuizAssessmentRepository quizAssessmentRepository,
                                 QuestionBankService questionBankService,
                                 BankQuestionRepository bankQuestionRepository,
                                 StudentAttemptRepository studentAttemptRepository) {
        this.quizAssessmentRepository = quizAssessmentRepository;
        this.questionBankService = questionBankService;
        this.bankQuestionRepository = bankQuestionRepository;
        this.studentAttemptRepository = studentAttemptRepository;
    }

    public List<QuizAssessmentDto> getAllQuizzes(SystemUser currentUser) {
        List<QuizAssessment> quizzes;
        if (currentUser != null && currentUser.getRole() == Role.INSTRUCTOR) {
            quizzes = quizAssessmentRepository.findByInstructorId(currentUser.getId());
        } else {
            // For students or public view: only PUBLISHED quizzes
            quizzes = quizAssessmentRepository.findByStatus(QuizStatus.PUBLISHED);
        }
        return quizzes.stream().map(this::toDto).collect(Collectors.toList());
    }

    public QuizAssessmentDto getQuizDtoById(Long id) {
        QuizAssessment quiz = quizAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        return toDto(quiz);
    }

    public QuizAssessment getQuizEntityById(Long id) {
        return quizAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
    }

    @Transactional
    public QuizAssessmentDto createQuiz(QuizAssessmentDto dto, SystemUser instructor) {
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new UnauthorizedException("Only instructors can create quizzes");
        }

        QuestionBank bank = questionBankService.getBankEntityById(dto.getQuestionBankId());

        QuizAssessment quiz = new QuizAssessment(
                bank,
                instructor,
                dto.getTitle().trim(),
                dto.getTimeLimitMinutes() != null ? dto.getTimeLimitMinutes() : 15,
                dto.getStatus() != null ? dto.getStatus() : QuizStatus.DRAFT
        );

        QuizAssessment saved = quizAssessmentRepository.save(quiz);
        return toDto(saved);
    }

    @Transactional
    public QuizAssessmentDto updateQuiz(Long id, QuizAssessmentDto dto, SystemUser currentUser) {
        QuizAssessment quiz = getQuizEntityById(id);
        if (currentUser.getRole() != Role.INSTRUCTOR || !quiz.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to edit this quiz");
        }

        if (dto.getQuestionBankId() != null && !dto.getQuestionBankId().equals(quiz.getQuestionBank().getId())) {
            QuestionBank newBank = questionBankService.getBankEntityById(dto.getQuestionBankId());
            quiz.setQuestionBank(newBank);
        }

        quiz.setTitle(dto.getTitle().trim());
        if (dto.getTimeLimitMinutes() != null) {
            quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        }
        if (dto.getStatus() != null) {
            quiz.setStatus(dto.getStatus());
        }

        QuizAssessment updated = quizAssessmentRepository.save(quiz);
        return toDto(updated);
    }

    @Transactional
    public QuizAssessmentDto publishQuiz(Long id, SystemUser currentUser) {
        QuizAssessment quiz = getQuizEntityById(id);
        if (currentUser.getRole() != Role.INSTRUCTOR || !quiz.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to publish this quiz");
        }

        long questionCount = bankQuestionRepository.countByQuestionBankId(quiz.getQuestionBank().getId());
        if (questionCount == 0) {
            throw new BadRequestException("Cannot publish quiz: No questions allocated in this question bank yet.");
        }

        quiz.setStatus(QuizStatus.PUBLISHED);
        return toDto(quizAssessmentRepository.save(quiz));
    }

    @Transactional
    public void deleteQuiz(Long id, SystemUser currentUser) {
        QuizAssessment quiz = getQuizEntityById(id);
        if (currentUser.getRole() != Role.INSTRUCTOR || !quiz.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this quiz");
        }
        quizAssessmentRepository.delete(quiz);
    }

    public QuizAssessmentDto toDto(QuizAssessment quiz) {
        QuizAssessmentDto dto = new QuizAssessmentDto();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        dto.setStatus(quiz.getStatus());
        dto.setCreatedAt(quiz.getCreatedAt());

        if (quiz.getQuestionBank() != null) {
            dto.setQuestionBankId(quiz.getQuestionBank().getId());
            dto.setQuestionBankTitle(quiz.getQuestionBank().getTitle());
            dto.setQuestionCount(bankQuestionRepository.countByQuestionBankId(quiz.getQuestionBank().getId()));
        }

        if (quiz.getInstructor() != null) {
            dto.setInstructorId(quiz.getInstructor().getId());
            dto.setInstructorName(quiz.getInstructor().getFullName());
        }

        dto.setTotalAttempts(studentAttemptRepository.findByQuizAssessmentId(quiz.getId()).size());
        return dto;
    }
}
