// We'll split the screens into these components:
// 1. ModeSelection
// 2. AnalyzingScreen
// 3. InterviewScreen
// 4. ResultsScreen

// Let's start by defining the structure and shared props. After this, each file can be further styled or enhanced.

// ModeSelection.jsx
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ModeSelection = () =>{ 

    const [interviewMode, setInterviewMode] = useState('text');

    const {state}=useLocation()

    const handleStartInterview = () => {}


    return(
  <div style={{ padding: '40px' }}>
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <h2 style={{ color: '#333', marginBottom: '15px' }}>Ready for Your Interview?</h2>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '20px' }}>
        <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>{state.title}</h3>
        <p style={{ color: '#666', margin: 0, lineHeight: 1.5, fontSize: '14px' }}>{state.description.substring(0, 150)}...</p>
      </div>
    </div>

    <div style={{ marginBottom: '30px' }}>
      <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
        Choose Your Interview Mode
      </label>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ value: 'text', label: 'Text Only', icon: '✏️' }, { value: 'voice', label: 'Voice Only', icon: '🎙️' }, { value: 'both', label: 'Text + Voice', icon: '🎤' }].map((mode) => (
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
  </div>
);}

export default ModeSelection;
