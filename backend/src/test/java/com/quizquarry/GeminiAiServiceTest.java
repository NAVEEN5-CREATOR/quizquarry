package com.quizquarry;

import com.quizquarry.dto.AiGenerateRequest;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.model.*;
import com.quizquarry.repository.BankQuestionRepository;
import com.quizquarry.repository.QuestionBankRepository;
import com.quizquarry.repository.SystemUserRepository;
import com.quizquarry.service.BankQuestionService;
import com.quizquarry.service.GeminiAiService;
import com.quizquarry.service.QuestionBankService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class GeminiAiServiceTest {

    @Autowired
    private BankQuestionRepository bankQuestionRepository;

    @Autowired
    private QuestionBankRepository bankRepository;

    @Autowired
    private com.quizquarry.repository.QuizAssessmentRepository quizRepository;

    @Autowired
    private com.quizquarry.repository.StudentAttemptRepository attemptRepository;

    @Autowired
    private com.quizquarry.repository.AttemptAnswerRepository answerRepository;

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private QuestionBankService questionBankService;

    @Autowired
    private BankQuestionService bankQuestionService;

    private QuestionBank testBank;

    @BeforeEach
    void setUp() {
        answerRepository.deleteAll();
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        bankQuestionRepository.deleteAll();
        bankRepository.deleteAll();
        userRepository.deleteAll();

        SystemUser instructor = userRepository.save(new SystemUser("Prof AI", "profai@test.com", "hash", Role.INSTRUCTOR));
        testBank = bankRepository.save(new QuestionBank("AI Test Bank", "CS", instructor));
    }

    @Test
    @DisplayName("Should fail with clear message when GEMINI_API_KEY is missing")
    void testMissingApiKeyValidation() {
        GeminiAiService serviceWithoutKey = new GeminiAiService(bankQuestionRepository, questionBankService, bankQuestionService);
        // By default without env/prop set, resolveApiKey returns null

        AiGenerateRequest req = new AiGenerateRequest(testBank.getId(), "Spring Boot", DifficultyLevel.MEDIUM, 3);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            serviceWithoutKey.generateAndSaveQuestions(req);
        });

        assertEquals("GEMINI_API_KEY environment variable is not set. Please set GEMINI_API_KEY before generating questions.", ex.getMessage());
    }

    @Test
    @DisplayName("Should parse and validate AI JSON with markdown backticks and mark isAiGenerated=true")
    void testParseAndValidateAiResponseWithMarkdown() {
        GeminiAiService service = new GeminiAiService(bankQuestionRepository, questionBankService, bankQuestionService);

        String mockAiResponse = "```json\n" +
                "[\n" +
                "  {\n" +
                "    \"questionText\": \"What annotation in Spring creates a singleton bean by default?\",\n" +
                "    \"options\": [\"@Component\", \"@Scope(\\\"prototype\\\")\", \"@Transient\", \"@Volatile\"],\n" +
                "    \"correctAnswer\": \"@Component\",\n" +
                "    \"explanation\": \"In Spring, beans registered with @Component are singletons by default.\",\n" +
                "    \"difficultyLevel\": \"EASY\"\n" +
                "  }\n" +
                "]\n" +
                "```";

        List<BankQuestion> questions = service.parseAndValidateQuestions(mockAiResponse, testBank, DifficultyLevel.EASY);

        assertEquals(1, questions.size());
        BankQuestion q = questions.get(0);
        assertEquals("What annotation in Spring creates a singleton bean by default?", q.getQuestionText());
        assertEquals("@Component", q.getCorrectAnswer());
        assertTrue(q.getIsAiGenerated(), "AI created question must have isAiGenerated = true");
        assertEquals(DifficultyLevel.EASY, q.getDifficultyLevel());
        assertEquals(4, q.getOptions().size());
    }

    @Test
    @DisplayName("Should fail validation if correctAnswer does not match options")
    void testInvalidAiAnswerMismatch() {
        GeminiAiService service = new GeminiAiService(bankQuestionRepository, questionBankService, bankQuestionService);

        String invalidAiResponse = "[\n" +
                "  {\n" +
                "    \"questionText\": \"Which layer handles persistence?\",\n" +
                "    \"options\": [\"Controller\", \"View\", \"Service\"],\n" +
                "    \"correctAnswer\": \"Repository\",\n" +
                "    \"explanation\": \"Repository handles persistence.\"\n" +
                "  }\n" +
                "]";

        assertThrows(BadRequestException.class, () -> {
            service.parseAndValidateQuestions(invalidAiResponse, testBank, DifficultyLevel.MEDIUM);
        });
    }
}
