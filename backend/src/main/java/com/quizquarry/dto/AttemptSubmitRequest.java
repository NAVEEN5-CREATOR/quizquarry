package com.quizquarry.dto;

import java.util.HashMap;
import java.util.Map;

public class AttemptSubmitRequest {

    // Map of BankQuestion ID -> Selected Option String
    private Map<Long, String> answers = new HashMap<>();

    public AttemptSubmitRequest() {}

    public AttemptSubmitRequest(Map<Long, String> answers) {
        this.answers = answers;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}
