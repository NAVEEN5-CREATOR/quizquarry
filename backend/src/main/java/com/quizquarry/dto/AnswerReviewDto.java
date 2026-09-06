package com.quizquarry.dto;

import com.quizquarry.model.DifficultyLevel;
import java.util.List;

public class AnswerReviewDto {

    private Long questionId;
    private String questionText;
    private List<String> options;
    private String selectedOption;
    private String correctAnswer;
    private Boolean isCorrect;
    private String explanation;
    private DifficultyLevel difficultyLevel;

    public AnswerReviewDto() {}

    public AnswerReviewDto(Long questionId, String questionText, List<String> options,
                           String selectedOption, String correctAnswer, Boolean isCorrect,
                           String explanation, DifficultyLevel difficultyLevel) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.options = options;
        this.selectedOption = selectedOption;
        this.correctAnswer = correctAnswer;
        this.isCorrect = isCorrect;
        this.explanation = explanation;
        this.difficultyLevel = difficultyLevel;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
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

    public String getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(String selectedOption) {
        this.selectedOption = selectedOption;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
}
