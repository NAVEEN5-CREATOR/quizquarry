package com.quizquarry.dto;

import java.time.LocalDateTime;

public class LeaderboardEntryDto {

    private Long attemptId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long quizId;
    private String quizTitle;
    private Double score;
    private Integer attemptNumber;
    private LocalDateTime submittedAt;

    public LeaderboardEntryDto() {}

    public LeaderboardEntryDto(Long attemptId, Long studentId, String studentName, String studentEmail,
                               Long quizId, String quizTitle, Double score, Integer attemptNumber,
                               LocalDateTime submittedAt) {
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.score = score;
        this.attemptNumber = attemptNumber;
        this.submittedAt = submittedAt;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
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

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
