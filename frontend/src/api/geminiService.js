// class GeminiService {
//   constructor(apiKey) {
//     this.apiKey = apiKey;
//     // Use the standard model endpoint - Gemini 2.0 Flash handles multimodal content
//     this.baseURL =
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
//   }

//   async processFile(file, materialType, pageRange = null) {
//     try {
//       // Validate file type first
//       if (!this.isSupportedFileType(file.type)) {
//         throw new Error(`Unsupported file type: ${file.type}`);
//       }

//       // Convert file to base64 for processing
//       const fileContent = await this.fileToBase64(file);
//       const fileType = file.type;

//       // Create appropriate prompt based on material type and file type
//       const prompt = this.createPrompt(materialType, fileType, pageRange);

//       const requestBody = this.buildRequestBody(prompt, fileContent, fileType);

//       const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Gemini API error response:", errorText);
//         throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();
//       return this.parseResponse(data, materialType);
//     } catch (error) {
//       console.error("Error processing file with Gemini:", error);
//       throw new Error(`Failed to process file: ${error.message}`);
//     }
//   }

//   async fileToBase64(file) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const base64 = reader.result.split(",")[1];
//         resolve(base64);
//       };
//       reader.onerror = (error) => {
//         reject(new Error("Failed to read file"));
//       };
//       reader.readAsDataURL(file);
//     });
//   }

//   isSupportedFileType(fileType) {
//     const supportedTypes = [
//       // Images
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//       "image/bmp",
//       "image/tiff",
//       // Documents
//       "application/pdf",
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
//       "application/vnd.ms-powerpoint", // .ppt
//       // Text files (if needed)
//       "text/plain",
//       "application/rtf",
//       "application/msword", // .doc
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//     ];
//     return supportedTypes.includes(fileType);
//   }

//   createPrompt(materialType, fileType, pageRange) {
//     const pageInfo = pageRange
//       ? `Focus specifically on pages ${pageRange.from} to ${pageRange.to}. `
//       : "";

//     const fileTypeContext = this.getFileTypeContext(fileType);

//     switch (materialType) {
//       case "flashcard":
//         return `${pageInfo}${fileTypeContext}

// Analyze all the content and extract key concepts, definitions, terms, and important facts to create comprehensive flashcards for studying.

// Create flashcards that cover:
// - Key terms and their definitions
// - Important concepts and explanations
// - Facts and figures
// - Processes and procedures
// - Any other study-worthy information

// Return ONLY a valid JSON object with this exact structure:
// {
//   "cards": [
//     { "front": "Question or term", "back": "Answer or definition" }
//   ]
// }

// Make sure to create at least 10-15 flashcards if the content allows, covering all important topics.`;

//       case "quiz":
//         return `${pageInfo}${fileTypeContext}

// Analyze all the content and create comprehensive multiple choice questions that test understanding of the material.

// Create questions that cover:
// - Key concepts and definitions
// - Application of knowledge
// - Analysis and comprehension
// - Important facts and details

// Each question should have 4 options with only one correct answer.

// IMPORTANT: The "answer" field must contain the EXACT text of the correct option, not an index number.

// Return ONLY a valid JSON object with this exact structure:
// {
//   "questions": [
//     {
//       "question": "What is the capital of France?",
//       "options": ["London", "Berlin", "Paris", "Madrid"],
//       "answer": "Paris"
//     }
//   ]
// }

// Make sure the "answer" field contains the exact same text as one of the options, with identical capitalization and spacing.
// Create at least 8-12 questions if the content allows, covering different aspects of the material.`;

//       case "summary":
//         return `${pageInfo}${fileTypeContext}

// Analyze all the content and create a comprehensive, well-structured summary.

// The summary should:
// - Cover all main topics and key points
// - Be organized in a logical flow
// - Include important details and examples
// - Be suitable for study and review purposes
// - Use clear, concise language

// Return ONLY a valid JSON object with this exact structure:
// { "summary": "Detailed summary text with proper formatting and organization" }`;

//       default:
//         throw new Error("Invalid material type");
//     }
//   }

