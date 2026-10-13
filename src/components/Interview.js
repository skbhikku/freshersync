
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
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini API error (${response.status})`
    );
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }

  return text;
}

function parseQuestions(responseText) {
  const cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return a valid question list.");
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1));

  const questions = parsed
    .map((item) =>
      typeof item === "string" ? item.trim() : item?.question?.trim()
    )
    .filter(Boolean);

  if (questions.length === 0) {
    throw new Error("No interview questions were generated.");
  }

  // Keep the introduction first and exactly 20 questions.
  const intro = "Can you please introduce yourself?";
  const remaining = questions.filter(
    (question) => question.toLowerCase() !== intro.toLowerCase()
  );

  return [intro, ...remaining].slice(0, 20);
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

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const shouldProcessRef = useRef(false);
  const recordingRef = useRef(false);

  useEffect(() => {
    return () => {
      shouldProcessRef.current = false;

      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // Recognition may already have stopped.
        }
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentQuestion = questions[questionIndex] || "";

  const handleResumeChange = (event) => {
    setResumeFile(event.target.files?.[0] || null);
    setResumeText("");
    setFormattedResume("");
    setQuestions([]);
    setQuestionIndex(0);
    setTranscript("");
    setFeedback("");
    setError("");
    setStatus("");
  };

  const handlePrepareInterview = async () => {
    if (!resumeFile) {
      setError("Please upload your resume PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Reading your resume...");
    setFormattedResume("");
    setQuestions([]);
    setFeedback("");
    setTranscript("");

    try {
      const extracted = await extractTextFromPDF(resumeFile);
      const text =
        typeof extracted === "string"
          ? extracted
          : extracted?.text || extracted?.content || "";

      if (!text.trim()) {
        throw new Error(
          "Could not extract text from this PDF. Please try another PDF."
        );
      }

      setResumeText(text);

      setStatus("Formatting your resume...");
      const formatted = await askGemini(`
You are a professional resume reviewer.
Clean up and organize the resume text below.
Preserve the candidate's actual facts, education, skills, dates and experience.
Do not invent information.
Return readable plain text with clear headings.

RESUME:
${text}
`);

      setFormattedResume(formatted);

      setStatus("Generating 20 interview questions...");
      const response = await askGemini(`
Create exactly 20 interview questions for a mock interview using this resume.
${jobDescription.trim()
  ? `Use this job description to tailor the questions:\n${jobDescription}`
  : "Tailor questions to the candidate's resume, skills, projects and education."}

Rules:
- Question 1 must be exactly: "Can you please introduce yourself?"
- Include technical, project-based and behavioral questions relevant to the resume.
- Return only a valid JSON array of 20 strings. No Markdown fences or extra text.

RESUME:
${text}
`);

      const generatedQuestions = parseQuestions(response);

      if (generatedQuestions.length < 20) {
        throw new Error(
          `Only ${generatedQuestions.length} questions were generated. Please try again.`
        );
      }

      setQuestions(generatedQuestions);
      setQuestionIndex(0);
      setStatus("Interview is ready.");
    } catch (err) {
      console.error("Prepare interview error:", err);
      setError(err.message || "Could not prepare the interview.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = () => {
    if (!currentQuestion || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
  };

  const fetchFeedback = async (answer) => {
    const response = await askGemini(`
You are a helpful and fair technical interview coach.
Evaluate the candidate's answer to the interview question.

Question:
${currentQuestion}

Candidate's answer:
${answer}

Candidate resume:
${resumeText}

Provide:
1. Overall assessment
2. What was good
3. What could be improved
4. A sample stronger answer
5. A score out of 10

