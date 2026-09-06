package com.quizquarry;

import com.quizquarry.dto.BankQuestionDto;
import com.quizquarry.dto.QuestionBankDto;
import com.quizquarry.model.DifficultyLevel;
import com.quizquarry.model.Role;
import com.quizquarry.model.SystemUser;
import com.quizquarry.repository.BankQuestionRepository;
import com.quizquarry.repository.QuestionBankRepository;
import com.quizquarry.repository.SystemUserRepository;
import com.quizquarry.service.BankQuestionService;
import com.quizquarry.service.QuestionBankService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class QuestionBankServiceTest {

    @Autowired
    private QuestionBankService questionBankService;

    @Autowired
    private BankQuestionService bankQuestionService;

    @Autowired
    private QuestionBankRepository bankRepository;

    @Autowired
    private BankQuestionRepository questionRepository;

    @Autowired
    private com.quizquarry.repository.QuizAssessmentRepository quizRepository;

    @Autowired
    private com.quizquarry.repository.StudentAttemptRepository attemptRepository;

    @Autowired
    private com.quizquarry.repository.AttemptAnswerRepository answerRepository;

    @Autowired
    private SystemUserRepository userRepository;

    private SystemUser instructor;

    @BeforeEach
    void setUp() {
        answerRepository.deleteAll();
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        questionRepository.deleteAll();
        bankRepository.deleteAll();
        userRepository.deleteAll();

        instructor = userRepository.save(new SystemUser("Prof Turing", "turing@test.com", "pass", Role.INSTRUCTOR));
    }

    @Test
    @DisplayName("Should create question bank and manually add question with options")
    void testCreateBankAndQuestion() {
        QuestionBankDto bankDto = new QuestionBankDto();
        bankDto.setTitle("Algorithms & Complexity");
        bankDto.setSubjectArea("Computer Science");

        QuestionBankDto createdBank = questionBankService.createBank(bankDto, instructor);
        assertNotNull(createdBank.getId());
        assertEquals("Algorithms & Complexity", createdBank.getTitle());

        BankQuestionDto qDto = new BankQuestionDto();
        qDto.setQuestionBankId(createdBank.getId());
        qDto.setQuestionText("What is the average time complexity of QuickSort?");
        qDto.setOptions(Arrays.asList("O(n)", "O(n log n)", "O(n^2)", "O(log n)"));
        qDto.setCorrectAnswer("O(n log n)");
        qDto.setExplanation("QuickSort has an average-case performance of O(n log n) comparisons.");
        qDto.setDifficultyLevel(DifficultyLevel.MEDIUM);

        BankQuestionDto createdQuestion = bankQuestionService.createQuestion(qDto);
        assertNotNull(createdQuestion.getId());
        assertEquals("O(n log n)", createdQuestion.getCorrectAnswer());

        List<BankQuestionDto> questions = bankQuestionService.getQuestionsByBankId(createdBank.getId());
        assertEquals(1, questions.size());
    }
}
