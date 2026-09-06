package com.quizquarry.service;

import com.quizquarry.dto.*;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.exception.ResourceNotFoundException;
import com.quizquarry.exception.UnauthorizedException;
import com.quizquarry.model.*;
import com.quizquarry.repository.AttemptAnswerRepository;
import com.quizquarry.repository.BankQuestionRepository;
import com.quizquarry.repository.QuizAssessmentRepository;
import com.quizquarry.repository.StudentAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentAttemptService {

    private final StudentAttemptRepository studentAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuizAssessmentRepository quizAssessmentRepository;
    private final BankQuestionRepository bankQuestionRepository;

    public StudentAttemptService(StudentAttemptRepository studentAttemptRepository,
                                 AttemptAnswerRepository attemptAnswerRepository,
                                 QuizAssessmentRepository quizAssessmentRepository,
                                 BankQuestionRepository bankQuestionRepository) {
        this.studentAttemptRepository = studentAttemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.quizAssessmentRepository = quizAssessmentRepository;
        this.bankQuestionRepository = bankQuestionRepository;
    }

    @Transactional
    public AttemptStartResponse startAttempt(Long quizId, SystemUser student) {
        QuizAssessment quiz = quizAssessmentRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new BadRequestException("This quiz is not currently available for taking.");
        }

        // Rule: Reject start if no questions are allocated
        List<BankQuestion> questions = bankQuestionRepository.findByQuestionBankId(quiz.getQuestionBank().getId());
        if (questions == null || questions.isEmpty()) {
            throw new BadRequestException("Questions not allocated for this quiz yet.");
        }

        // Rule: Max 3 attempts per student per quiz
        long existingAttempts = studentAttemptRepository.countByStudentIdAndQuizAssessmentId(student.getId(), quizId);
        if (existingAttempts >= 3) {
            throw new BadRequestException("Maximum 3 attempts allowed.");
        }

        StudentAttempt attempt = new StudentAttempt(quiz, student, (int) existingAttempts + 1);
        StudentAttempt saved = studentAttemptRepository.save(attempt);

        // Sanitize questions so options and question texts are returned, but NOT correctAnswer/explanation
        List<QuizQuestionDto> sanitizedQuestions = questions.stream().map(q -> new QuizQuestionDto(
                q.getId(),
                q.getQuestionText(),
                q.getOptions(),
                q.getDifficultyLevel()
        )).collect(Collectors.toList());

        return new AttemptStartResponse(
                saved.getId(),
                quiz.getId(),
                quiz.getTitle(),
                quiz.getTimeLimitMinutes(),
                saved.getAttemptNumber(),
                saved.getStartedAt(),
                sanitizedQuestions
        );
    }

    @Transactional
    public AttemptResultDto submitAttempt(Long attemptId, AttemptSubmitRequest request, SystemUser student) {
        StudentAttempt attempt = studentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to submit this attempt");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt has already been submitted or completed");
        }

        // Server-side validation of attempt duration
        LocalDateTime now = LocalDateTime.now();
        long elapsedSeconds = Duration.between(attempt.getStartedAt(), now).getSeconds();
        int allowedMinutes = attempt.getQuizAssessment().getTimeLimitMinutes();
        // Allow 120s buffer for network transmission
        boolean isTimedOut = elapsedSeconds > (allowedMinutes * 60L + 120);

        List<BankQuestion> questions = bankQuestionRepository.findByQuestionBankId(attempt.getQuizAssessment().getQuestionBank().getId());
        int totalQuestions = questions.size();
        int correctCount = 0;

        Map<Long, String> submittedAnswers = (request != null && request.getAnswers() != null)
                ? request.getAnswers()
                : Collections.emptyMap();

        List<AttemptAnswer> answersToSave = new ArrayList<>();
        List<AnswerReviewDto> reviewList = new ArrayList<>();

        for (BankQuestion question : questions) {
            String selectedOption = submittedAnswers.get(question.getId());
            boolean isCorrect = selectedOption != null &&
                    selectedOption.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());

            if (isCorrect) {
                correctCount++;
            }

            AttemptAnswer answer = new AttemptAnswer(attempt, question, selectedOption, isCorrect);
            answersToSave.add(answer);

            reviewList.add(new AnswerReviewDto(
                    question.getId(),
                    question.getQuestionText(),
                    question.getOptions(),
                    selectedOption,
                    question.getCorrectAnswer(),
                    isCorrect,
                    question.getExplanation(),
                    question.getDifficultyLevel()
            ));
        }

        attemptAnswerRepository.saveAll(answersToSave);

        // Auto-scoring calculation (percentage)
        double scorePercentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;
        scorePercentage = Math.round(scorePercentage * 100.0) / 100.0;

        attempt.setScore(scorePercentage);
        attempt.setSubmittedAt(now);
        attempt.setStatus(isTimedOut ? AttemptStatus.TIMED_OUT : AttemptStatus.COMPLETED);
        StudentAttempt updated = studentAttemptRepository.save(attempt);

        AttemptResultDto result = new AttemptResultDto();
        result.setAttemptId(updated.getId());
        result.setQuizId(updated.getQuizAssessment().getId());
        result.setQuizTitle(updated.getQuizAssessment().getTitle());
        result.setStudentId(student.getId());
        result.setStudentName(student.getFullName());
        result.setAttemptNumber(updated.getAttemptNumber());
        result.setScore(scorePercentage);
        result.setCorrectCount(correctCount);
        result.setTotalQuestions(totalQuestions);
        result.setStatus(updated.getStatus());
        result.setStartedAt(updated.getStartedAt());
        result.setSubmittedAt(updated.getSubmittedAt());
        result.setTimeSpentSeconds(elapsedSeconds);
        result.setAnswers(reviewList);

        return result;
    }

    public AttemptResultDto getAttemptResult(Long attemptId, SystemUser currentUser) {
        StudentAttempt attempt = studentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        boolean isAttemptOwner = attempt.getStudent().getId().equals(currentUser.getId());
        boolean isQuizInstructor = attempt.getQuizAssessment().getInstructor().getId().equals(currentUser.getId());

        if (!isAttemptOwner && !isQuizInstructor && currentUser.getRole() != Role.INSTRUCTOR) {
            throw new UnauthorizedException("You are not authorized to view this attempt result");
        }

        List<AttemptAnswer> answers = attemptAnswerRepository.findByStudentAttemptId(attempt.getId());
        int correctCount = (int) answers.stream().filter(AttemptAnswer::getIsCorrect).count();
        int totalQuestions = answers.size();

        List<AnswerReviewDto> reviewList = answers.stream().map(a -> new AnswerReviewDto(
                a.getBankQuestion().getId(),
                a.getBankQuestion().getQuestionText(),
                a.getBankQuestion().getOptions(),
                a.getSelectedOption(),
                a.getBankQuestion().getCorrectAnswer(),
                a.getIsCorrect(),
                a.getBankQuestion().getExplanation(),
                a.getBankQuestion().getDifficultyLevel()
        )).collect(Collectors.toList());

        long timeSpent = (attempt.getSubmittedAt() != null && attempt.getStartedAt() != null)
                ? Duration.between(attempt.getStartedAt(), attempt.getSubmittedAt()).getSeconds()
                : 0L;

        AttemptResultDto result = new AttemptResultDto();
        result.setAttemptId(attempt.getId());
        result.setQuizId(attempt.getQuizAssessment().getId());
        result.setQuizTitle(attempt.getQuizAssessment().getTitle());
        result.setStudentId(attempt.getStudent().getId());
        result.setStudentName(attempt.getStudent().getFullName());
        result.setAttemptNumber(attempt.getAttemptNumber());
        result.setScore(attempt.getScore());
        result.setCorrectCount(correctCount);
        result.setTotalQuestions(totalQuestions);
        result.setStatus(attempt.getStatus());
        result.setStartedAt(attempt.getStartedAt());
        result.setSubmittedAt(attempt.getSubmittedAt());
        result.setTimeSpentSeconds(timeSpent);
        result.setAnswers(reviewList);

        return result;
    }

    public Map<String, Object> getAttemptInfo(Long attemptId, SystemUser currentUser) {
        StudentAttempt attempt = studentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getStudent().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.INSTRUCTOR) {
            throw new UnauthorizedException("You are not authorized to view this attempt");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("attemptId", attempt.getId());
        map.put("quizId", attempt.getQuizAssessment().getId());
        map.put("quizTitle", attempt.getQuizAssessment().getTitle());
        map.put("attemptNumber", attempt.getAttemptNumber());
        map.put("status", attempt.getStatus());
        map.put("startedAt", attempt.getStartedAt());
        map.put("submittedAt", attempt.getSubmittedAt());
        map.put("timeLimitMinutes", attempt.getQuizAssessment().getTimeLimitMinutes());

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            long elapsed = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
            long totalAllowed = attempt.getQuizAssessment().getTimeLimitMinutes() * 60L;
            long remaining = Math.max(0, totalAllowed - elapsed);
            map.put("remainingSeconds", remaining);

            List<BankQuestion> questions = bankQuestionRepository.findByQuestionBankId(attempt.getQuizAssessment().getQuestionBank().getId());
            List<QuizQuestionDto> dtos = questions.stream().map(q -> new QuizQuestionDto(
                    q.getId(), q.getQuestionText(), q.getOptions(), q.getDifficultyLevel()
            )).collect(Collectors.toList());
            map.put("questions", dtos);
        }

        return map;
    }

    public List<LeaderboardEntryDto> getLeaderboard(Long quizId) {
        List<StudentAttempt> attempts;
        if (quizId != null && quizId > 0) {
            attempts = studentAttemptRepository.findLeaderboardByQuizId(quizId);
        } else {
            attempts = studentAttemptRepository.findTopLeaderboardAttempts();
        }

        return attempts.stream().limit(50).map(a -> new LeaderboardEntryDto(
                a.getId(),
                a.getStudent().getId(),
                a.getStudent().getFullName(),
                a.getStudent().getEmail(),
                a.getQuizAssessment().getId(),
                a.getQuizAssessment().getTitle(),
                a.getScore(),
                a.getAttemptNumber(),
                a.getSubmittedAt()
        )).collect(Collectors.toList());
    }

    public InstructorReportDto getInstructorReport(SystemUser instructor) {
        List<QuizAssessment> quizzes = quizAssessmentRepository.findByInstructorId(instructor.getId());
        List<StudentAttempt> instructorAttempts = studentAttemptRepository.findAttemptsByInstructorId(instructor.getId());

        InstructorReportDto report = new InstructorReportDto();
        report.setTotalQuizzes(quizzes.size());
        report.setTotalBanks(quizzes.stream().map(q -> q.getQuestionBank().getId()).distinct().count());
        long questionsCount = quizzes.stream().mapToLong(q -> bankQuestionRepository.countByQuestionBankId(q.getQuestionBank().getId())).sum();
        report.setTotalQuestions(questionsCount);
        report.setTotalAttempts(instructorAttempts.size());

        double avg = instructorAttempts.stream()
                .filter(a -> a.getScore() != null)
                .mapToDouble(StudentAttempt::getScore)
                .average()
                .orElse(0.0);
        report.setAverageScore(Math.round(avg * 100.0) / 100.0);

        List<InstructorReportDto.QuizPerformanceDto> perfList = new ArrayList<>();
        for (QuizAssessment quiz : quizzes) {
            List<StudentAttempt> quizAttempts = studentAttemptRepository.findByQuizAssessmentId(quiz.getId());
            double quizAvg = quizAttempts.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(StudentAttempt::getScore)
                    .average()
                    .orElse(0.0);
            double high = quizAttempts.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(StudentAttempt::getScore)
                    .max()
                    .orElse(0.0);
            double low = quizAttempts.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(StudentAttempt::getScore)
                    .min()
                    .orElse(0.0);

            perfList.add(new InstructorReportDto.QuizPerformanceDto(
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getQuestionBank().getTitle(),
                    quizAttempts.size(),
                    Math.round(quizAvg * 100.0) / 100.0,
                    Math.round(high * 100.0) / 100.0,
                    Math.round(low * 100.0) / 100.0
            ));
        }
        report.setQuizPerformance(perfList);

        return report;
    }

    public SubmissionStatsDto getSubmissionStats() {
        long totalAttempts = studentAttemptRepository.count();
        long completed = studentAttemptRepository.countByStatus(AttemptStatus.COMPLETED);
        Double avg = studentAttemptRepository.getGlobalAverageScore();
        double roundedAvg = avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;

        List<StudentAttempt> recent = studentAttemptRepository.findTopLeaderboardAttempts();
        List<LeaderboardEntryDto> recentDtos = recent.stream().limit(5).map(a -> new LeaderboardEntryDto(
                a.getId(),
                a.getStudent().getId(),
                a.getStudent().getFullName(),
                a.getStudent().getEmail(),
                a.getQuizAssessment().getId(),
                a.getQuizAssessment().getTitle(),
                a.getScore(),
                a.getAttemptNumber(),
                a.getSubmittedAt()
        )).collect(Collectors.toList());

        return new SubmissionStatsDto(totalAttempts, completed, roundedAvg, recentDtos);
    }
}
