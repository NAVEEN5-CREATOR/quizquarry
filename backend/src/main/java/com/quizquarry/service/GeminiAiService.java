package com.quizquarry.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizquarry.dto.AiGenerateRequest;
import com.quizquarry.dto.BankQuestionDto;
import com.quizquarry.exception.BadRequestException;
import com.quizquarry.model.BankQuestion;
import com.quizquarry.model.DifficultyLevel;
import com.quizquarry.model.QuestionBank;
import com.quizquarry.repository.BankQuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    private final BankQuestionRepository bankQuestionRepository;
    private final QuestionBankService questionBankService;
    private final BankQuestionService bankQuestionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String configuredApiKey;

    @Value("${gemini.model:gemini-pro-latest}")
    private String configuredModel;

    public GeminiAiService(BankQuestionRepository bankQuestionRepository,
                           QuestionBankService questionBankService,
                           BankQuestionService bankQuestionService) {
        this.bankQuestionRepository = bankQuestionRepository;
        this.questionBankService = questionBankService;
        this.bankQuestionService = bankQuestionService;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
    }

    public String resolveApiKey() {
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey.trim();
        }
        if (configuredApiKey != null && !configuredApiKey.trim().isEmpty()) {
            return configuredApiKey.trim();
        }
        return null;
    }

    @Transactional
    public List<BankQuestionDto> generateAndSaveQuestions(AiGenerateRequest request) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new BadRequestException("GEMINI_API_KEY environment variable is not set. Please set GEMINI_API_KEY before generating questions.");
        }

        QuestionBank bank = questionBankService.getBankEntityById(request.getQuestionBankId());
        String prompt = buildPrompt(request);

        String jsonText = callGeminiApi(prompt, apiKey);
        List<BankQuestion> questions = parseAndValidateQuestions(jsonText, bank, request.getDifficultyLevel());

        List<BankQuestion> saved = bankQuestionRepository.saveAll(questions);
        List<BankQuestionDto> dtos = new ArrayList<>();
        for (BankQuestion q : saved) {
            dtos.add(bankQuestionService.toDto(q));
        }
        return dtos;
    }

    private String buildPrompt(AiGenerateRequest request) {
        return String.format(
                "You are an expert exam question author. Generate exactly %d multiple-choice questions for the following topic:\n" +
                "Topic: %s\n" +
                "Difficulty Level: %s\n\n" +
                "Strict Requirements:\n" +
                "1. Output ONLY a valid raw JSON array of objects. Do not include markdown codeblocks (no ```json or ```), no explanatory text before or after.\n" +
                "2. Each object must follow this exact schema:\n" +
                "[\n" +
                "  {\n" +
                "    \"questionText\": \"Clear question prompt\",\n" +
                "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
                "    \"correctAnswer\": \"Option A\",\n" +
                "    \"explanation\": \"Detailed rationale explaining why this choice is correct and others are not\",\n" +
                "    \"difficultyLevel\": \"%s\"\n" +
                "  }\n" +
                "]\n" +
                "3. The 'correctAnswer' value MUST be character-for-character identical to one of the 4 strings in the 'options' array.",
                request.getCount(),
                request.getTopic(),
                request.getDifficultyLevel().name(),
                request.getDifficultyLevel().name()
        );
    }

    public String callGeminiApi(String prompt, String apiKey) {
        List<String> modelsToTry = new ArrayList<>();
        if (configuredModel != null && !configuredModel.trim().isEmpty()) {
            modelsToTry.add(configuredModel.trim());
        }
        // Fallback models
        for (String m : Arrays.asList("gemini-pro-latest", "gemini-3.1-pro-preview", "gemini-3.6-flash", "gemini-1.5-flash")) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(contentMap));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String lastErrorMsg = null;
        for (String modelName : modelsToTry) {
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    continue;
                }

                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode candidatesNode = rootNode.path("candidates");
                if (candidatesNode.isMissingNode() || !candidatesNode.isArray() || candidatesNode.isEmpty()) {
                    continue;
                }

                JsonNode textNode = candidatesNode.get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
                String respBody = httpEx.getResponseBodyAsString();
                String extracted = httpEx.getStatusText();
                try {
                    JsonNode errNode = objectMapper.readTree(respBody).path("error").path("message");
                    if (!errNode.isMissingNode() && !errNode.asText().isEmpty()) {
                        extracted = errNode.asText();
                    }
                } catch (Exception ignored) {}
                lastErrorMsg = "Gemini API (" + modelName + ", " + httpEx.getStatusCode().value() + "): " + extracted;
                logger.warn("Model {} failed: {}", modelName, lastErrorMsg);
                // If model not found, try next model; if quota or project error, log and keep trying fallbacks
            } catch (Exception e) {
                lastErrorMsg = e.getMessage();
                logger.warn("Model {} request failed: {}", modelName, lastErrorMsg);
            }
        }

        throw new BadRequestException(lastErrorMsg != null ? lastErrorMsg : "Failed to generate content from Gemini API.");
    }

    public List<BankQuestion> parseAndValidateQuestions(String rawText, QuestionBank bank, DifficultyLevel requestedDifficulty) {
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new BadRequestException("AI returned empty content");
        }

        // Clean markdown fences
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        List<Map<String, Object>> rawList;
        try {
            rawList = objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            logger.error("Failed to parse JSON array from AI response: {}", cleaned, e);
            throw new BadRequestException("Failed to parse questions JSON from AI: " + e.getMessage());
        }

        if (rawList.isEmpty()) {
            throw new BadRequestException("AI returned an empty question list");
        }

        List<BankQuestion> result = new ArrayList<>();
        for (int i = 0; i < rawList.size(); i++) {
            Map<String, Object> item = rawList.get(i);

            String questionText = Objects.toString(item.get("questionText"), "").trim();
            if (questionText.isEmpty()) {
                throw new BadRequestException("Question #" + (i + 1) + " is missing questionText");
            }

            Object optsObj = item.get("options");
            if (!(optsObj instanceof List)) {
                throw new BadRequestException("Question #" + (i + 1) + " options must be a list");
            }
            List<?> optsRaw = (List<?>) optsObj;
            if (optsRaw.size() < 2) {
                throw new BadRequestException("Question #" + (i + 1) + " must have at least 2 options");
            }
            List<String> options = new ArrayList<>();
            for (Object o : optsRaw) {
                if (o != null && !o.toString().trim().isEmpty()) {
                    options.add(o.toString().trim());
                }
            }

            String correctAnswer = Objects.toString(item.get("correctAnswer"), "").trim();
            if (correctAnswer.isEmpty()) {
                throw new BadRequestException("Question #" + (i + 1) + " is missing correctAnswer");
            }

            final String initialAnswer = correctAnswer;
            boolean matchFound = options.stream().anyMatch(opt -> opt.equalsIgnoreCase(initialAnswer));
            if (!matchFound) {
                // If it provided "A", "B", "C", or "D" as index reference, map to option
                if (correctAnswer.equalsIgnoreCase("A") && options.size() >= 1) {
                    correctAnswer = options.get(0);
                } else if (correctAnswer.equalsIgnoreCase("B") && options.size() >= 2) {
                    correctAnswer = options.get(1);
                } else if (correctAnswer.equalsIgnoreCase("C") && options.size() >= 3) {
                    correctAnswer = options.get(2);
                } else if (correctAnswer.equalsIgnoreCase("D") && options.size() >= 4) {
                    correctAnswer = options.get(3);
                } else {
                    throw new BadRequestException("Question #" + (i + 1) + " correctAnswer '" + correctAnswer + "' does not match any options: " + options);
                }
            }

            String explanation = Objects.toString(item.get("explanation"), "Explanation provided by AI.").trim();

            DifficultyLevel difficulty = requestedDifficulty != null ? requestedDifficulty : DifficultyLevel.MEDIUM;
            String diffStr = Objects.toString(item.get("difficultyLevel"), "");
            if (!diffStr.isEmpty()) {
                try {
                    difficulty = DifficultyLevel.valueOf(diffStr.toUpperCase());
                } catch (IllegalArgumentException ignored) {
                }
            }

            BankQuestion bankQuestion = new BankQuestion(
                    bank,
                    questionText,
                    options,
                    correctAnswer,
                    explanation,
                    difficulty,
                    true // isAiGenerated = true
            );
            result.add(bankQuestion);
        }

        return result;
    }
}
