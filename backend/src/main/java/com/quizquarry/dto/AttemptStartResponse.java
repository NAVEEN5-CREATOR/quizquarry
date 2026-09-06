package com.quizquarry.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AttemptStartResponse {

    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer timeLimitMinutes;
    private Integer attemptNumber;
    private LocalDateTime startedAt;
    private List<QuizQuestionDto> questions;

    public AttemptStartResponse() {}

    public AttemptStartResponse(Long attemptId, Long quizId, String quizTitle, Integer timeLimitMinutes,
                                Integer attemptNumber, LocalDateTime startedAt, List<QuizQuestionDto> questions) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.timeLimitMinutes = timeLimitMinutes;
        this.attemptNumber = attemptNumber;
        this.startedAt = startedAt;
        this.questions = questions;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }

    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public List<QuizQuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionDto> questions) {
        this.questions = questions;
    }
}
