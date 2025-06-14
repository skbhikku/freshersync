/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromPDF } from './resumeAnalysis';
import { Worker } from '@react-pdf-viewer/core';

const Interview = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [formattedResumeText, setFormattedResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const GEMINI_API_KEY = "AIzaSyDy6aHpkE6JYexSAEHFkpayB37BSJ8I0Go";

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    try {
      setLoading(true);
      const rawText = await extractTextFromPDF(file);
      setResumeText(rawText);

      const formatted = await formatResume(rawText);
      setFormattedResumeText(formatted);
    } catch (error) {
      console.error('Error processing resume:', error);
      alert('Failed to process resume.');
    } finally {
      setLoading(false);
    }
  };

const formatResume = async (rawText) => {
    // Validate input
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
        console.error("Invalid rawText provided");
        return rawText;
    }

    // Ensure we don't exceed API limits while preserving meaningful content
    const maxLength = 3000;
    const truncatedText = rawText.length > maxLength 
        ? rawText.substring(0, maxLength) + "... [truncated for length]"
        : rawText;

    try {
        const prompt = `You are a professional resume writer. Transform the following resume text into a perfectly formatted, professional resume. Follow these rules STRICTLY:

1. STRUCTURE:
   - Header (Name, Contact Info, Links)
   - Professional Summary (3-4 lines max)
   - Education (Institution, Degree, GPA, Relevant Courses)
   - Technical Skills (Grouped by category in a clean table)
   - Projects (Name, Tech Used, 3 bullet points with metrics)
   - Achievements/Awards (If any exist)
   - Keep all original information

2. FORMATTING:
   - Use consistent bullet points (•)
   - Bold section headers (## Header)
   - Italicize job titles/dates
   - Skills in a table format
   - Empty line between sections
   - No extra blank spaces

3. WRITING STYLE:
   - Start bullet points with strong action verbs
   - Include quantifiable achievements
   - Keep language professional but concise
   - Remove any placeholder text like [Graduation Date]

Raw Resume Text:
${truncatedText}

Formatted Resume (follow exact structure above):`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }],
                        role: "user"
                    }],
                    generationConfig: {
                        temperature: 0.2,  // More focused output
                        topP: 0.7,
                        topK: 30,
                        maxOutputTokens: 2000
                    },
                    safetySettings: [
                        {
                            "category": "HARM_CATEGORY_HARASSMENT",
                            "threshold": "BLOCK_ONLY_HIGH"
                        }
                    ]
                }),
                signal: AbortSignal.timeout(15000)  // 15 seconds timeout
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Enhanced response parsing with fallbacks
        const formattedResume = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                               data?.text?.trim() || 
                               rawText;

        // Output validation
        if (formattedResume === rawText || 
            formattedResume.length < 100 || 
            !formattedResume.includes('##') || 
            !formattedResume.includes('•')) {
            console.warn("Formatting failed validation checks, returning original");
            return rawText;
        }

        // Post-processing cleanup
        return formattedResume
            .replace(/\n\s*\n/g, '\n\n')  // Remove excessive newlines
            .replace(/\[.*?\]/g, '')      // Remove any remaining placeholders
            .trim();
            
    } catch (error) {
        console.error("Error formatting resume:", error.message);
        return rawText;  // Fallback to original text
    }
};

  const generateQuestions = async () => {
    if (!formattedResumeText) {
      alert("Please upload your resume first");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate exactly 20 interview questions for a final-year computer science student. Follow these rules:
1. First question MUST be: "Can you please introduce yourself?"
2. Remaining 19 questions should be strictly based ONLY on:
   - only Technical skills in resume where the programining langugaes question basic question only  okay
   ${jobDescription ? `- Job requirements from: ${jobDescription}` : ''}

Resume Text:
${formattedResumeText.substring(0, 3000)}...

Return ONLY a valid JSON array: ["question1", "question2", ...]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }], role: "user" }],
            generationConfig: { response_mime_type: "application/json" }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const match = text.match(/\[[\s\S]*?\]/);
      if (!match) throw new Error('No questions array found');

      const parsedQuestions = JSON.parse(match[0]);
      if (!Array.isArray(parsedQuestions)) throw new Error('Invalid questions format');

      setQuestions(parsedQuestions);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (answerText) => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;

    setLoading(true);
    try {
      const question = questions[currentQuestionIndex];
      const prompt = `You're an interview coach for final-year CS students. Provide CONCISE feedback (max 3 sentences) on this answer, then give a 4-line better answer example.

Resume Context: ${formattedResumeText.substring(0, 300)}...
${jobDescription ? `Job Requirements: ${jobDescription.substring(0, 200)}...` : ''}

Question: ${question}
Student's Answer: ${answerText}

Structure response EXACTLY like:
Feedback: [your feedback here]
Example Answer: [line1]\n[line2]\n[line3]\n[line4]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }], role: "user" }]
          })
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const feedbackMatch = generatedText.match(/Feedback:\s*(.*?)(?=\nExample Answer:|$)/s);
      const exampleMatch = generatedText.match(/Example Answer:\s*((?:.*\n){4})/s);

      const feedbackText = feedbackMatch ? feedbackMatch[1].trim() : "No feedback available";
      const exampleText = exampleMatch ? exampleMatch[1].trim() : "No example available";

      setFeedback(`Feedback: ${feedbackText}\n\nBetter Answer:\n${exampleText}`);
      speakText(feedbackText);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback('Failed to get feedback. Please try the next question.');
    } finally {
      setLoading(false);
    }
  };

  const transcribeAudioWithGemini = async (audioBlob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const base64Audio = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Transcribe the following audio. Return only the transcribed text without any additional commentary." },
                {
                  inlineData: {
                    mimeType: 'audio/webm',
                    data: base64Audio
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      return '';
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      audioChunksRef.current = [];
      mediaRecorder.start();
      setRecording(true);
      setFeedback(''); // Clear previous feedback
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const transcript = await transcribeAudioWithGemini(audioBlob);
      setTranscript(transcript);
      
      if (transcript) {
        await fetchFeedback(transcript);
      } else {
        setFeedback('No speech detected. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setFeedback('Could not process audio. Please try speaking again.');
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript('');
      setFeedback('');
    } else {
      setInterviewCompleted(true);
    }
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(-1);
    setQuestions([]);
    setTranscript('');
    setFeedback('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        AI Mock Interview Practice for Final Year Students
      </h2>

      {!interviewStarted ? (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Upload Resume (PDF): 
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleResumeUpload} 
                style={{ flex: 1, padding: '8px' }}
              />
              {resumeText && (
                <button 
                  onClick={() => setShowResume(!showResume)}
                  style={{ marginLeft: '10px', padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  {showResume ? 'Hide Resume' : 'View Resume'}
                </button>
              )}
            </div>
            {fileName && <p style={{ marginTop: '8px', fontSize: '14px' }}>Uploaded: {fileName}</p>}
          </div>

          {showResume && resumeText && (
  <div className="mb-6 border border-gray-200 rounded-lg shadow-sm p-4 max-h-96 overflow-y-auto bg-white">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold text-gray-800">Formatted Resume</h3>
      <button 
        onClick={() => navigator.clipboard.writeText(formattedResumeText)}
        className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        title="Copy to clipboard"
      >
        Copy
      </button>
    </div>
    <div className="font-mono text-sm leading-relaxed text-gray-700 p-3 bg-gray-50 rounded">
      <pre className="whitespace-pre-wrap break-words">
        {formattedResumeText}
      </pre>
    </div>
    <div className="mt-2 text-xs text-gray-500 flex justify-between">
      <span>{formattedResumeText?.length || 0} characters</span>
      <span>Scroll to view full content</span>
    </div>
  </div>
)}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Job Description (Optional):
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              placeholder="Paste job description here..."
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={generateQuestions}
              disabled={!resumeText || loading}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s',
                opacity: (!resumeText || loading) ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>
                  <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Generating Questions...
                </span>
              ) : 'Start Interview'}
            </button>
          </div>
        </div>
      ) : interviewCompleted ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#e8f5e9', borderRadius: '10px' }}>
          <h3 style={{ color: '#27ae60' }}>🎉 Interview Completed! 🎉</h3>
          <p>You've successfully answered all {questions.length} questions.</p>
          <button 
            onClick={resetInterview}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Start New Interview
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f7ff', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Question {currentQuestionIndex + 1} of {questions.length}</h3>
              <button
                onClick={() => speakText(questions[currentQuestionIndex])}
                style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Repeat Question
              </button>
            </div>
            <p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>
              {questions[currentQuestionIndex]}
            </p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={recording ? handleStopRecording : handleStartRecording}
              disabled={loading}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: recording ? '#e74c3c' : '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                minWidth: '200px'
              }}
            >
              {recording ? (
                <>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    background: '#fff', 
                    borderRadius: '50%', 
                    marginRight: '8px',
                    animation: 'pulse 1.5s infinite'
                  }}></div>
                  Stop Recording
                </>
              ) : (
                'Start Recording Answer'
              )}
            </button>
            <style>{`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>

          {loading && !feedback && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '15px 20px', 
                background: '#f0f7ff', 
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                Processing your answer...
              </div>
            </div>
          )}

          {transcript && !feedback && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Your Answer:</h4>
              <p style={{ margin: 0, lineHeight: '1.6' }}>{transcript}</p>
            </div>
          )}

          {feedback && (
            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>AI Feedback:</h4>
                <button
                  onClick={() => speakText(feedback)}
                  style={{ padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Read Feedback
                </button>
              </div>
              <div style={{
                padding: '20px',
                background: '#e8f5e9',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                borderLeft: '4px solid #2ecc71'
              }}>
                {feedback}
              </div>

              <div style={{ textAlign: 'center', marginTop: '25px' }}>
                <button
                  onClick={handleNextQuestion}
                  disabled={loading}
                  style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Interview'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js" />
      
    </div>
  );
};

export default Interview;
