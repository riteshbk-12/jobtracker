import { Play, Loader2 } from 'lucide-react';
export function InterviewLoading({interviewMode}) {
  return (
    <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                }}>
                    <Loader2 
                        size={48} 
                        style={{ 
                            color: '#2196F3', 
                            animation: 'spin 1s linear infinite',
                            marginBottom: '20px'
                        }} 
                    />
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>Preparing Your Interview...</h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                        Setting up questions for {interviewMode} mode
                    </p>
                </div>
  );
}