//   getFileTypeContext(fileType) {
//     if (fileType.startsWith("image/")) {
//       return "Carefully examine this image and extract all visible text, diagrams, charts, and educational content. ";
//     } else if (fileType === "application/pdf") {
//       return "Carefully read through this PDF document and extract all text content, including any tables, charts, or structured information. ";
//     } else if (fileType.includes("presentation")) {
//       return "Analyze this presentation file and extract content from all slides, including text, bullet points, and any visual information that can be described. ";
//     } else {
//       return "Analyze this document and extract all relevant educational content. ";
//     }
//   }

//   buildRequestBody(prompt, fileContent, fileType) {
//     // Gemini 2.0 Flash handles all file types in the same way
//     return {
//       contents: [
//         {
//           parts: [
//             { text: prompt },
//             {
//               inline_data: {
//                 mime_type: fileType,
//                 data: fileContent,
//               },
//             },
//           ],
//         },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         topK: 40,
//         topP: 0.95,
//         maxOutputTokens: 8192,
//       },
//       safetySettings: [
//         {
//           category: "HARM_CATEGORY_HARASSMENT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//         {
//           category: "HARM_CATEGORY_HATE_SPEECH",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//         {
//           category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//         {
//           category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE",
//         },
//       ],
//     };
//   }

//   parseResponse(data, materialType) {
//     try {
//       if (
//         !data.candidates ||
//         !data.candidates[0] ||
//         !data.candidates[0].content ||
//         !data.candidates[0].content.parts ||
//         !data.candidates[0].content.parts[0]
//       ) {
//         throw new Error("Invalid response format from Gemini API");
//       }

//       const responseText = data.candidates[0].content.parts[0].text;

//       // Clean up the response text and extract JSON
//       const cleanedResponse = responseText.trim();

//       // Try to find JSON in the response
//       let jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) {
//         // Try to find JSON wrapped in code blocks
//         jsonMatch = cleanedResponse.match(
//           /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
//         );
//         if (jsonMatch) {
//           jsonMatch[0] = jsonMatch[1];
//         }
//       }

//       if (!jsonMatch) {
//         throw new Error("No JSON found in response");
//       }

//       const parsedContent = JSON.parse(jsonMatch[0]);

//       // Convert correctAnswer index to actual text if needed (for backward compatibility)
//       if (materialType === "quiz" && parsedContent.questions) {
//         parsedContent.questions = parsedContent.questions.map((question) => {
//           // If correctAnswer is a number, convert it to the actual text
//           if (typeof question.correctAnswer === "number") {
//             return {
//               ...question,
//               answer: question.options[question.correctAnswer],
//             };
//           }
//           // If it's already text, keep it as is but make sure it's in 'answer' field
//           if (question.correctAnswer && !question.answer) {
//             return {
//               ...question,
//               answer: question.correctAnswer,
//             };
//           }
//           return question;
//         });
//       }

//       this.validateResponse(parsedContent, materialType);

//       return parsedContent;
//     } catch (error) {
//       console.error("Error parsing Gemini response:", error);
//       console.error("Raw response:", data);
//       return this.getFallbackContent(materialType);
//     }
//   }

//   validateResponse(content, materialType) {
//     switch (materialType) {
//       case "flashcard":
//         if (!content.cards || !Array.isArray(content.cards)) {
//           throw new Error("Invalid flashcard format - missing cards array");
//         }
//         if (content.cards.length === 0) {
//           throw new Error("No flashcards generated");
//         }
//         // Validate each card has front and back
//         content.cards.forEach((card, index) => {
//           if (!card.front || !card.back) {
//             throw new Error(
//               `Invalid flashcard at index ${index} - missing front or back`
//             );
//           }
//         });
//         break;
//       case "quiz":
//         if (!content.questions || !Array.isArray(content.questions)) {
//           throw new Error("Invalid quiz format - missing questions array");
//         }
//         if (content.questions.length === 0) {
//           throw new Error("No quiz questions generated");
//         }
//         // Validate each question
//         content.questions.forEach((question, index) => {
//           if (
//             !question.question ||
//             !question.options ||
//             !Array.isArray(question.options) ||
//             !question.answer
//           ) {
//             throw new Error(`Invalid question at index ${index}`);
//           }
//           if (question.options.length !== 4) {
//             throw new Error(
//               `Question at index ${index} must have exactly 4 options`
//             );
//           }
//           // Check if the answer exists in the options
//           if (!question.options.includes(question.answer)) {
//             console.warn(
//               `Warning: Answer "${
//                 question.answer
//               }" not found in options for question ${index + 1}`
//             );
//           }
//         });
//         break;
//       case "summary":
//         if (!content.summary || typeof content.summary !== "string") {
//           throw new Error(
//             "Invalid summary format - missing or invalid summary"
//           );
//         }
//         if (content.summary.trim().length < 50) {
//           throw new Error("Summary is too short");
//         }
//         break;
//     }
//   }

