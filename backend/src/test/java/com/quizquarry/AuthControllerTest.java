package com.quizquarry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizquarry.dto.AuthRequest;
import com.quizquarry.dto.RegisterRequest;
import com.quizquarry.model.Role;
import com.quizquarry.repository.SystemUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
public class AuthControllerTest {

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
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        answerRepository.deleteAll();
        attemptRepository.deleteAll();
        quizRepository.deleteAll();
        questionRepository.deleteAll();
        bankRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully register a new user and return JWT token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Test Instructor", "instructor@test.com", "Password123!", Role.INSTRUCTOR);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("instructor@test.com")))
                .andExpect(jsonPath("$.role", is("INSTRUCTOR")));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request1 = new RegisterRequest("First User", "duplicate@test.com", "Password123!", Role.STUDENT);
        RegisterRequest request2 = new RegisterRequest("Second User", "duplicate@test.com", "AnotherPassword123!", Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Should authenticate valid user and return JWT token")
    void testLoginSuccess() throws Exception {
        RegisterRequest reg = new RegisterRequest("Login User", "login@test.com", "SecretPass123!", Role.STUDENT);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        AuthRequest auth = new AuthRequest("login@test.com", "SecretPass123!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("login@test.com")));
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginInvalidPassword() throws Exception {
        RegisterRequest reg = new RegisterRequest("Login User", "user@test.com", "SecretPass123!", Role.STUDENT);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        AuthRequest auth = new AuthRequest("user@test.com", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(auth)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should get current user profile with valid JWT")
    void testGetCurrentUserWithJwt() throws Exception {
        RegisterRequest reg = new RegisterRequest("Token User", "jwt@test.com", "SecretPass123!", Role.INSTRUCTOR);
        String responseContent = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(responseContent).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("jwt@test.com")))
                .andExpect(jsonPath("$.role", is("INSTRUCTOR")));
    }
}
