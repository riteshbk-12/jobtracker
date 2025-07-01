import React, { useState } from 'react';
import { Play, Loader2, Volume2, VolumeX, Send, Mic, MicOff, Square, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { InterviewLoading } from '../components/interviewloading';
import { v4 as uuidv4 } from 'uuid';
import { sendInterviewAnswer } from '../features/services';
import { startSpeechRecognition } from '../features/startlistening';

const ModeSelection = () => {
    const [interviewMode, setInterviewMode] = useState('text');
    const [interviewStarted, setInterviewStarted] = useState({
        started: false,
        loading: false,
        completed: false
    });
 
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [questionHistory, setQuestionHistory] = useState([]);
    const [inputText, setInputText] = useState("");
    const [sessionid] = useState(uuidv4());
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [speechRecognition, setSpeechRecognition] = useState(null);
    const [interviewData, setInterviewData] = useState({
        feedback: null,
        improvedAnswer: null,
        nextQuestion: null,
        isFirstQuestion: true
    });
    const { state } = useLocation();

    const stopSpeechRecognition = () => {
        if (speechRecognition) {
            speechRecognition.stop();
            setSpeechRecognition(null);
        }
        setIsListening(false);
    };

    // Enhanced function to handle submission with structured response
    const fetchNextQuestion = async () => {
        if (!inputText.trim() && interviewMode !== 'voice') {
            alert('Please provide an answer before proceeding.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await sendInterviewAnswer({
                sessionId: sessionid,
                jobTitle: state?.title, 
                jobDescription: state?.description, 
                userAnswer: inputText,
                isFirstQuestion: questionHistory.length === 0
            });

            console.log('Structured Response:', response);

            // Update question history with the current Q&A and feedback
            if (questionHistory.length > 0) {
                setQuestionHistory(prev => {
                    const updated = [...prev];
                    const currentIndex = updated.length - 1;
                    updated[currentIndex] = {
                        ...updated[currentIndex],
                        answer: inputText,
                        feedback: response.feedback || '',
                        improvedAnswer: response.improvedAnswer || ''
                    };
                    return updated;
                });
            }

            // Add new question if exists
            if (response.nextQuestion) {
                setCurrentQuestion(response.nextQuestion);
                setQuestionHistory(prev => [...prev, {
                    question: response.nextQuestion,
                    answer: '',
                    feedback: '',
                    improvedAnswer: ''
                }]);
            } else {
                // Interview completed
                setInterviewStarted({ loading: false, started: false, completed: true });
            }

            setInterviewData(response);
            setInputText("");
            setTranscript("");
            
        } catch (error) {
            console.error("Error fetching next question:", error);
            alert('Failed to get next question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Enhanced function to handle question to speech conversion
    const speak = (text) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'en-US';
        utterance.pitch = 1;
        utterance.rate = 0.9;
        utterance.volume = 0.8;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synth.speak(utterance);
    };

    const handleStartInterview = async () => {
        setInterviewStarted({ loading: true, started: false, completed: false });
        
        try {
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const response = await sendInterviewAnswer({
                sessionId: sessionid,
                jobTitle: state?.title, 
                jobDescription: state?.description, 
                userAnswer: "",
                isFirstQuestion: true
            });
            console.log('Initial Question Response:', response);
            setCurrentQuestion(response.nextQuestion || "Could not load first question");
            setQuestionHistory([{
                question: response.nextQuestion || "Could not load first question",
                answer: '',
                feedback: '',
                improvedAnswer: ''
            }]);
            setInterviewData(response);
            setInterviewStarted({ loading: false, started: true, completed: false });
            
        } catch (error) {
            console.error("Error starting interview:", error);
            alert('Failed to start interview. Please try again.');
            setInterviewStarted({ loading: false, started: false, completed: false });
        }
    };

    const handleCompleteInterview = () => {
        if (isListening) {
            stopSpeechRecognition();
        }
        setInterviewStarted({ loading: false, started: false, completed: true });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            fetchNextQuestion();
        }
    };

    const getCurrentQuestionData = () => {
        return questionHistory[questionHistory.length - 1] || {};
    };

    const getPreviousQuestions = () => {
        return questionHistory.slice(0, -1);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '28px' }}>AI Mock Interview Platform</h2>
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', marginBottom: '20px' }}>
                    <h3 style={{ color: '#2196F3', margin: '0 0 10px 0', fontSize: '20px' }}>{state?.title}</h3>
                    <p style={{ color: '#666', margin: 0, lineHeight: 1.5, fontSize: '14px' }}>
                        {state?.description?.substring(0, 200)}...
                    </p>
                </div>
            </div>

            {interviewStarted.loading ? (
                <InterviewLoading interviewMode={interviewMode} />
            ) : interviewStarted.started && currentQuestion ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Interview Progress */}
                    <div style={{ 
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Interview Progress</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                    Question {questionHistory.length} • Mode: {interviewMode.charAt(0).toUpperCase() + interviewMode.slice(1)}
                                </p>
                            </div>
                            <button
                                onClick={handleCompleteInterview}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                Complete Interview
                            </button>
                        </div>
                    </div>

                    {/* Previous Questions History */}
                    {getPreviousQuestions().map((item, index) => (
                        <div key={index} style={{ 
                            backgroundColor: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #e9ecef'
                        }}>
                            <h4 style={{ color: '#495057', margin: '0 0 15px 0' }}>Question {index + 1}:</h4>
                            <p style={{ color: '#6c757d', margin: '0 0 15px 0', fontSize: '14px' }}>{item.question}</p>
                            
                            {item.answer && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h5 style={{ color: '#495057', margin: '0 0 8px 0', fontSize: '14px' }}>Your Answer:</h5>
                                    <p style={{ color: '#6c757d', margin: 0, fontSize: '13px', backgroundColor: 'white', padding: '10px', borderRadius: '6px' }}>
                                        {item.answer}
                                    </p>
                                </div>
                            )}

                            {item.feedback && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h5 style={{ color: '#28a745', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={16} /> Feedback:
                                    </h5>
                                    <p style={{ color: '#155724', margin: 0, fontSize: '13px', backgroundColor: '#d4edda', padding: '10px', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                                        {item.feedback}
                                    </p>
                                </div>
                            )}

                            {item.improvedAnswer && (
                                <div>
                                    <h5 style={{ color: '#ffc107', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <AlertCircle size={16} /> Improved Answer:
                                    </h5>
                                    <p style={{ color: '#856404', margin: 0, fontSize: '13px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                                        {item.improvedAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Current Question */}
                    <div style={{ 
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        border: '2px solid #2196F3',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <h4 style={{ color: '#2196F3', margin: 0, fontSize: '18px' }}>
                                Current Question {questionHistory.length}:
                            </h4>
                            {(interviewMode === 'voice' || interviewMode === 'both') && (
                                <button
                                    onClick={() => speak(currentQuestion)}
                                    style={{
                                        backgroundColor: isSpeaking ? '#f44336' : '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    {isSpeaking ? 'Stop' : 'Speak'}
                                </button>
                            )}
                        </div>
                        
                        <div style={{ 
                            backgroundColor: '#e3f2fd',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '25px',
                            border: '1px solid #bbdefb'
                        }}>
                            <p style={{ color: '#1565c0', lineHeight: 1.6, fontSize: '16px', margin: 0 }}>
                                {currentQuestion}
                            </p>
                        </div>

                        {/* Answer Input Section */}
                        {(interviewMode === 'text' || interviewMode === 'both') ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '12px', 
                                    fontWeight: '600', 
                                    color: '#333',
                                    fontSize: '16px'
                                }}>
                                    Your Answer:
                                </label>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your detailed answer here... (Ctrl+Enter to submit quickly)"
                                    style={{
                                        width: '100%',
                                        minHeight: '140px',
                                        padding: '15px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'border-color 0.3s',
                                        boxSizing: 'border-box',
                                        lineHeight: '1.5'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginTop: '12px',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    <small style={{ color: '#666', fontSize: '13px' }}>
                                        💡 Press Ctrl+Enter to submit quickly
                                    </small>
                                    <button
                                        onClick={fetchNextQuestion}
                                        disabled={isSubmitting || !inputText.trim()}
                                        style={{
                                            backgroundColor: isSubmitting || !inputText.trim() ? '#ccc' : '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            cursor: isSubmitting || !inputText.trim() ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {isSubmitting ? 'Processing...' : 'Submit Answer'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Voice-only mode
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '15px', 
                                    fontWeight: '600', 
                                    color: '#333',
                                    fontSize: '16px'
                                }}>
                                    Voice Answer:
                                </label>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '12px', 
                                    marginBottom: '20px',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    {!isListening ? (
                                        <button
                                            onClick={() => startSpeechRecognition({
                                                setlistening: setIsListening, 
                                                settranscript: setTranscript, 
                                                setinput: setInputText, 
                                                setspeechrecognition: setSpeechRecognition
                                            })}
                                            style={{
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                padding: '14px 28px',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                transition: 'background-color 0.3s'
                                            }}
                                        >
                                            <Mic size={20} />
                                            Start Speaking
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopSpeechRecognition}
                                            style={{
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                                border: 'none',
                                                padding: '14px 28px',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                transition: 'background-color 0.3s',
                                                animation: 'pulse 1.5s infinite'
                                            }}
                                        >
                                            <Square size={20} />
                                            Stop Listening
                                        </button>
                                    )}
                                </div>

                                {isListening && (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        marginBottom: '20px',
                                        padding: '15px',
                                        backgroundColor: '#e8f5e8',
                                        borderRadius: '8px',
                                        border: '2px solid #4CAF50'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '10px',
                                            color: '#2e7d32'
                                        }}>
                                            <Mic size={20} />
                                            <span style={{ fontWeight: '600', fontSize: '16px' }}>Listening... Speak clearly</span>
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    minHeight: '140px',
                                    padding: '15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '15px',
                                    lineHeight: '1.5',
                                    marginBottom: '20px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {transcript ? (
                                        <div>
                                            <strong style={{ color: '#333', fontSize: '14px' }}>Live Transcript:</strong>
                                            <div style={{ marginTop: '10px', color: '#555' }}>
                                                {transcript}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            color: '#999', 
                                            fontStyle: 'italic',
                                            textAlign: 'center',
                                            paddingTop: '50px'
                                        }}>
                                            {isListening ? '🎤 Listening for your response...' : 'Click "Start Speaking" to begin your voice answer'}
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={fetchNextQuestion}
                                        disabled={isSubmitting || !inputText.trim()}
                                        style={{
                                            backgroundColor: isSubmitting || !inputText.trim() ? '#ccc' : '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px 28px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            cursor: isSubmitting || !inputText.trim() ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'background-color 0.3s',
                                            margin: '0 auto'
                                        }}
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        {isSubmitting ? 'Processing Voice...' : 'Submit Voice Answer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : interviewStarted.completed ? (
                // Results Screen
                <div style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f0f8ff',
                    padding: '40px 20px',
                    borderRadius: '12px',
                    border: '1px solid #b3d9ff'
                }}>
                    <h3 style={{ color: '#2196F3', marginBottom: '20px', fontSize: '24px' }}>🎉 Interview Completed!</h3>
                    <div style={{ 
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        marginBottom: '30px'
                    }}>
                        <h4 style={{ color: '#333', marginBottom: '20px' }}>Interview Summary:</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{questionHistory.length}</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Questions Answered</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{interviewMode}</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Interview Mode</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>✓</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Status: Complete</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setInterviewStarted({ started: false, loading: false, completed: false });
                                setQuestionHistory([]);
                                setCurrentQuestion("");
                                setInputText("");
                                setTranscript("");
                            }}
                            style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <RotateCcw size={18} />
                            Start New Interview
                        </button>
                    </div>
                </div>
            ) : (
                // Mode Selection Screen
                <>
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '25px', color: '#333', fontSize: '20px' }}>
                            Choose Your Interview Mode
                        </h3>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { value: 'text', label: 'Text Only', icon: '✏️', desc: 'Type your answers' },
                                { value: 'voice', label: 'Voice Only', icon: '🎙️', desc: 'Speak your answers' },
                                { value: 'both', label: 'Text + Voice', icon: '🎤', desc: 'Mixed mode available' }
                            ].map((mode) => (
                                <label key={mode.value} style={{
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    padding: '25px 20px',
                                    border: `3px solid ${interviewMode === mode.value ? '#2196F3' : '#ddd'}`,
                                    borderRadius: '16px', 
                                    backgroundColor: interviewMode === mode.value ? '#e3f2fd' : 'white',
                                    transition: 'all 0.3s', 
                                    minWidth: '160px',
                                    boxShadow: interviewMode === mode.value ? '0 6px 20px rgba(33, 150, 243, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{mode.icon}</div>
                                    <input
                                        type="radio"
                                        value={mode.value}
                                        checked={interviewMode === mode.value}
                                        onChange={(e) => setInterviewMode(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '16px', marginBottom: '5px' }}>
                                        {mode.label}
                                    </span>
                                    <span style={{ color: '#666', fontSize: '13px', textAlign: 'center' }}>
                                        {mode.desc}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={handleStartInterview}
                            style={{
                                backgroundColor: '#2196F3', 
                                color: 'white', 
                                border: 'none', 
                                padding: '18px 40px', 
                                borderRadius: '12px',
                                fontSize: '18px', 
                                fontWeight: '600', 
                                cursor: 'pointer', 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: '12px', 
                                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)', 
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.3)';
                            }}
                        >
                            <Play size={22} />
                            Start Mock Interview
                        </button>
                    </div>
                </>
            )}
            
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModeSelection;