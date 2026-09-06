package com.quizquarry.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "attempt_answers")
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_attempt_id", nullable = false)
    private StudentAttempt studentAttempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bank_question_id", nullable = false)
    private BankQuestion bankQuestion;

    @Column(name = "selected_option")
    private String selectedOption;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    public AttemptAnswer() {
    }

    public AttemptAnswer(StudentAttempt studentAttempt, BankQuestion bankQuestion,
                         String selectedOption, Boolean isCorrect) {
        this.studentAttempt = studentAttempt;
        this.bankQuestion = bankQuestion;
        this.selectedOption = selectedOption;
        this.isCorrect = isCorrect;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentAttempt getStudentAttempt() {
        return studentAttempt;
    }

    public void setStudentAttempt(StudentAttempt studentAttempt) {
        this.studentAttempt = studentAttempt;
    }

    public BankQuestion getBankQuestion() {
        return bankQuestion;
    }

    public void setBankQuestion(BankQuestion bankQuestion) {
        this.bankQuestion = bankQuestion;
    }

    public String getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(String selectedOption) {
        this.selectedOption = selectedOption;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
