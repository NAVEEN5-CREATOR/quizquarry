package com.quizquarry.repository;

import com.quizquarry.model.QuestionBank;
import com.quizquarry.model.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    List<QuestionBank> findByInstructor(SystemUser instructor);
    List<QuestionBank> findByInstructorId(Long instructorId);
}
