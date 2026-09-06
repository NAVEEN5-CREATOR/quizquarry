package com.quizquarry.repository;

import com.quizquarry.model.QuizAssessment;
import com.quizquarry.model.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAssessmentRepository extends JpaRepository<QuizAssessment, Long> {
    List<QuizAssessment> findByInstructorId(Long instructorId);
    List<QuizAssessment> findByStatus(QuizStatus status);
}
