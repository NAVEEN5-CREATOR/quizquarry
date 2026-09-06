package com.quizquarry.dto;

import java.util.List;

public class SubmissionStatsDto {

    private long totalAttempts;
    private long completedAttempts;
    private Double averageScore;
    private List<LeaderboardEntryDto> recentSubmissions;

    public SubmissionStatsDto() {}

    public SubmissionStatsDto(long totalAttempts, long completedAttempts, Double averageScore,
                              List<LeaderboardEntryDto> recentSubmissions) {
        this.totalAttempts = totalAttempts;
        this.completedAttempts = completedAttempts;
        this.averageScore = averageScore;
        this.recentSubmissions = recentSubmissions;
    }

    public long getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public long getCompletedAttempts() {
        return completedAttempts;
    }

    public void setCompletedAttempts(long completedAttempts) {
        this.completedAttempts = completedAttempts;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public List<LeaderboardEntryDto> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<LeaderboardEntryDto> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
