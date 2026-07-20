import { useState } from 'react'
import './index.css'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'reviewing' | 'accepted' | 'rejected'>('idle')

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    setStatus('generating');

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setResult(data.content);
      setStatus('reviewing');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (decision: 'accepted' | 'rejected') => {
    setStatus(decision);
    // In a real app, you might send this decision back to the server
    setTimeout(() => {
      setStatus('idle');
      setTopic('');
      setResult(null);
    }, 2000);
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1>Content Creator AI</h1>
        <p className="subtitle">Generate high-quality content instantly with Qwen</p>

        {status === 'idle' && (
          <div className="input-group">
            <textarea 
              placeholder="What would you like to create? (e.g. A TikTok video script about commercial espresso machines)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
            >
              ✨ Generate Content
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {status === 'generating' && (
          <div className="loader-container">
            <div className="spinner"></div>
            <h3>AI is thinking...</h3>
            <p style={{ color: '#94a3b8' }}>Crafting your masterpiece</p>
          </div>
        )}

        {status === 'reviewing' && result && (
          <div className="review-section">
            <h3>Review Generated Content</h3>
            <div className="result-content">
              {result}
            </div>
            <div className="action-buttons">
              <button className="btn-danger" onClick={() => handleDecision('rejected')}>
                ❌ Reject
              </button>
              <button className="btn-success" onClick={() => handleDecision('accepted')}>
                ✅ Accept
              </button>
            </div>
          </div>
        )}

        {status === 'accepted' && (
          <div className="loader-container">
            <h2 style={{ color: '#34d399' }}>✅ Content Accepted!</h2>
            <p>Saved successfully. Starting fresh...</p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="loader-container">
            <h2 style={{ color: '#fb7185' }}>❌ Content Rejected</h2>
            <p>Discarded. Starting fresh...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
