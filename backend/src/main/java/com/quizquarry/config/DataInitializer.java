package com.quizquarry.config;

import com.quizquarry.model.*;
import com.quizquarry.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final SystemUserRepository userRepository;
    private final QuestionBankRepository bankRepository;
    private final BankQuestionRepository questionRepository;
    private final QuizAssessmentRepository quizRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(SystemUserRepository userRepository,
                           QuestionBankRepository bankRepository,
                           BankQuestionRepository questionRepository,
                           QuizAssessmentRepository quizRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bankRepository = bankRepository;
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized with users.");
            return;
        }

        logger.info("Seeding initial QuizQuarry demo users and assessment data...");

        // Seed Users
        String encodedPass = passwordEncoder.encode("Password123!");
        SystemUser instructor = userRepository.save(new SystemUser(
                "Professor Jane Doe",
                "instructor@quizquarry.com",
                encodedPass,
                Role.INSTRUCTOR
        ));

        SystemUser student = userRepository.save(new SystemUser(
                "Alex Johnson",
                "student@quizquarry.com",
                encodedPass,
                Role.STUDENT
        ));

        // Seed Question Bank
        QuestionBank bank = bankRepository.save(new QuestionBank(
                "Core Java & Distributed Systems",
                "Computer Science",
                instructor
        ));

        // Seed Bank Questions
        questionRepository.save(new BankQuestion(
                bank,
                "Which collection class in Java allows null elements and is not synchronized?",
                Arrays.asList("Vector", "Hashtable", "ArrayList", "ConcurrentHashMap"),
                "ArrayList",
                "ArrayList is unsynchronized and allows storing null values unlike Hashtable and ConcurrentHashMap.",
                DifficultyLevel.EASY,
                false
        ));

        questionRepository.save(new BankQuestion(
                bank,
                "What is the primary benefit of using CompletableFuture in Java?",
                Arrays.asList("Automatic memory deallocation", "Asynchronous non-blocking computation", "Eliminating checked exceptions", "Synchronous thread locking"),
                "Asynchronous non-blocking computation",
                "CompletableFuture enables composable, non-blocking asynchronous programming introduced in Java 8.",
                DifficultyLevel.MEDIUM,
                false
        ));

        questionRepository.save(new BankQuestion(
                bank,
                "In the CAP theorem, what does 'P' stand for?",
                Arrays.asList("Processing power", "Protocol safety", "Partition tolerance", "Periodic sync"),
                "Partition tolerance",
                "Partition tolerance indicates that the system continues to operate despite an arbitrary number of messages being dropped or delayed by the network.",
                DifficultyLevel.EASY,
                false
        ));

        questionRepository.save(new BankQuestion(
                bank,
                "Which garbage collector was introduced in modern OpenJDK designed for ultra-low latency with terabyte heaps?",
                Arrays.asList("Serial GC", "ZGC", "Parallel Old GC", "Mark-Sweep GC"),
                "ZGC",
                "ZGC (Z Garbage Collector) is a scalable low-latency garbage collector capable of handling heaps up to 16TB with sub-millisecond pauses.",
                DifficultyLevel.HARD,
                false
        ));

        // Seed Published Quiz
        quizRepository.save(new QuizAssessment(
                bank,
                instructor,
                "Java & Distributed Systems Mastery Assessment",
                10,
                QuizStatus.PUBLISHED
        ));

        logger.info("QuizQuarry initial demo data successfully seeded!");
    }
}
