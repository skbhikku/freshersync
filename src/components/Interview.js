import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromPDF } from './resumeAnalysis';
import { Worker } from '@react-pdf-viewer/core';
import { 
  Mic, 
  MicOff, 
  Play, 
  Download, 
  Upload, 
  FileText, 
  Eye, 
  EyeOff,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

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
  const [interviewData, setInterviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const prompt = `Generate exactly 15 interview questions for a final-year computer science student. Follow these rules:

1. First question MUST be: "Can you please introduce yourself?"
2. Questions 2-8: Basic technical questions based ONLY on programming languages and technologies mentioned in the resume
3. Questions 9-12: Project-based questions from the resume
4. Questions 13-15: General behavioral questions for freshers
${jobDescription ? `5. Include 2-3 questions related to: ${jobDescription}` : ''}

IMPORTANT: 
- Keep technical questions BASIC level (suitable for freshers)
- Focus only on technologies explicitly mentioned in resume
- No advanced system design or complex algorithms
- Questions should be answerable by a final-year student

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
            generationConfig: { 
              response_mime_type: "application/json",
              temperature: 0.3
            }
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
      setInterviewData([]);
      
      // Automatically speak the first question
      setTimeout(() => {
        speakText(parsedQuestions[0]);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (answerText) => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;

    setIsProcessing(true);
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

      const fullFeedback = `Feedback: ${feedbackText}\n\nBetter Answer:\n${exampleText}`;
      setFeedback(fullFeedback);
      
      // Store interview data
      const newInterviewEntry = {
        questionNumber: currentQuestionIndex + 1,
        question: question,
        userAnswer: answerText,
        feedback: fullFeedback,
        timestamp: new Date().toLocaleString()
      };
      
      setInterviewData(prev => [...prev, newInterviewEntry]);
      
      // Speak feedback
      speakText(feedbackText);
      
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback('Failed to get feedback. Please try the next question.');
    } finally {
      setIsProcessing(false);
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
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.includes('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
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
    setIsProcessing(true);
    try {
      const transcript = await transcribeAudioWithGemini(audioBlob);
      setTranscript(transcript);
      
      if (transcript) {
        await fetchFeedback(transcript);
      } else {
        setFeedback('No speech detected. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setFeedback('Could not process audio. Please try speaking again.');
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript('');
      setFeedback('');
      
      // Automatically speak the next question
      setTimeout(() => {
        speakText(questions[currentQuestionIndex + 1]);
      }, 500);
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
    setInterviewData([]);
  };

  const downloadInterviewReport = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('AI Mock Interview Report', 20, yPosition);
    yPosition += 15;

    // Date
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;

    // Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Interview Summary:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Questions: ${interviewData.length}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Duration: Approximately ${interviewData.length * 3} minutes`, 20, yPosition);
    yPosition += 15;

    // Questions and Answers
    interviewData.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Question
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Q${item.questionNumber}: ${item.question}`, 20, yPosition);
      yPosition += 8;

      // User Answer
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Your Answer:', 20, yPosition);
      yPosition += 5;
      
      const answerLines = doc.splitTextToSize(item.userAnswer, 170);
      doc.text(answerLines, 20, yPosition);
      yPosition += answerLines.length * 4 + 5;

      // Feedback
      doc.setFont(undefined, 'bold');
      doc.text('AI Feedback:', 20, yPosition);
      yPosition += 5;
      
      doc.setFont(undefined, 'normal');
      const feedbackLines = doc.splitTextToSize(item.feedback, 170);
      doc.text(feedbackLines, 20, yPosition);
      yPosition += feedbackLines.length * 4 + 10;

      // Separator
      if (index < interviewData.length - 1) {
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(`AI_Interview_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-speak question when it changes
  useEffect(() => {
    if (interviewStarted && currentQuestionIndex >= 0 && questions[currentQuestionIndex]) {
      const timer = setTimeout(() => {
        speakText(questions[currentQuestionIndex]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, interviewStarted, questions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🤖 AI Mock Interview Practice
          </h1>
          <p className="text-lg text-gray-600">
            Prepare for your dream job with AI-powered interview simulation
          </p>
        </div>

        {!interviewStarted ? (
          /* Setup Phase */
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Resume Upload */}
            <div className="mb-8">
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Upload className="w-5 h-5 mr-2" />
                Upload Resume (PDF)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleResumeUpload} 
                  className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                />
                {resumeText && (
                  <button 
                    onClick={() => setShowResume(!showResume)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {showResume ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showResume ? 'Hide' : 'View'} Resume
                  </button>
                )}
              </div>
              {fileName && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Uploaded: {fileName}
                </p>
              )}
            </div>

            {/* Resume Preview */}
            {showResume && resumeText && (
              <div className="mb-8 border border-gray-200 rounded-lg shadow-sm p-4 max-h-96 overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Formatted Resume
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(formattedResumeText)}
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-sm leading-relaxed text-gray-700 p-3 bg-white rounded">
                  <pre className="whitespace-pre-wrap break-words">
                    {formattedResumeText}
                  </pre>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Paste the job description here to get more targeted questions..."
              />
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={generateQuestions}
                disabled={!resumeText || loading}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start AI Interview
                  </>
                )}
              </button>
            </div>
          </div>
        ) : interviewCompleted ? (
          /* Completion Phase */
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                🎉 Interview Completed!
              </h2>
              <p className="text-lg text-gray-600">
                You've successfully answered all {questions.length} questions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={downloadInterviewReport}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report (PDF)
              </button>
              <button 
                onClick={resetInterview}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Start New Interview
              </button>
            </div>
          </div>
        ) : (
          /* Interview Phase */
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Question {currentQuestionIndex + 1}
                </h3>
                <button
                  onClick={() => speakText(questions[currentQuestionIndex])}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Repeat Question"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Speak
                </button>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {questions[currentQuestionIndex]}
              </p>
            </div>

            {/* Recording Controls */}
            <div className="text-center mb-8">
              <button
                onClick={recording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                className={`inline-flex items-center px-8 py-4 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  recording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {recording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      Stop Recording
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording Answer
                  </>
                )}
              </button>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-lg">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                  <span className="text-blue-700 font-medium">Processing your answer...</span>
                </div>
              </div>
            )}

            {/* User Answer */}
            {transcript && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Mic className="w-4 h-4 mr-2" />
                  Your Answer:
                </h4>
                <p className="text-gray-700 leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* AI Feedback */}
            {feedback && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    🤖 AI Feedback:
                  </h4>
                  <button
                    onClick={() => speakText(feedback)}
                    className="flex items-center px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Listen
                  </button>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                    {feedback}
                  </pre>
                </div>

                {/* Next Question Button */}
                <div className="text-center mt-6">
                  <button
                    onClick={handleNextQuestion}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finish Interview
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js" />
      </div>
    </div>
  );
};

export default Interview;