package com.quizquarry.repository;

import com.quizquarry.model.BankQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankQuestionRepository extends JpaRepository<BankQuestion, Long> {
    List<BankQuestion> findByQuestionBankId(Long questionBankId);
    long countByQuestionBankId(Long questionBankId);
}
