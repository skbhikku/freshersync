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
  const [readingFeedback, setReadingFeedback] = useState(false);
  const [feedbackProgress, setFeedbackProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Speak question when it changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= 0 && interviewStarted) {
      speakQuestion(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, questions, interviewStarted]);

  const startProgressAnimation = (duration) => {
    setFeedbackProgress(0);
    setReadingFeedback(true);
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setFeedbackProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
        setReadingFeedback(false);
        setFeedbackProgress(0);
      }
    }, 50);
  };

  const speakQuestion = (question) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Estimate duration for progress animation
      const words = text.split(' ').length;
      const estimatedDuration = (words / 2.25) * 1000; // Approximate 3 words per second
      
      utterance.onstart = () => startProgressAnimation(estimatedDuration);
      utterance.onend = () => {
        setReadingFeedback(false);
        setFeedbackProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

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
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      console.error("Invalid rawText provided");
      return rawText;
    }

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
              temperature: 0.2,
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
          signal: AbortSignal.timeout(15000)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const formattedResume = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                             data?.text?.trim() || 
                             rawText;

      if (formattedResume === rawText || 
          formattedResume.length < 100 || 
          !formattedResume.includes('##') || 
          !formattedResume.includes('•')) {
        console.warn("Formatting failed validation checks, returning original");
        return rawText;
      }

      return formattedResume
          .replace(/\n\s*\n/g, '\n\n')
          .replace(/\[.*?\]/g, '')
          .trim();
    } catch (error) {
      console.error("Error formatting resume:", error.message);
      return rawText;
    }
  };

  const generateQuestions = async () => {
    if (!formattedResumeText) {
      alert("Please upload your resume first");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate exactly 20 interview questions for a final-year student. Follow these rules:
1. First question MUST be: "Can you please introduce yourself?"
2. Remaining 19 questions should be strictly based ONLY on:
   - Only include technical skills in the resume. Ask basic questions related to programming languages only simple questions.
   ${jobDescription ? `- Job requirements from: ${jobDescription}` : ''}

Resume Text:
${formattedResumeText.substring(0, 5000)}...

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
      const isTechnical = /(how|what|explain|define|difference between|algorithm|code|programming|technology)/i.test(question);

      const prompt = `You're a friendly career coach evaluating interview answers. Provide:
1. Score (1-10) based on:
   - Technical accuracy (if technical question)
   - Clarity and structure
   - Relevance to resume
   - Confidence demonstrated
2.${isTechnical ? " Simple explanation of the concept\n" : ""}
3. Constructive feedback (max 3 sentences)
4. Better answer example (4 lines)

SCORING GUIDE:
9-10 = Excellent (complete, accurate, well-structured)
7-8 = Good (minor improvements needed)
5-6 = Average (needs more depth/structure)
1-4 = Needs work (incomplete/unclear)

Question: ${question}
Answer: ${answerText}
Resume Context: ${formattedResumeText.substring(0, 300)}...
${jobDescription ? `Job Requirements: ${jobDescription.substring(0, 200)}...` : ''}

Respond in EXACTLY this format:
Score: [X]/10
${isTechnical ? "Concept: [2-line explanation]\n" : ""}Feedback: [your feedback]
Example: [line1]\n[line2]\n[line3]\n[line4]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }], role: "user" }],
            generationConfig: {
              temperature: 0.3
            }
          })
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const scoreMatch = generatedText.match(/Score:\s*(\d+)\/10/);
      const score = scoreMatch ? scoreMatch[1] : '5';
      
      const explanation = isTechnical && generatedText.includes('Concept:') 
        ? generatedText.split('Concept:')[1]?.split('Feedback:')[0]?.trim()
        : null;
      
      const feedbackText = generatedText.includes('Feedback:') 
        ? generatedText.split('Feedback:')[1]?.split('Example:')[0]?.trim()
        : "Good attempt! Try to structure your answer better.";
      
      const exampleText = generatedText.includes('Example:')
        ? generatedText.split('Example:')[1]?.trim()
        : "1. Start with a clear statement\n2. Provide relevant example\n3. Relate to your experience\n4. Conclude confidently";

      const scoreVisual = '⭐'.repeat(score) + '☆'.repeat(10-score);
      let fullFeedback = `🎯 Score: ${score}/10\n${scoreVisual}\n\n`;
      
      if (explanation) {
        fullFeedback += `📚 Concept:\n${explanation}\n\n`;
      }
      
      fullFeedback += `💡 Feedback:\n${feedbackText}\n\n🌟 Example Answer:\n${exampleText}`;

      setFeedback(fullFeedback);
      
      const speechText = [
        `You scored ${score} out of 10.`,
        explanation && `About the concept: ${explanation.replace(/\n/g, ' ')}`,
        `Feedback: ${feedbackText.replace(/\n/g, ' ')}`
      ].filter(Boolean).join(' ');
      
      speakText(speechText);

    } catch (error) {
      console.error('Error:', error);
      setFeedback("🚧 Evaluation Error\nDefault Score: 5/10\n⭐⭐⭐⭐⭐☆☆☆☆☆\nTips:\n1. Be specific\n2. Use examples\n3. Stay concise");
    } finally {
      setLoading(false);
    }
  };

  const transcribeAudioWithGemini = async (audioBlob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const base64Audio = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      setFeedback('');
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript('');
      setFeedback('');
    } else {
      setInterviewCompleted(true);
    }
  };

  const resetInterview = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(-1);
    setQuestions([]);
    setTranscript('');
    setFeedback('');
  };
  return (
<div className="min-h-screen pt-[70px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🎯 AI Mock Interview Platform
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Practice with AI-powered interviews tailored for final year students. Get instant feedback and improve your skills!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!interviewStarted ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-bold">📄</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Upload Your Resume</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Resume (PDF Only):
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <span className="text-blue-600 text-xl">📤</span>
                      </div>
                      <p className="text-gray-600 font-medium">Click to upload PDF</p>
                      <p className="text-sm text-gray-500 mt-1">Maximum size: 10MB</p>
                    </div>
                  </label>
                </div>
                
                {fileName && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        <span className="text-green-800 font-medium">{fileName}</span>
                      </div>
                      {resumeText && (
                        <button
                          onClick={() => setShowResume(!showResume)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {showResume ? 'Hide' : 'Preview'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showResume && resumeText && (
                <div className="mb-6 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <span className="mr-2">📋</span>
                      Formatted Resume
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(formattedResumeText)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 bg-white">
                    <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 font-mono">
                      {formattedResumeText}
                    </pre>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between border-t border-gray-200">
                    <span>{formattedResumeText?.length || 0} characters</span>
                    <span>Scroll to view full content</span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-bold">💼</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Job Description (Optional):
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Paste the job description here to get more targeted questions..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Adding a job description will generate more relevant interview questions
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={generateQuestions}
                  disabled={!resumeText || loading}
                  className={`relative px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${(!resumeText || loading) ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Generating Questions...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      🚀 Start Interview
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : interviewCompleted ? (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 lg:p-12 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                You've successfully completed all {questions.length} questions. Great job on finishing your mock interview!
              </p>
              <button
                onClick={resetInterview}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔄 Start New Interview
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-600">Interview Progress</span>
                <span className="text-sm font-semibold text-blue-600">
                  {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-8 border border-gray-100 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {currentQuestionIndex + 1}
                    </span>
                    Question {currentQuestionIndex + 1}
                  </h3>
                  <button
                    onClick={() => speakQuestion(questions[currentQuestionIndex])}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    🔊 Repeat
                  </button>
                </div>
                <p className="text-lg font-medium text-gray-800 leading-relaxed">
                  {questions[currentQuestionIndex]}
                </p>
              </div>

              {/* Recording Controls */}
              <div className="text-center mb-8">
                <button
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  disabled={loading}
                  className={`relative px-8 py-4 ${recording ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-green-500 to-blue-600'} text-white font-bold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-[220px]`}
                >
                  {recording ? (
                    <span className="flex items-center justify-center">
                      <div className="relative flex h-4 w-4 mr-3">
                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></div>
                        <div className="relative inline-flex rounded-full h-4 w-4 bg-white"></div>
                      </div>
                      Stop Recording
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      🎤 Start Recording
                    </span>
                  )}
                </button>
              </div>

              {/* Loading State */}
              {loading && !feedback && (
                <div className="text-center my-6">
                  <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-blue-800 font-medium">Processing your answer...</span>
                  </div>
                </div>
              )}

              {/* Transcript Display */}
              {transcript && !feedback && (
                <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💬</span>
                    Your Answer:
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{transcript}</p>
                </div>
              )}

              {/* Feedback Section */}
              {feedback && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h4 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-2">🤖</span>
                      AI Feedback
                    </h4>
                    <button
                      onClick={() => speakText(feedback)}
                      disabled={readingFeedback}
                      className={`px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center ${readingFeedback ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {readingFeedback ? '🔊 Reading...' : '🔊 Read Aloud'}
                    </button>
                  </div>

                  {/* Progress line for reading feedback */}
                  {readingFeedback && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-purple-600 font-medium mr-2">🎵 Reading Progress:</span>
                        <span className="text-sm text-gray-600">{Math.round(feedbackProgress)}%</span>
                      </div>
                      <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-out relative"
                          style={{ width: `${feedbackProgress}%` }}
                        >
                          <div className="absolute right-0 top-0 h-full w-2 bg-white opacity-70 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-l-4 border-green-500">
                    <pre className="whitespace-pre-wrap break-words text-gray-800 leading-relaxed font-sans">
                      {feedback}
                    </pre>
                  </div>

                  <div className="text-center pt-6">
                    <button
                      onClick={handleNextQuestion}
                      disabled={loading}
                      className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}`}
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <span className="flex items-center justify-center">
                          Next Question →
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          🏁 Finish Interview
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js" />
      </div>
    </div>
  );
};

export default Interview;
