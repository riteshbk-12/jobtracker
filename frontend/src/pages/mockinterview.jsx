import React, { useState } from 'react';
import { Play, Loader2, Volume2, VolumeX, Send, Mic, MicOff, Square } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { InterviewLoading } from '../components/interviewloading';
import {v4 as uuidv4} from 'uuid';
import { sendInterviewAnswer } from '../features/services';
import {  startSpeechRecognition } from '../features/startlistening';

const ModeSelection = () => {
    const [interviewMode, setInterviewMode] = useState('text');
    const [interviewStarted, setInterviewStarted] = useState({
        started: false,
        loading: false,
        completed: false
    });
 
    const[nextQuestion, setNextQuestion] = useState("0");
    const[conversation, setConversation] = useState([]);
    const[inputText, setInputText] = useState("");
    const[sessionid]=useState(uuidv4());
    const[isSpeaking, setIsSpeaking] = useState(false);
    const[isSubmitting, setIsSubmitting] = useState(false);
    const[isListening, setIsListening] = useState(false);
    const[transcript, setTranscript] = useState("");
    const[speechRecognition, setSpeechRecognition] = useState(null);
    const { state } = useLocation();

    // Enhanced speech recognition functionality
  

    const stopSpeechRecognition = () => {
        if (speechRecognition) {
            speechRecognition.stop();
            setSpeechRecognition(null);
        }
        setIsListening(false);
    };

    // Simulate fetching next question based on mode
    const fetchNextQuestion = () => {
        if (!inputText.trim() && interviewMode !== 'voice') {
            alert('Please provide an answer before proceeding.');
            return;
        }

        setIsSubmitting(true);
        setConversation([...conversation, { question: nextQuestion, answer: inputText }]);
        setInputText("");
        setTranscript("");
        
        const response = sendInterviewAnswer({
            sessionId: sessionid,
            jobTitle: state?.title, 
            jobDescription: state?.description, 
            userAnswer: inputText ? inputText : ""
        });
        
        response.then((reply) => {
            console.log(reply);
            const questionMatch = reply.match(/"([^"]+)"/);
            setNextQuestion(questionMatch ? questionMatch[1]: "No question found");
        }).catch((error) => {
            console.error("Error fetching next question:", error);
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    // Enhanced function to handle question to speech conversion
    const speak = (text) => {
        if (isSpeaking) {
            // Stop speaking if already speaking
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice properties
        utterance.lang = 'en-US';
        utterance.pitch = 1;
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.volume = 0.8;

        // Event listeners
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synth.speak(utterance);
    };

    const handleStartInterview = () => {
        setInterviewStarted({ loading: true, started: false, completed: false });
        setTimeout(() => {
            setInterviewStarted({ loading: false, started: true, completed: false });
            const response = sendInterviewAnswer({
                sessionId: sessionid,
                jobTitle: state?.title, 
                jobDescription: state?.description, 
                userAnswer: inputText ? inputText : ""
            });
            
            response.then((reply) => {
                setNextQuestion(reply);
            }).catch((error) => {
                console.error("Error fetching next question:", error);
            });
        }, 4000);
    };

    const handleCompleteInterview = () => {
        // Stop any ongoing speech recognition
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

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#333', marginBottom: '15px' }}>Ready for Your Interview?</h2>
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '20px' }}>
                    <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>{state?.title}</h3>
                    <p style={{ color: '#666', margin: 0, lineHeight: 1.5, fontSize: '14px' }}>
                        {state?.description?.substring(0, 150)}...
                    </p>
                </div>
            </div>

            {interviewStarted.loading ? (
                // Loading Screen
                <InterviewLoading interviewMode={interviewMode} />
            ) : interviewStarted.started && nextQuestion ? (
                // Interview Screen
                <div style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    padding: '40px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <h3 style={{ color: '#2196F3', marginBottom: '20px' }}>Interview in Progress</h3>
                    
                    {/* Question Display */}
                    <div style={{ 
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginBottom: '30px',
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ color: '#333', margin: 0 }}>Question {conversation.length + 1}:</h4>
                            {(interviewMode === 'voice' || interviewMode === 'both') && (
                                <button
                                    onClick={() => speak(nextQuestion)}
                                    style={{
                                        backgroundColor: isSpeaking ? '#f44336' : '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.3s'
                                    }}
                                    title={isSpeaking ? 'Stop speaking' : 'Read question aloud'}
                                >
                                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    {isSpeaking ? 'Stop' : 'Speak'}
                                </button>
                            )}
                        </div>
                        <p style={{ color: '#555', lineHeight: 1.6, fontSize: '16px', margin: 0 }}>
                            {nextQuestion}
                        </p>
                    </div>

                    {/* Answer Input Section */}
                    {(interviewMode === 'text' || interviewMode === 'both') ? (
                        <div style={{ 
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '10px', 
                                fontWeight: 'bold', 
                                color: '#333' 
                            }}>
                                Your Answer:
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '2px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginTop: '10px' 
                            }}>
                                <small style={{ color: '#666' }}>
                                    Press Ctrl+Enter to submit quickly
                                </small>
                                <button
                                    onClick={fetchNextQuestion}
                                    disabled={isSubmitting || !inputText.trim()}
                                    style={{
                                        backgroundColor: isSubmitting || !inputText.trim() ? '#ccc' : '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: isSubmitting || !inputText.trim() ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Voice-only mode with enhanced transcript display
                        <div style={{ 
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '15px', 
                                fontWeight: 'bold', 
                                color: '#333' 
                            }}>
                                Voice Answer:
                            </label>
                            
                            {/* Voice Controls */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                marginBottom: '15px',
                                justifyContent: 'center'
                            }}>
                                {!isListening ? (
                                    <button
                                        onClick={()=>startSpeechRecognition({setlistening:setIsListening, settranscript:setTranscript, setinput:setInputText, setspeechrecognition:setSpeechRecognition})}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        <Mic size={18} />
                                        Start Speaking
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopSpeechRecognition}
                                        style={{
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.3s',
                                            animation: 'pulse 1.5s infinite'
                                        }}
                                    >
                                        <Square size={18} />
                                        Stop Listening
                                    </button>
                                )}
                            </div>

                            {/* Listening Status */}
                            {isListening && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    marginBottom: '15px',
                                    padding: '10px',
                                    backgroundColor: '#e8f5e8',
                                    borderRadius: '6px',
                                    border: '1px solid #4CAF50'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '8px',
                                        color: '#2e7d32'
                                    }}>
                                        <MicOff size={16} />
                                        <span style={{ fontWeight: 'bold' }}>Listening... Speak now</span>
                                    </div>
                                </div>
                            )}

                            {/* Transcript Display */}
                            <div style={{
                                minHeight: '120px',
                                padding: '12px',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                backgroundColor: '#f9f9f9',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                marginBottom: '15px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {transcript ? (
                                    <div>
                                        <strong style={{ color: '#333' }}>Transcript:</strong>
                                        <div style={{ marginTop: '8px', color: '#555' }}>
                                            {transcript}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        color: '#999', 
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        paddingTop: '40px'
                                    }}>
                                        {isListening ? 'Listening for your response...' : 'Click "Start Speaking" to begin your answer'}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button for Voice Mode */}
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={fetchNextQuestion}
                                    disabled={isSubmitting || !inputText.trim()}
                                    style={{
                                        backgroundColor: isSubmitting || !inputText.trim() ? '#ccc' : '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        cursor: isSubmitting || !inputText.trim() ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.3s',
                                        margin: '0 auto'
                                    }}
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {isSubmitting ? 'Submitting...' : 'Submit Voice Answer'}
                                </button>
                            </div>
                        </div>
                    )}

                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                        Mode: <strong>{interviewMode === 'both' ? 'Text + Voice' : interviewMode.charAt(0).toUpperCase() + interviewMode.slice(1)}</strong>
                    </p>
                    
                    <button
                        onClick={handleCompleteInterview}
                        style={{
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#F57C00'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#FF9800'}
                    >
                        Complete Interview
                    </button>
                </div>
            ) 
             : interviewStarted.completed ? (
                // Results Screen
                <div style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f0f8ff',
                    padding: '40px 20px',
                    borderRadius: '12px',
                    border: '1px solid #b3d9ff'
                }}>
                    <h3 style={{ color: '#2196F3', marginBottom: '20px' }}>Interview Completed! 🎉</h3>
                    <div style={{ 
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{ color: '#333', marginBottom: '15px' }}>Your Results:</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>85%</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Overall Score</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>8/10</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Questions Answered</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>12m</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Duration</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setInterviewStarted({ started: false, loading: false, completed: false })}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        Start New Interview
                    </button>
                </div>
            ) : (
                // Mode Selection Screen
                <>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
                            Choose Your Interview Mode
                        </label>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { value: 'text', label: 'Text Only', icon: '✏️' },
                                { value: 'voice', label: 'Voice Only', icon: '🎙️' },
                                { value: 'both', label: 'Text + Voice', icon: '🎤' }
                            ].map((mode) => (
                                <label key={mode.value} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '20px',
                                    border: `3px solid ${interviewMode === mode.value ? '#2196F3' : '#ddd'}`,
                                    borderRadius: '12px', backgroundColor: interviewMode === mode.value ? '#e3f2fd' : 'white',
                                    transition: 'all 0.3s', minWidth: '140px',
                                    boxShadow: interviewMode === mode.value ? '0 4px 12px rgba(33, 150, 243, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{mode.icon}</div>
                                    <input
                                        type="radio"
                                        value={mode.value}
                                        checked={interviewMode === mode.value}
                                        onChange={(e) => setInterviewMode(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: '#333' }}>{mode.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={handleStartInterview}
                            style={{
                                backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '8px',
                                fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                                gap: '10px', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)', transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Play size={20} />
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
            `}</style>
        </div>
    );
};

export default ModeSelection;