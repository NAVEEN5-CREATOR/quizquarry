package com.quizquarry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizquarry.config.JwtTokenProvider;
import com.quizquarry.dto.QuestionBankDto;
import com.quizquarry.model.Role;
import com.quizquarry.model.SystemUser;
import com.quizquarry.repository.SystemUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
public class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private com.quizquarry.repository.QuestionBankRepository bankRepository;

    @Autowired
    private com.quizquarry.repository.BankQuestionRepository questionRepository;

    @Autowired
    private com.quizquarry.repository.QuizAssessmentRepository quizRepository;

    @Autowired
    private com.quizquarry.repository.StudentAttemptRepository attemptRepository;

    @Autowired
    private com.quizquarry.repository.AttemptAnswerRepository answerRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String studentToken;
    private String instructorToken;

    @BeforeEach
    void setUp() {
        answerRepository.deleteAll();
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        questionRepository.deleteAll();
        bankRepository.deleteAll();
        userRepository.deleteAll();

        SystemUser student = userRepository.save(new SystemUser("Student Bob", "bob@student.com", "pass", Role.STUDENT));
        SystemUser instructor = userRepository.save(new SystemUser("Prof Alice", "alice@instructor.com", "pass", Role.INSTRUCTOR));

        studentToken = tokenProvider.generateToken(student.getId(), student.getEmail(), student.getFullName(), student.getRole());
        instructorToken = tokenProvider.generateToken(instructor.getId(), instructor.getEmail(), instructor.getFullName(), instructor.getRole());
    }

    @Test
    @DisplayName("Should block unauthenticated access to create question bank")
    void testUnauthenticatedBankCreation() throws Exception {
        QuestionBankDto dto = new QuestionBankDto();
        dto.setTitle("Test Bank");
        dto.setSubjectArea("Math");

        mockMvc.perform(post("/api/banks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should forbid student from creating question bank (Instructor only)")
    void testStudentForbiddenFromCreatingBank() throws Exception {
        QuestionBankDto dto = new QuestionBankDto();
        dto.setTitle("Test Bank");
        dto.setSubjectArea("Math");

        mockMvc.perform(post("/api/banks")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should permit instructor to create question bank")
    void testInstructorAllowedToCreateBank() throws Exception {
        QuestionBankDto dto = new QuestionBankDto();
        dto.setTitle("Instructor Bank");
        dto.setSubjectArea("Biology");

        mockMvc.perform(post("/api/banks")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Should forbid instructor from starting student attempt")
    void testInstructorForbiddenFromStartingAttempt() throws Exception {
        mockMvc.perform(post("/api/attempts/start/1")
                        .header("Authorization", "Bearer " + instructorToken))
                .andExpect(status().isForbidden());
    }
}
