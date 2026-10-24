
import React, { useEffect, useRef, useState } from "react";
import { extractTextFromPDF } from "./resumeAnalysis";

const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function askGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Add REACT_APP_GEMINI_API_KEY to your .env file."
    );
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini API error (${response.status})`
    );
  }

  if (data?.promptFeedback?.blockReason) {
    throw new Error("The AI could not process this request. Please try again.");
  }

  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      "Gemini returned an empty response. Please try again."
    );
  }

  return text;
}

// Remove Markdown formatting and normalize AI-generated content.
function cleanAIText(value) {
  if (!value) return "";

  return String(value)
    .replace(/```(?:json|markdown|md|text)?/gi, "")
    .replace(/```/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/_(.*?)_/gs, "$1")
    .replace(/~~(.*?)~~/gs, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, (match) => match.trim() + " ")
    .replace(/^\s*\|.*\|\s*$/gm, "")
    .replace(/^\s*[-:| ]{3,}\s*$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseQuestions(responseText) {
  const cleaned = responseText
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("The AI did not return a valid question list. Try again.");
  }

  let parsed;

  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("The AI returned invalid question data. Please try again.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("The AI response is not a question list.");
  }

  const questions = parsed
    .map((item) => {
      const question =
        typeof item === "string"
          ? item
          : item?.question || item?.text || "";

      return cleanAIText(question)
        .replace(/^\s*(?:question\s*)?\d+\s*[:.)-]\s*/i, "")
        .trim();
    })
    .filter(Boolean);

  const uniqueQuestions = [];
  const seen = new Set();

  for (const question of questions) {
    const key = question.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueQuestions.push(question);
    }
  }

  const intro = "Can you please introduce yourself?";

  const remaining = uniqueQuestions.filter(
    (question) => question.toLowerCase() !== intro.toLowerCase()
  );

  const result = [intro, ...remaining].slice(0, 20);

  if (result.length !== 20) {
    throw new Error(
      `The AI generated only ${result.length} unique questions. Please prepare the interview again.`
    );
  }

  return result;
}

function formatResumePrompt(resumeText) {
  return `
You are an expert professional resume editor.

Rewrite and organize the candidate's resume into a clean, professional,
ATS-friendly resume in plain text.

IMPORTANT RULES:
1. Preserve all actual facts from the source resume.
2. Never invent experience, skills, qualifications, dates, scores, achievements,
   contact information, or projects.
3. Correct spelling and grammar where appropriate.
4. Remove duplicate information.
5. Use simple section headings.
6. Put each skill and achievement on a readable separate line.
7. Use plain text only. Do not use Markdown, #, ***, asterisks, tables,
   code blocks, or decorative characters.
8. If information is missing, omit it instead of guessing.
9. Keep the candidate's original meaning.

Use these headings only when applicable:
CONTACT INFORMATION
PROFESSIONAL SUMMARY
EDUCATION
TECHNICAL SKILLS
WORK EXPERIENCE
INTERNSHIPS
PROJECTS
CERTIFICATIONS
ACHIEVEMENTS

RESUME SOURCE:
${resumeText}

Return only the formatted resume.
`;
}

function questionsPrompt(resumeText, jobDescription) {
  return `
You are a senior technical interviewer and interview question designer.

Create exactly 20 distinct, useful interview questions for this candidate.

${jobDescription.trim()
  ? `JOB DESCRIPTION:\n${jobDescription.trim()}`
  : "Use the candidate's resume to select relevant interview topics."}

CANDIDATE RESUME:
${resumeText}

STRICT REQUIREMENTS:
1. The first question must be exactly:
   Can you please introduce yourself?
2. Return exactly 20 questions as a valid JSON array of strings.
3. Do not return Markdown, explanations, headings, or code fences.
4. Use clear, natural, professional English.
5. Tailor questions to the candidate's actual skills, education and projects.
6. Include relevant technical fundamentals, project architecture, practical
   implementation, debugging, problem-solving and behavioral questions.
7. Ask about technologies in the resume or job description.
8. Do not assume the candidate has experience that the resume does not show.
9. Avoid duplicate questions and generic filler questions.
10. Questions should be understandable when spoken aloud.

Expected format:
[
  "Can you please introduce yourself?",
  "Question two?",
  "Question three?"
]

Return the complete JSON array containing exactly 20 questions.
`;
}

function feedbackPrompt(question, answer, resumeText, jobDescription) {
  return `
You are an experienced technical interviewer, communication coach,
and fair candidate evaluator.

Evaluate the candidate's answer carefully using the interview question,
the actual answer, and the candidate's resume.

INTERVIEW QUESTION:
${question}

CANDIDATE'S ACTUAL ANSWER:
${answer}

CANDIDATE'S RESUME:
${resumeText}

${jobDescription.trim()
  ? `TARGET JOB DESCRIPTION:\n${jobDescription.trim()}`
  : ""}

EVALUATION RULES:
1. Evaluate what the candidate actually said, not what you wish they had said.
2. Never claim the candidate mentioned something they did not mention.
3. Do not fabricate technical facts, project details, or experience.
4. Be fair to fresh graduates and candidates with limited experience.
5. Evaluate relevance, correctness, clarity, completeness and practical understanding.
6. For technical questions, explain technical errors and how to correct them.
7. For project questions, assess the candidate's own explanation and evidence.
8. For an introduction question, assess structure, relevance and communication.
9. For behavioral questions, assess specificity and use of examples.
10. If the answer is too short or irrelevant, explain exactly what is missing.
11. Give a score from 0 to 10 and justify it briefly.
12. Provide a sample improved answer appropriate to the question and candidate.
13. The sample answer must not invent personal history or achievements.
    Use placeholders such as [add your actual project example] when needed.
14. Give specific, actionable advice rather than generic praise.
15. Use professional, simple English.

OUTPUT FORMAT:
OVERALL ASSESSMENT
Give a concise assessment of the submitted answer.

WHAT YOU DID WELL
List the specific strengths actually demonstrated.

WHAT NEEDS IMPROVEMENT
Identify mistakes, missing details or unclear explanations.
If there are technical mistakes, explain the correct concept.

TECHNICAL ACCURACY
Explain whether the answer is correct, partly correct, incorrect or not
applicable. Give the correct explanation where necessary.

SAMPLE IMPROVED ANSWER
Provide a natural, speakable answer that addresses the question.
Keep it appropriate to the candidate's actual background.
Do not invent facts.

SCORE
Give one score out of 10 and briefly justify it.

NEXT STEP
Give one specific suggestion for answering this type of question better.

FORMATTING:
Return clean plain text only.
Do not use Markdown headings, #, ***, asterisks, tables, code blocks,
or decorative symbols.
Use the exact section labels above.
Keep the feedback useful, specific and easy to read.
`;
}

export default function Interview() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [formattedResume, setFormattedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answerHistory, setAnswerHistory] = useState([]);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const shouldProcessRef = useRef(false);
  const recordingRef = useRef(false);
  const mountedRef = useRef(true);

  const currentQuestion = questions[questionIndex] || "";

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      shouldProcessRef.current = false;
      recordingRef.current = false;

      if (recognitionRef.current) {
        recognitionRef.current.onend = null;

        try {
          recognitionRef.current.abort();
        } catch {
          // Recognition may already be stopped.
        }
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0] || null;

    setResumeFile(file);
    setResumeText("");
    setFormattedResume("");
    setQuestions([]);
    setQuestionIndex(0);
    setTranscript("");
    setFeedback("");
    setAnswerHistory([]);
    setError("");
    setStatus("");
  };

  const handlePrepareInterview = async () => {
    if (!resumeFile) {
      setError("Please upload your resume PDF first.");
      return;
    }

    if (resumeFile.type !== "application/pdf" &&
        !resumeFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF resume.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Reading your resume...");
    setFormattedResume("");
    setResumeText("");
    setQuestions([]);
    setQuestionIndex(0);
    setTranscript("");
    setFeedback("");
    setAnswerHistory([]);

    try {
      const extracted = await extractTextFromPDF(resumeFile);

      const text =
        typeof extracted === "string"
          ? extracted
          : extracted?.text || extracted?.content || "";

      if (!text.trim()) {
        throw new Error(
          "Could not extract text from this PDF. If it is a scanned PDF, use a text-based PDF or OCR."
        );
      }

      setResumeText(text);

      setStatus("Formatting your resume with AI...");

      const formatted = await askGemini(formatResumePrompt(text));

      setFormattedResume(cleanAIText(formatted));

      setStatus("Generating your 20 personalized interview questions...");

      const response = await askGemini(
        questionsPrompt(text, jobDescription)
      );

      const generatedQuestions = parseQuestions(response);

      setQuestions(generatedQuestions);
      setQuestionIndex(0);
      setStatus("Interview is ready. Start with Question 1.");
    } catch (err) {
      console.error("Prepare interview error:", err);

      setError(
        err.message || "Could not prepare the interview. Please try again."
      );

      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = () => {
    if (!currentQuestion) {
      setError("Prepare your interview first.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
  };

  const fetchFeedback = async (question, answer) => {
    const response = await askGemini(
      feedbackPrompt(question, answer, resumeText, jobDescription)
    );

    return cleanAIText(response);
  };

  const handleGetFeedback = async () => {
    const answer = transcript.trim();

    if (!answer) {
      setError("Please speak or type your answer first.");
      return;
    }

    if (!currentQuestion) {
      setError("No interview question is selected.");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");
    setStatus("AI is evaluating your answer...");

    try {
      const result = await fetchFeedback(currentQuestion, answer);

      setFeedback(result);

      setAnswerHistory((previous) => {
        const updated = previous.filter(
          (item) => item.questionIndex !== questionIndex
        );

        updated.push({
          questionIndex,
          question: currentQuestion,
          answer,
          feedback: result,
        });

        return updated.sort((a, b) => a.questionIndex - b.questionIndex);
      });

      setStatus("Feedback is ready.");
    } catch (err) {
      console.error("Feedback error:", err);
      setError(err.message || "Could not generate feedback.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    setError("");
    setFeedback("");
    setTranscript("");
    finalTranscriptRef.current = "";
    shouldProcessRef.current = false;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported. Try the latest Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Previous session may already have stopped.
      }
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      recordingRef.current = true;
      setRecording(true);
      setStatus("Listening... Speak your answer clearly.");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const recognizedText = result[0]?.transcript || "";

        if (result.isFinal) {
          finalTranscriptRef.current += recognizedText + " ";
        } else {
          interimTranscript += recognizedText;
        }
      }

      setTranscript(
        `${finalTranscriptRef.current} ${interimTranscript}`.trim()
      );
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed" ||
          event.error === "service-not-allowed") {
        setError(
          "Microphone permission was denied. Allow microphone access in your browser settings."
        );
      } else if (event.error === "network") {
        setError(
          "The browser speech service reported a network error. Check your internet connection."
        );
      } else if (event.error !== "no-speech" &&
                 event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      recordingRef.current = false;
      setRecording(false);

      if (!shouldProcessRef.current) return;

      shouldProcessRef.current = false;

      const answer = finalTranscriptRef.current.trim();

      if (!answer) {
        setError(
          "No final speech was detected. Please try again or type your answer."
        );
        setStatus("");
        return;
      }

      setTranscript(answer);
      setStatus("Transcription complete. Review your answer and click Get Feedback.");
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start recognition:", err);
      recordingRef.current = false;
      setRecording(false);
      setError("Could not start speech recognition. Please try again.");
      setStatus("");
    }
  };

  const handleStopRecording = () => {
    if (!recognitionRef.current || !recordingRef.current) return;

    shouldProcessRef.current = true;
    setStatus("Finishing transcription...");

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("Could not stop recognition:", err);
      shouldProcessRef.current = false;
      recordingRef.current = false;
      setRecording(false);
      setError("Could not stop speech recognition. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    if (recordingRef.current) {
      setError("Stop recording before moving to the next question.");
      return;
    }

    if (loading) return;

    if (questionIndex >= questions.length - 1) {
      setStatus("You have completed all 20 interview questions.");
      return;
    }

    setQuestionIndex((index) => index + 1);
    setTranscript("");
    setFeedback("");
    setError("");
    setStatus("");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completedCount = answerHistory.length;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>AI Mock Interview</h1>
        <p style={styles.subtitle}>
          Upload your resume, practice interview questions, answer aloud,
          and receive personalized AI feedback.
        </p>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>1. Prepare your interview</h2>

        <label style={styles.label} htmlFor="resume">
          Upload Resume (PDF)
        </label>

        <input
          id="resume"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleResumeChange}
          disabled={loading}
          style={styles.fileInput}
        />

        {resumeFile && (
          <p style={styles.fileName}>
            Selected file: {resumeFile.name}
          </p>
        )}

        <label style={styles.label} htmlFor="jobDescription">
          Job Description (Optional)
        </label>

        <textarea
          id="jobDescription"
          rows={5}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here to generate role-specific questions..."
          style={styles.textarea}
          disabled={loading}
        />

        <button
          onClick={handlePrepareInterview}
          disabled={loading || !resumeFile}
          style={{
            ...styles.button,
            ...(loading || !resumeFile ? styles.disabledButton : {}),
          }}
        >
          {loading ? "Please wait..." : "Prepare Interview"}
        </button>

        {formattedResume && (
          <details open style={styles.details}>
            <summary style={styles.summary}>Formatted Resume</summary>
            <pre style={styles.pre}>{formattedResume}</pre>
          </details>
        )}
      </section>

      {questions.length > 0 && (
        <>
          <section style={styles.card}>
            <div style={styles.questionHeader}>
              <h2 style={styles.sectionTitle}>2. Interview Questions</h2>
              <span style={styles.counter}>
                {questionIndex + 1} / {questions.length}
              </span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((questionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <p style={styles.muted}>
              Answer the question naturally, as if you were speaking to an interviewer.
            </p>

            <div style={styles.questionBox}>
              <span style={styles.questionNumber}>
                QUESTION {questionIndex + 1}
              </span>
              <h3 style={styles.questionText}>{currentQuestion}</h3>
            </div>

            <div style={styles.actions}>
              <button onClick={speakQuestion} style={styles.secondaryButton}>
                Read Question Aloud
              </button>

              {!recording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={loading}
                  style={styles.button}
                >
                  Start Answer
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  style={styles.stopButton}
                >
                  Stop Answer
                </button>
              )}
            </div>

            {recording && (
              <p style={styles.recordingStatus}>
                <span style={styles.recordingDot} />
                Recording your answer...
              </p>
            )}

            <label style={styles.label} htmlFor="transcript">
              Your Answer
            </label>

            <textarea
              id="transcript"
              rows={7}
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Your recognized speech appears here. You can edit it or type your answer manually."
              style={styles.textarea}
              disabled={recording || loading}
            />

            <button
              onClick={handleGetFeedback}
              disabled={loading || recording || !transcript.trim()}
              style={{
                ...styles.button,
                ...(loading || recording || !transcript.trim()
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {loading ? "Evaluating Answer..." : "Get AI Feedback"}
            </button>

            {feedback && (
              <div style={styles.feedbackCard}>
                <h3 style={styles.feedbackTitle}>AI Interview Feedback</h3>
                <pre style={styles.pre}>{feedback}</pre>
              </div>
            )}

            <div style={styles.navigation}>
              <span style={styles.muted}>
                {completedCount} of {questions.length} answers evaluated
              </span>

              <button
                onClick={handleNextQuestion}
                disabled={loading || recording}
                style={styles.button}
              >
                {questionIndex === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question"}
              </button>
            </div>
          </section>

          {questionIndex === questions.length - 1 &&
            status === "You have completed all 20 interview questions." && (
              <section style={styles.card}>
                <h2 style={styles.sectionTitle}>Interview Completed</h2>
                <p>
                  You evaluated {completedCount} out of {questions.length} answers.
                  Review your feedback above to identify areas for improvement.
                </p>

                {answerHistory.length > 0 && (
                  <div style={styles.history}>
                    {answerHistory.map((item) => (
                      <details key={item.questionIndex} style={styles.details}>
                        <summary style={styles.summary}>
                          Question {item.questionIndex + 1}: {item.question}
                        </summary>
                        <h4>Your Answer</h4>
                        <pre style={styles.pre}>{item.answer}</pre>
                        <h4>AI Feedback</h4>
                        <pre style={styles.pre}>{item.feedback}</pre>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            )}
        </>
      )}

      {status && (
        <p role="status" style={styles.status}>
          {status}
        </p>
      )}

      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}
    </main>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Arial, Helvetica, sans-serif",
    lineHeight: 1.7,
    color: "#172033",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "32px",
    lineHeight: 1.25,
    marginBottom: "8px",
    color: "#14254a",
  },
  subtitle: {
    color: "#5e687a",
    marginTop: 0,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e0e5ee",
    borderRadius: "14px",
    padding: "24px",
    marginTop: "22px",
    boxShadow: "0 4px 18px rgba(25, 45, 85, 0.05)",
  },
  sectionTitle: {
    fontSize: "22px",
    marginTop: 0,
    marginBottom: "16px",
    color: "#18294d",
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginTop: "16px",
    marginBottom: "7px",
  },
  fileInput: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ccd3df",
    borderRadius: "8px",
    background: "#fafbfe",
  },
  fileName: {
    fontSize: "14px",
    color: "#24633c",
    overflowWrap: "anywhere",
  },
  textarea: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    margin: "8px 0 16px",
    padding: "13px",
    border: "1px solid #ccd3df",
    borderRadius: "8px",
    font: "inherit",
    lineHeight: 1.6,
    resize: "vertical",
    background: "#ffffff",
    color: "#172033",
  },
  button: {
    padding: "11px 18px",
    margin: "8px 8px 8px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#2457d6",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
  },
  secondaryButton: {
    padding: "11px 18px",
    margin: "8px 8px 8px 0",
    border: "1px solid #2457d6",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#ffffff",
    color: "#2457d6",
    fontWeight: 600,
    fontSize: "14px",
  },
  stopButton: {
    padding: "11px 18px",
    margin: "8px 8px 8px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#b42318",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
  },
  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  details: {
    marginTop: "18px",
    borderTop: "1px solid #e5e9f0",
    paddingTop: "14px",
  },
  summary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#2457d6",
    overflowWrap: "anywhere",
  },
  pre: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    wordBreak: "normal",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    lineHeight: 1.8,
    margin: "12px 0",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginBottom: "12px",
  },
  questionHeader: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  counter: {
    fontWeight: 700,
    color: "#2457d6",
    background: "#edf2ff",
    padding: "5px 12px",
    borderRadius: "20px",
  },
  progressTrack: {
    height: "7px",
    background: "#e7ebf3",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "18px",
  },
  progressFill: {
    height: "100%",
    background: "#2457d6",
    borderRadius: "10px",
    transition: "width 0.25s ease",
  },
  muted: {
    color: "#697386",
    fontSize: "14px",
  },
  questionBox: {
    background: "#f4f7ff",
    border: "1px solid #dce5ff",
    borderRadius: "10px",
    padding: "20px",
    margin: "18px 0",
  },
  questionNumber: {
    color: "#2457d6",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1px",
  },
  questionText: {
    fontSize: "21px",
    lineHeight: 1.5,
    margin: "8px 0 0",
    color: "#18294d",
  },
  recordingStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#b42318",
    fontWeight: 600,
  },
  recordingDot: {
    display: "inline-block",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#b42318",
  },
  feedbackCard: {
    marginTop: "24px",
    padding: "20px",
    background: "#f7f9fc",
    border: "1px solid #e0e5ee",
    borderRadius: "10px",
  },
  feedbackTitle: {
    marginTop: 0,
    color: "#18294d",
    fontSize: "21px",
  },
  navigation: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    borderTop: "1px solid #e5e9f0",
    marginTop: "22px",
    paddingTop: "14px",
  },
  history: {
    marginTop: "16px",
  },
  status: {
    marginTop: "16px",
    color: "#24633c",
    fontWeight: 600,
  },
  error: {
    marginTop: "16px",
    padding: "12px 14px",
    background: "#fff1f0",
    borderRadius: "8px",
    color: "#b42318",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
};
