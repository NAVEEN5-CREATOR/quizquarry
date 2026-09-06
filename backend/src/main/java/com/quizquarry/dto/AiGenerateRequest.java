package com.quizquarry.dto;

import com.quizquarry.model.DifficultyLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AiGenerateRequest {

    @NotNull(message = "Question bank ID is required")
    private Long questionBankId;

    @NotBlank(message = "Topic is required")
    private String topic;

    private DifficultyLevel difficultyLevel = DifficultyLevel.MEDIUM;

    @Min(value = 1, message = "Count must be at least 1")
    @Max(value = 10, message = "Maximum 10 questions can be generated per request")
    private int count = 3;

    public AiGenerateRequest() {}

    public AiGenerateRequest(Long questionBankId, String topic, DifficultyLevel difficultyLevel, int count) {
        this.questionBankId = questionBankId;
        this.topic = topic;
        this.difficultyLevel = difficultyLevel;
        this.count = count;
    }

    public Long getQuestionBankId() {
        return questionBankId;
    }

    public void setQuestionBankId(Long questionBankId) {
        this.questionBankId = questionBankId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
