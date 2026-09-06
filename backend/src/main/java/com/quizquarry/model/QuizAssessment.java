package com.quizquarry.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_assessments")
public class QuizAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_bank_id", nullable = false)
    private QuestionBank questionBank;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id", nullable = false)
    private SystemUser instructor;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes = 15;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuizStatus status = QuizStatus.DRAFT;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "quizAssessment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<StudentAttempt> attempts = new ArrayList<>();

    public QuizAssessment() {
    }

    public QuizAssessment(QuestionBank questionBank, SystemUser instructor, String title,
                          Integer timeLimitMinutes, QuizStatus status) {
        this.questionBank = questionBank;
        this.instructor = instructor;
        this.title = title;
        this.timeLimitMinutes = timeLimitMinutes;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuestionBank getQuestionBank() {
        return questionBank;
    }

    public void setQuestionBank(QuestionBank questionBank) {
        this.questionBank = questionBank;
    }

    public SystemUser getInstructor() {
        return instructor;
    }

    public void setInstructor(SystemUser instructor) {
        this.instructor = instructor;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }

    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public QuizStatus getStatus() {
        return status;
    }

    public void setStatus(QuizStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<StudentAttempt> getAttempts() {
        return attempts;
    }

    public void setAttempts(List<StudentAttempt> attempts) {
        this.attempts = attempts;
    }
}