Be constructive. Do not claim the candidate said things that are not in their answer.
Use clear headings and readable text.
`);

    setFeedback(response);
  };

  const handleStartRecording = () => {
    setError("");
    setFeedback("");
    setTranscript("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please try a recent version of Chrome or Edge."
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Previous session may already be closed.
      }
    }

    finalTranscriptRef.current = "";
    shouldProcessRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      recordingRef.current = true;
      setRecording(true);
      setStatus("Listening... Speak your answer.");
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

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError(
          "Microphone or speech recognition permission was denied. Allow microphone access in your browser settings."
        );
      } else if (event.error === "network") {
        setError(
          "The browser speech service encountered a network error. Check your internet connection and try again."
        );
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = async () => {
      recordingRef.current = false;
      setRecording(false);

      if (!shouldProcessRef.current) return;
      shouldProcessRef.current = false;

      const answer = finalTranscriptRef.current.trim();

      if (!answer) {
        setError("No speech was detected. Please try recording your answer again.");
        setStatus("");
        return;
      }

      setTranscript(answer);
      setLoading(true);
      setStatus("Evaluating your answer...");

      try {
        await fetchFeedback(answer);
        setStatus("Feedback is ready.");
      } catch (err) {
        console.error("Feedback error:", err);
        setError(err.message || "Could not generate feedback.");
        setStatus("");
      } finally {
        setLoading(false);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start recognition:", err);
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
      setError("Stop your current answer before moving to the next question.");
      return;
    }

    if (questionIndex >= questions.length - 1) {
      setStatus("You have completed all 20 interview questions.");
      return;
    }

    setQuestionIndex((index) => index + 1);
    setTranscript("");
    setFeedback("");
    setError("");
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={styles.page}>
      <h1>AI Mock Interview</h1>
      <p>
        Upload your resume, prepare your interview, answer aloud, and receive
        feedback.
      </p>

      <section style={styles.card}>
        <h2>1. Prepare your interview</h2>

        <label htmlFor="resume">Resume PDF</label>
        <input
          id="resume"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleResumeChange}
        />

        <label htmlFor="jobDescription">Job description (optional)</label>
        <textarea
          id="jobDescription"
          rows={4}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here..."
          style={styles.textarea}
        />

        <button
          onClick={handlePrepareInterview}
          disabled={loading || !resumeFile}
          style={styles.button}
        >
          {loading ? "Please wait..." : "Prepare Interview"}
        </button>

        {formattedResume && (
          <details style={styles.details}>
            <summary>View formatted resume</summary>
            <pre style={styles.pre}>{formattedResume}</pre>
          </details>
        )}
      </section>

      {questions.length > 0 && (
        <section style={styles.card}>
          <h2>2. Interview questions</h2>

          <p>
            Question {questionIndex + 1} of {questions.length}
          </p>

          <h3>{currentQuestion}</h3>

          <div style={styles.actions}>
            <button onClick={speakQuestion} style={styles.button}>
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

          <p aria-live="polite">{recording ? "Listening..." : status}</p>

          <label htmlFor="transcript">Your transcribed answer</label>
          <textarea
            id="transcript"
            rows={6}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Your recognized speech will appear here. You can edit it before asking for feedback."
            style={styles.textarea}
          />

          <button
            onClick={async () => {
              if (!transcript.trim()) {
                setError("Please speak or enter an answer first.");
                return;
              }

              setLoading(true);
              setError("");
              setFeedback("");
              setStatus("Evaluating your answer...");

              try {
                await fetchFeedback(transcript.trim());
                setStatus("Feedback is ready.");
              } catch (err) {
                setError(err.message || "Could not generate feedback.");
                setStatus("");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || recording || !transcript.trim()}
            style={styles.button}
          >
            {loading ? "Evaluating..." : "Get Feedback"}
          </button>

          {feedback && (
            <div style={styles.feedback}>
              <h3>AI Feedback</h3>
              <pre style={styles.pre}>{feedback}</pre>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            disabled={loading || recording}
            style={styles.button}
          >
            {questionIndex === questions.length - 1
              ? "Finish Interview"
              : "Next Question"}
          </button>
        </section>
      )}

      {status && <p role="status">{status}</p>}
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
    maxWidth: "850px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.6,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "20px",
  },
  textarea: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    margin: "8px 0 16px",
    padding: "12px",
    border: "1px solid #bbb",
    borderRadius: "8px",
    font: "inherit",
  },
  button: {
    padding: "10px 16px",
    margin: "8px 8px 8px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#2457d6",
    color: "#fff",
    fontWeight: 600,
  },
  stopButton: {
    padding: "10px 16px",
    margin: "8px 8px 8px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#b42318",
    color: "#fff",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  feedback: {
    background: "#f6f8fa",
    borderRadius: "8px",
    padding: "16px",
    margin: "16px 0",
  },
  pre: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    font: "inherit",
  },
  details: {
    marginTop: "16px",
  },
  error: {
    color: "#b42318",
    fontWeight: 600,
  },
};
