package com.quizquarry.repository;

import com.quizquarry.model.AttemptStatus;
import com.quizquarry.model.StudentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAttemptRepository extends JpaRepository<StudentAttempt, Long> {

    long countByStudentIdAndQuizAssessmentId(Long studentId, Long quizAssessmentId);

    List<StudentAttempt> findByStudentIdOrderByStartedAtDesc(Long studentId);

    List<StudentAttempt> findByQuizAssessmentId(Long quizAssessmentId);

    List<StudentAttempt> findByQuizAssessmentIdOrderByScoreDesc(Long quizAssessmentId);

    @Query("SELECT a FROM StudentAttempt a WHERE a.status = 'COMPLETED' ORDER BY a.score DESC, a.submittedAt ASC")
    List<StudentAttempt> findTopLeaderboardAttempts();

    @Query("SELECT a FROM StudentAttempt a WHERE a.quizAssessment.id = :quizId AND a.status = 'COMPLETED' ORDER BY a.score DESC, a.submittedAt ASC")
    List<StudentAttempt> findLeaderboardByQuizId(@Param("quizId") Long quizId);

    @Query("SELECT a FROM StudentAttempt a WHERE a.quizAssessment.instructor.id = :instructorId ORDER BY a.submittedAt DESC")
    List<StudentAttempt> findAttemptsByInstructorId(@Param("instructorId") Long instructorId);

    long countByStatus(AttemptStatus status);

    @Query("SELECT AVG(a.score) FROM StudentAttempt a WHERE a.status = 'COMPLETED'")
    Double getGlobalAverageScore();
}