//   getFallbackContent(materialType) {
//     switch (materialType) {
//       case "flashcard":
//         return {
//           cards: [
//             {
//               front: "Unable to process content",
//               back: "The file could not be processed. Please check the file format and try again with a supported file type (PDF, PPTX, or image files).",
//             },
//           ],
//         };
//       case "quiz":
//         return {
//           questions: [
//             {
//               question:
//                 "Unable to process the uploaded file. What should you do?",
//               options: [
//                 "Try uploading a different supported file format",
//                 "Check if the file is corrupted",
//                 "Contact support if the issue persists",
//                 "All of the above",
//               ],
//               answer: "All of the above",
//             },
//           ],
//         };
//       case "summary":
//         return {
//           summary:
//             "Unable to generate summary from the uploaded file. Please ensure the file is in a supported format (PDF, PPTX, or image) and contains readable content, then try again.",
//         };
//       default:
//         return null;
//     }
//   }
// }

// export default GeminiService;
class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;

    // Model configuration with fallbacks
    this.models = [
      "gemini-2.0-flash-exp", // Primary model
      "gemini-1.5-flash", // First fallback
      "gemini-1.5-pro", // Second fallback
      "gemini-1.0-pro-vision", // Third fallback (for images)
    ];

    this.currentModelIndex = 0;
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta/models";

    // Rate limiting configuration
    this.rateLimit = {
      maxRequests: 15, // Max requests per time window
      timeWindow: 60000, // 1 minute in milliseconds
      requests: [], // Array to track request timestamps
      retryAfter: 5000, // Wait 5 seconds before retry
    };
  }

  // Rate limiting check
  async checkRateLimit() {
    const now = Date.now();

    // Remove requests older than the time window
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (timestamp) => now - timestamp < this.rateLimit.timeWindow
    );

    // Check if we're at the rate limit
    if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
      const oldestRequest = Math.min(...this.rateLimit.requests);
      const waitTime = this.rateLimit.timeWindow - (now - oldestRequest);

      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(
          waitTime / 1000
        )} seconds before trying again.`
      );
    }

    // Add current request timestamp
    this.rateLimit.requests.push(now);
  }

  // Get current model URL
  getCurrentModelURL() {
    const currentModel = this.models[this.currentModelIndex];
    return `${this.baseURL}/${currentModel}:generateContent`;
  }

  // Switch to next available model
  switchToNextModel() {
    if (this.currentModelIndex < this.models.length - 1) {
      this.currentModelIndex++;
      console.log(
        `Switching to fallback model: ${this.models[this.currentModelIndex]}`
      );
      return true;
    }
    return false;
  }

  // Reset to primary model
  resetToPrimaryModel() {
    this.currentModelIndex = 0;
  }

  // Check if error indicates model unavailability
  isModelUnavailableError(errorMessage) {
    const unavailabilityKeywords = [
      "model not found",
      "model unavailable",
      "model not available",
      "service unavailable",
      "temporarily unavailable",
      "model is overloaded",
      "quota exceeded",
      "503",
      "502",
      "429",
    ];

    const lowerErrorMessage = errorMessage.toLowerCase();
    return unavailabilityKeywords.some((keyword) =>
      lowerErrorMessage.includes(keyword.toLowerCase())
    );
  }

  async processFile(file, materialType, pageRange = null, retryCount = 0) {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

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

      const response = await fetch(
        `${this.getCurrentModelURL()}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", errorText);

        // Check for unsupported format errors and provide custom message
        if (this.isUnsupportedFormatError(errorText)) {
          throw new Error("This format is not supported by our system.");
        }

        // Check if model is unavailable and try fallback
        if (this.isModelUnavailableError(errorText) && retryCount < 3) {
          if (this.switchToNextModel()) {
            console.log(
              `Retrying with fallback model (attempt ${retryCount + 1})`
            );
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return this.processFile(
              file,
              materialType,
              pageRange,
              retryCount + 1
            );
          }
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = this.parseResponse(data, materialType);

      // Reset to primary model on successful request
      this.resetToPrimaryModel();

      return result;
    } catch (error) {
      console.error("Error processing file with Gemini:", error);

      // Check if it's an unsupported format error and provide custom message
      if (this.isUnsupportedFormatError(error.message)) {
        throw new Error("This format is not supported by our system.");
      }

      // Check if it's a rate limit error
      if (error.message.includes("Rate limit exceeded")) {
        throw error; // Re-throw rate limit errors as-is
      }

      // Check if model is unavailable and try fallback
      if (this.isModelUnavailableError(error.message) && retryCount < 3) {
        if (this.switchToNextModel()) {
          console.log(
            `Retrying with fallback model due to error (attempt ${
              retryCount + 1
            })`
          );
          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.processFile(
            file,
            materialType,
            pageRange,
            retryCount + 1
          );
        }
      }

      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  // Helper method to detect unsupported format errors
  isUnsupportedFormatError(errorMessage) {
    const unsupportedFormatKeywords = [
      "mime type",
      "not supported",
      "unsupported format",
      "invalid file type",
      "unsupported file type",
      "format not supported",
      "mime_type",
      "MIME type",
    ];

    const lowerErrorMessage = errorMessage.toLowerCase();
    return unsupportedFormatKeywords.some((keyword) =>
      lowerErrorMessage.includes(keyword.toLowerCase())
    );
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

IMPORTANT: The "answer" field must contain the EXACT text of the correct option, not an index number.

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "answer": "Paris"
    }
  ]
}

