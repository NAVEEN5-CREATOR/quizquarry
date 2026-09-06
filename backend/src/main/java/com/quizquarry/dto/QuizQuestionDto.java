package com.quizquarry.dto;

import com.quizquarry.model.DifficultyLevel;
import java.util.List;

public class QuizQuestionDto {
    private Long id;
    private String questionText;
    private List<String> options;
    private DifficultyLevel difficultyLevel;

    public QuizQuestionDto() {}

    public QuizQuestionDto(Long id, String questionText, List<String> options, DifficultyLevel difficultyLevel) {
        this.id = id;
        this.questionText = questionText;
        this.options = options;
        this.difficultyLevel = difficultyLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
}
