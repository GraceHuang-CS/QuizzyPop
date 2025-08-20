// src/api/geminiService.js
class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Use the standard model endpoint - Gemini 2.0 Flash handles multimodal content
    this.baseURL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
  }

  async processFile(file, materialType, pageRange = null) {
    try {
      // Validate file type first
      if (!this.isSupportedFileType(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Convert file to base64 for processing
      const fileContent = await this.fileToBase64(file);
      const fileType = file.type;

      // Create appropriate prompt based on material type and file type
      const prompt = this.createPrompt(materialType, fileType, pageRange);

      const requestBody = this.buildRequestBody(prompt, fileContent, fileType);

      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.parseResponse(data, materialType);
    } catch (error) {
      console.error("Error processing file with Gemini:", error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  }

  isSupportedFileType(fileType) {
    const supportedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      // Documents
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "application/vnd.ms-powerpoint", // .ppt
      // Text files (if needed)
      "text/plain",
      "application/rtf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    return supportedTypes.includes(fileType);
  }

  createPrompt(materialType, fileType, pageRange) {
    const pageInfo = pageRange
      ? `Focus specifically on pages ${pageRange.from} to ${pageRange.to}. `
      : "";

    const fileTypeContext = this.getFileTypeContext(fileType);

    switch (materialType) {
      case "flashcard":
        return `${pageInfo}${fileTypeContext}
        
Analyze all the content and extract key concepts, definitions, terms, and important facts to create comprehensive flashcards for studying. 

Create flashcards that cover:
- Key terms and their definitions
- Important concepts and explanations  
- Facts and figures
- Processes and procedures
- Any other study-worthy information

Return ONLY a valid JSON object with this exact structure:
{
  "cards": [
    { "front": "Question or term", "back": "Answer or definition" }
  ]
}

Make sure to create at least 10-15 flashcards if the content allows, covering all important topics.`;

      case "quiz":
        return `${pageInfo}${fileTypeContext}
        
Analyze all the content and create comprehensive multiple choice questions that test understanding of the material.

Create questions that cover:
- Key concepts and definitions
- Application of knowledge
- Analysis and comprehension
- Important facts and details

Each question should have 4 options with only one correct answer.

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Create at least 8-12 questions if the content allows, covering different aspects of the material.`;

      case "summary":
        return `${pageInfo}${fileTypeContext}
        
Analyze all the content and create a comprehensive, well-structured summary.

The summary should:
- Cover all main topics and key points
- Be organized in a logical flow
- Include important details and examples
- Be suitable for study and review purposes
- Use clear, concise language

Return ONLY a valid JSON object with this exact structure:
{ "summary": "Detailed summary text with proper formatting and organization" }`;

      default:
        throw new Error("Invalid material type");
    }
  }

  getFileTypeContext(fileType) {
    if (fileType.startsWith("image/")) {
      return "Carefully examine this image and extract all visible text, diagrams, charts, and educational content. ";
    } else if (fileType === "application/pdf") {
      return "Carefully read through this PDF document and extract all text content, including any tables, charts, or structured information. ";
    } else if (fileType.includes("presentation")) {
      return "Analyze this presentation file and extract content from all slides, including text, bullet points, and any visual information that can be described. ";
    } else {
      return "Analyze this document and extract all relevant educational content. ";
    }
  }

  buildRequestBody(prompt, fileContent, fileType) {
    // Gemini 2.0 Flash handles all file types in the same way
    return {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: fileType,
                data: fileContent,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };
  }

  parseResponse(data, materialType) {
    try {
      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0]
      ) {
        throw new Error("Invalid response format from Gemini API");
      }

      const responseText = data.candidates[0].content.parts[0].text;

      // Clean up the response text and extract JSON
      const cleanedResponse = responseText.trim();

      // Try to find JSON in the response
      let jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON wrapped in code blocks
        jsonMatch = cleanedResponse.match(
          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
        );
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }

      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsedContent = JSON.parse(jsonMatch[0]);

      this.validateResponse(parsedContent, materialType);

      return parsedContent;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      console.error("Raw response:", data);
      return this.getFallbackContent(materialType);
    }
  }

  validateResponse(content, materialType) {
    switch (materialType) {
      case "flashcard":
        if (!content.cards || !Array.isArray(content.cards)) {
          throw new Error("Invalid flashcard format - missing cards array");
        }
        if (content.cards.length === 0) {
          throw new Error("No flashcards generated");
        }
        // Validate each card has front and back
        content.cards.forEach((card, index) => {
          if (!card.front || !card.back) {
            throw new Error(
              `Invalid flashcard at index ${index} - missing front or back`
            );
          }
        });
        break;
      case "quiz":
        if (!content.questions || !Array.isArray(content.questions)) {
          throw new Error("Invalid quiz format - missing questions array");
        }
        if (content.questions.length === 0) {
          throw new Error("No quiz questions generated");
        }
        // Validate each question
        content.questions.forEach((question, index) => {
          if (
            !question.question ||
            !question.options ||
            !Array.isArray(question.options) ||
            question.correctAnswer === undefined
          ) {
            throw new Error(`Invalid question at index ${index}`);
          }
          if (question.options.length !== 4) {
            throw new Error(
              `Question at index ${index} must have exactly 4 options`
            );
          }
          if (question.correctAnswer < 0 || question.correctAnswer >= 4) {
            throw new Error(
              `Invalid correct answer index at question ${index}`
            );
          }
        });
        break;
      case "summary":
        if (!content.summary || typeof content.summary !== "string") {
          throw new Error(
            "Invalid summary format - missing or invalid summary"
          );
        }
        if (content.summary.trim().length < 50) {
          throw new Error("Summary is too short");
        }
        break;
    }
  }

  getFallbackContent(materialType) {
    switch (materialType) {
      case "flashcard":
        return {
          cards: [
            {
              front: "Unable to process content",
              back: "The file could not be processed. Please check the file format and try again with a supported file type (PDF, PPTX, or image files).",
            },
          ],
        };
      case "quiz":
        return {
          questions: [
            {
              question:
                "Unable to process the uploaded file. What should you do?",
              options: [
                "Try uploading a different supported file format",
                "Check if the file is corrupted",
                "Contact support if the issue persists",
                "All of the above",
              ],
              correctAnswer: 3,
            },
          ],
        };
      case "summary":
        return {
          summary:
            "Unable to generate summary from the uploaded file. Please ensure the file is in a supported format (PDF, PPTX, or image) and contains readable content, then try again.",
        };
      default:
        return null;
    }
  }
}

export default GeminiService;