Make sure the "answer" field contains the exact same text as one of the options, with identical capitalization and spacing.
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
    // Adjust configuration based on current model
    const currentModel = this.models[this.currentModelIndex];

    let generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    };

    // Adjust parameters for older models if needed
    if (currentModel.includes("1.0")) {
      generationConfig.maxOutputTokens = 4096; // Older models have lower limits
    }

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
      generationConfig,
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

      // Convert correctAnswer index to actual text if needed (for backward compatibility)
      if (materialType === "quiz" && parsedContent.questions) {
        parsedContent.questions = parsedContent.questions.map((question) => {
          // If correctAnswer is a number, convert it to the actual text
          if (typeof question.correctAnswer === "number") {
            return {
              ...question,
              answer: question.options[question.correctAnswer],
            };
          }
          // If it's already text, keep it as is but make sure it's in 'answer' field
          if (question.correctAnswer && !question.answer) {
            return {
              ...question,
              answer: question.correctAnswer,
            };
          }
          return question;
        });
      }

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
            !question.answer
          ) {
            throw new Error(`Invalid question at index ${index}`);
          }
          if (question.options.length !== 4) {
            throw new Error(
              `Question at index ${index} must have exactly 4 options`
            );
          }
          // Check if the answer exists in the options
          if (!question.options.includes(question.answer)) {
            console.warn(
              `Warning: Answer "${
                question.answer
              }" not found in options for question ${index + 1}`
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
              answer: "All of the above",
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

  // Utility method to get current rate limit status
  getRateLimitStatus() {
    const now = Date.now();
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (timestamp) => now - timestamp < this.rateLimit.timeWindow
    );

    return {
      remainingRequests:
        this.rateLimit.maxRequests - this.rateLimit.requests.length,
      resetTime:
        this.rateLimit.requests.length > 0
          ? new Date(
              Math.min(...this.rateLimit.requests) + this.rateLimit.timeWindow
            )
          : null,
      currentModel: this.models[this.currentModelIndex],
    };
  }
}

export default GeminiService;
