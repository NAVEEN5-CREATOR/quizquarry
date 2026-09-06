package com.quizquarry.service;

import com.quizquarry.dto.QuestionBankDto;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.exception.ResourceNotFoundException;
import com.quizquarry.exception.UnauthorizedException;
import com.quizquarry.model.QuestionBank;
import com.quizquarry.model.Role;
import com.quizquarry.model.SystemUser;
import com.quizquarry.repository.BankQuestionRepository;
import com.quizquarry.repository.QuestionBankRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final BankQuestionRepository bankQuestionRepository;

    public QuestionBankService(QuestionBankRepository questionBankRepository,
                               BankQuestionRepository bankQuestionRepository) {
        this.questionBankRepository = questionBankRepository;
        this.bankQuestionRepository = bankQuestionRepository;
    }

    public List<QuestionBankDto> getAllBanks(SystemUser currentUser) {
        List<QuestionBank> banks;
        if (currentUser != null && currentUser.getRole() == Role.INSTRUCTOR) {
            banks = questionBankRepository.findByInstructorId(currentUser.getId());
        } else {
            banks = questionBankRepository.findAll();
        }
        return banks.stream().map(this::toDto).collect(Collectors.toList());
    }

    public QuestionBankDto getBankDtoById(Long id) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question Bank not found with id: " + id));
        return toDto(bank);
    }

    public QuestionBank getBankEntityById(Long id) {
        return questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question Bank not found with id: " + id));
    }

    @Transactional
    public QuestionBankDto createBank(QuestionBankDto dto, SystemUser instructor) {
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new UnauthorizedException("Only instructors can create question banks");
        }

        QuestionBank bank = new QuestionBank(
                dto.getTitle().trim(),
                dto.getSubjectArea().trim(),
                instructor
        );

        QuestionBank saved = questionBankRepository.save(bank);
        return toDto(saved);
    }

    @Transactional
    public QuestionBankDto updateBank(Long id, QuestionBankDto dto, SystemUser currentUser) {
        QuestionBank bank = getBankEntityById(id);
        if (currentUser.getRole() != Role.INSTRUCTOR || !bank.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this question bank");
        }

        bank.setTitle(dto.getTitle().trim());
        bank.setSubjectArea(dto.getSubjectArea().trim());
        QuestionBank updated = questionBankRepository.save(bank);
        return toDto(updated);
    }

    @Transactional
    public void deleteBank(Long id, SystemUser currentUser) {
        QuestionBank bank = getBankEntityById(id);
        if (currentUser.getRole() != Role.INSTRUCTOR || !bank.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this question bank");
        }
        questionBankRepository.delete(bank);
    }

    public QuestionBankDto toDto(QuestionBank bank) {
        QuestionBankDto dto = new QuestionBankDto();
        dto.setId(bank.getId());
        dto.setTitle(bank.getTitle());
        dto.setSubjectArea(bank.getSubjectArea());
        if (bank.getInstructor() != null) {
            dto.setInstructorId(bank.getInstructor().getId());
            dto.setInstructorName(bank.getInstructor().getFullName());
        }
        dto.setQuestionCount(bankQuestionRepository.countByQuestionBankId(bank.getId()));
        dto.setCreatedAt(bank.getCreatedAt());
        dto.setUpdatedAt(bank.getUpdatedAt());
        return dto;
    }
}
