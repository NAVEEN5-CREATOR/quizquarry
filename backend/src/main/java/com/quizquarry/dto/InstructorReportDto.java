package com.quizquarry.dto;

import java.util.List;

public class InstructorReportDto {

    private long totalQuizzes;
    private long totalBanks;
    private long totalQuestions;
    private long totalAttempts;
    private Double averageScore;
    private List<QuizPerformanceDto> quizPerformance;

    public InstructorReportDto() {}

    public static class QuizPerformanceDto {
        private Long quizId;
        private String quizTitle;
        private String bankTitle;
        private long attemptsCount;
        private Double avgScore;
        private Double highestScore;
        private Double lowestScore;

        public QuizPerformanceDto() {}

        public QuizPerformanceDto(Long quizId, String quizTitle, String bankTitle, long attemptsCount,
                                  Double avgScore, Double highestScore, Double lowestScore) {
            this.quizId = quizId;
            this.quizTitle = quizTitle;
            this.bankTitle = bankTitle;
            this.attemptsCount = attemptsCount;
            this.avgScore = avgScore;
            this.highestScore = highestScore;
            this.lowestScore = lowestScore;
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

        public String getBankTitle() {
            return bankTitle;
        }

        public void setBankTitle(String bankTitle) {
            this.bankTitle = bankTitle;
        }

        public long getAttemptsCount() {
            return attemptsCount;
        }

        public void setAttemptsCount(long attemptsCount) {
            this.attemptsCount = attemptsCount;
        }

        public Double getAvgScore() {
            return avgScore;
        }

        public void setAvgScore(Double avgScore) {
            this.avgScore = avgScore;
        }

        public Double getHighestScore() {
            return highestScore;
        }

        public void setHighestScore(Double highestScore) {
            this.highestScore = highestScore;
        }

        public Double getLowestScore() {
            return lowestScore;
        }

        public void setLowestScore(Double lowestScore) {
            this.lowestScore = lowestScore;
        }
    }

    public long getTotalQuizzes() {
        return totalQuizzes;
    }

    public void setTotalQuizzes(long totalQuizzes) {
        this.totalQuizzes = totalQuizzes;
    }

    public long getTotalBanks() {
        return totalBanks;
    }

    public void setTotalBanks(long totalBanks) {
        this.totalBanks = totalBanks;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public List<QuizPerformanceDto> getQuizPerformance() {
        return quizPerformance;
    }

    public void setQuizPerformance(List<QuizPerformanceDto> quizPerformance) {
        this.quizPerformance = quizPerformance;
    }
}
