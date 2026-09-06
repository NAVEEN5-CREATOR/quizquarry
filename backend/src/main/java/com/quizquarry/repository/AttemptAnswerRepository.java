package com.quizquarry.repository;

import com.quizquarry.model.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    List<AttemptAnswer> findByStudentAttemptId(Long studentAttemptId);
    void deleteByStudentAttemptId(Long studentAttemptId);
}
