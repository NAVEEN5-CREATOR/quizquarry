package com.quizquarry;

import com.quizquarry.dto.AttemptResultDto;
import com.quizquarry.dto.AttemptStartResponse;
import com.quizquarry.dto.AttemptSubmitRequest;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.model.*;
import com.quizquarry.repository.*;
import com.quizquarry.service.StudentAttemptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class QuizTakingLogicTest {

    @Autowired
    private StudentAttemptService studentAttemptService;

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private QuestionBankRepository bankRepository;

    @Autowired
    private BankQuestionRepository questionRepository;

    @Autowired
    private QuizAssessmentRepository quizRepository;

    @Autowired
    private StudentAttemptRepository attemptRepository;

    @Autowired
    private AttemptAnswerRepository answerRepository;

    private SystemUser instructor;
    private SystemUser student;
    private QuestionBank bankWithQuestions;
    private QuestionBank emptyBank;
    private QuizAssessment readyQuiz;
    private QuizAssessment emptyQuiz;
    private BankQuestion q1;
    private BankQuestion q2;

    @BeforeEach
    void setUp() {
        answerRepository.deleteAll();
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        questionRepository.deleteAll();
        bankRepository.deleteAll();
        userRepository.deleteAll();

        instructor = userRepository.save(new SystemUser("Prof Smith", "prof@test.com", "hash", Role.INSTRUCTOR));
        student = userRepository.save(new SystemUser("John Doe", "john@test.com", "hash", Role.STUDENT));

        // Question Bank with 2 questions
        bankWithQuestions = bankRepository.save(new QuestionBank("Java Fundamentals", "CS", instructor));
        q1 = questionRepository.save(new BankQuestion(
                bankWithQuestions,
                "What is the size of int in Java?",
                Arrays.asList("16-bit", "32-bit", "64-bit", "8-bit"),
                "32-bit",
                "int in Java is primitive 32-bit signed integer",
                DifficultyLevel.EASY,
                false
        ));
        q2 = questionRepository.save(new BankQuestion(
                bankWithQuestions,
                "Which keyword prevents method overriding?",
                Arrays.asList("static", "abstract", "final", "synchronized"),
                "final",
                "final methods cannot be overridden by subclasses",
                DifficultyLevel.EASY,
                false
        ));

        // Empty question bank
        emptyBank = bankRepository.save(new QuestionBank("Empty Bank", "CS", instructor));

        readyQuiz = quizRepository.save(new QuizAssessment(
                bankWithQuestions, instructor, "Java Quiz 101", 10, QuizStatus.PUBLISHED
        ));

        emptyQuiz = quizRepository.save(new QuizAssessment(
                emptyBank, instructor, "Unallocated Quiz", 10, QuizStatus.PUBLISHED
        ));
    }

    @Test
    @DisplayName("Should reject starting quiz if no questions are allocated with exact message")
    void testStartQuizNoQuestionsAllocated() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            studentAttemptService.startAttempt(emptyQuiz.getId(), student);
        });
        assertEquals("Questions not allocated for this quiz yet.", ex.getMessage());
    }

    @Test
    @DisplayName("Should enforce maximum 3 attempts per student per quiz with exact message")
    void testEnforceMaxThreeAttempts() {
        // Attempt 1
        AttemptStartResponse a1 = studentAttemptService.startAttempt(readyQuiz.getId(), student);
        assertEquals(1, a1.getAttemptNumber());

        // Attempt 2
        AttemptStartResponse a2 = studentAttemptService.startAttempt(readyQuiz.getId(), student);
        assertEquals(2, a2.getAttemptNumber());

        // Attempt 3
        AttemptStartResponse a3 = studentAttemptService.startAttempt(readyQuiz.getId(), student);
        assertEquals(3, a3.getAttemptNumber());

        // Attempt 4 should be rejected
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            studentAttemptService.startAttempt(readyQuiz.getId(), student);
        });
        assertEquals("Maximum 3 attempts allowed.", ex.getMessage());
    }

    @Test
    @DisplayName("Should accurately calculate score percentage on submission")
    void testScoreCalculation() {
        AttemptStartResponse attemptStart = studentAttemptService.startAttempt(readyQuiz.getId(), student);

        // Submit 1 correct answer, 1 incorrect answer -> score should be 50.0%
        Map<Long, String> answers = new HashMap<>();
        answers.put(q1.getId(), "32-bit"); // correct
        answers.put(q2.getId(), "static"); // incorrect

        AttemptSubmitRequest submitReq = new AttemptSubmitRequest(answers);
        AttemptResultDto result = studentAttemptService.submitAttempt(attemptStart.getAttemptId(), submitReq, student);

        assertEquals(50.0, result.getScore());
        assertEquals(1, result.getCorrectCount());
        assertEquals(2, result.getTotalQuestions());
        assertEquals(AttemptStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getSubmittedAt());
        assertEquals(2, result.getAnswers().size());
    }

    @Test
    @DisplayName("Should award 100% when all answers match")
    void testPerfectScoreCalculation() {
        AttemptStartResponse attemptStart = studentAttemptService.startAttempt(readyQuiz.getId(), student);

        Map<Long, String> answers = new HashMap<>();
        answers.put(q1.getId(), "32-bit"); // correct
        answers.put(q2.getId(), "final");  // correct

        AttemptSubmitRequest submitReq = new AttemptSubmitRequest(answers);
        AttemptResultDto result = studentAttemptService.submitAttempt(attemptStart.getAttemptId(), submitReq, student);

        assertEquals(100.0, result.getScore());
        assertEquals(2, result.getCorrectCount());
        assertEquals(2, result.getTotalQuestions());
        assertEquals(AttemptStatus.COMPLETED, result.getStatus());
    }
}
