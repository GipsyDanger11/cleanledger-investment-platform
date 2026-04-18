import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import './AuthPage.css';

/* ─── Voice Panel Component ─── */
function VoicePanel({ onClose, onAuthSuccess }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');       // idle | listening | thinking
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with greeting
  useEffect(() => {
    const greeting = "Good day. I'm JARVIS, your CleanLedger assistant. Would you like to log in or create a new account? Tap the microphone and speak.";
    setMessages([{ role: 'assistant', content: greeting }]);
    speak(greeting);
  }, []);

  const speak = (text) => {
    // Clean any JSON blocks from speech
    const cleanText = text.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
    if (!cleanText) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    // Try to find a good English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes('Google UK English Male'))
      || voices.find(v => v.name.includes('Daniel'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    synthRef.current.speak(utterance);
  };

  const sendToMistral = useCallback(async (userText) => {
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setStatus('thinking');

    try {
      const { data } = await apiClient.post('/voice/chat', {
        messages: newMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      });

      const aiResponse = data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setStatus('idle');
      speak(aiResponse);

      // Check if Mistral returned login/register JSON
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.action === 'login' && parsed.email && parsed.password) {
            onAuthSuccess({ action: 'login', email: parsed.email, password: parsed.password });
          } else if (parsed.action === 'register' && parsed.email && parsed.password && parsed.name) {
            onAuthSuccess({
              action: 'register',
              name: parsed.name,
              email: parsed.email,
              password: parsed.password,
              role: parsed.role || 'investor',
            });
          }
        } catch {}
      }
    } catch (err) {
      const errorMsg = 'I apologize, I encountered a connectivity issue. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      setStatus('idle');
      speak(errorMsg);
    }
  }, [messages, onAuthSuccess]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendToMistral(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') setStatus('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const orbClass = `voice-orb ${status === 'listening' ? 'voice-orb--listening' : ''} ${status === 'thinking' ? 'voice-orb--thinking' : ''}`;

  return (
    <div className="voice-panel">
      <div className="voice-panel__scanline" />
      <button className="voice-panel__close" onClick={onClose} aria-label="Close voice panel">
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="voice-panel__inner">
        <div className={orbClass}>
          <div className="voice-orb__ring" />
          <div className="voice-orb__ring" />
          <div className="voice-orb__ring" />
          <div className="voice-orb__core" />
        </div>

        <div className={`voice-status ${status === 'listening' ? 'voice-status--listening' : ''} ${status === 'thinking' ? 'voice-status--thinking' : ''}`}>
          {status === 'idle' && 'Ready'}
          {status === 'listening' && 'Listening...'}
          {status === 'thinking' && 'Processing...'}
        </div>

        <div className="voice-chat">
          {messages.map((msg, i) => (
            <div key={i} className={`voice-msg voice-msg--${msg.role === 'assistant' ? 'ai' : 'user'}`}>
              {msg.content.replace(/```json[\s\S]*?```/g, '').trim()}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="voice-actions">
          <button
            className={`voice-mic-btn ${isListening ? 'voice-mic-btn--active' : ''}`}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <span className="material-symbols-outlined">
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Auth Page ─── */
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';
  const initialRole = searchParams.get('role') || 'investor';

  const [mode, setMode] = useState(initialMode);    // login | signup
  const [role, setRole] = useState(initialRole);     // investor | startup
  const [showVoice, setShowVoice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fillDemo = (type) => {
    setMode('login');
    setError('');
    if (type === 'investor') {
      setEmail('james.whitfield@capital.com');
      setPassword('Investor1234!');
    } else {
      setEmail('priya.mehta@aurawind.com');
      setPassword('Founder1234!');
    }
  };
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');

  const { user, login: authLogin, register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getPostAuthRoute = (u) => {
    if (!u) return '/dashboard';
    if (u.role === 'admin') return '/admin';
    return '/dashboard';
  };

  useEffect(() => {
    if (isAuthenticated && user) navigate(getPostAuthRoute(user), { replace: true });
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedInUser = await authLogin(email, password);
        navigate(getPostAuthRoute(loggedInUser), { replace: true });
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        const formData = {
          name,
          email,
          password,
          role,
          ...(role === 'startup'
            ? {
                companyName,
                sector,
                category: sector,
                organization: companyName,
              }
            : {}),
        };
        const createdUser = await authRegister(formData);
        navigate(getPostAuthRoute(createdUser), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceAuth = async ({ action, email: vEmail, password: vPassword, name: vName, role: vRole }) => {
    setError('');
    setLoading(true);
    try {
      if (action === 'login') {
        const loggedInUser = await authLogin(vEmail, vPassword);
        navigate(getPostAuthRoute(loggedInUser), { replace: true });
      } else {
        const createdUser = await authRegister({ name: vName, email: vEmail, password: vPassword, role: vRole || 'investor' });
        navigate(getPostAuthRoute(createdUser), { replace: true });
      }
      setShowVoice(false);
    } catch (err) {
      setError(err.message || 'Voice authentication failed.');
      setShowVoice(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Effects */}
      <div className="auth-page__grid" />
      <div className="auth-page__particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="auth-page__particle" />
        ))}
      </div>

      {/* Back link */}
      <Link to="/" className="auth-back">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Home
      </Link>

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__mark">CL</div>
          <div className="auth-logo__text">CleanLedger</div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' && role === 'startup' ? 'auth-tab--active' : ''}`}
              onClick={() => { setMode('signup'); setRole('startup'); setError(''); }}
            >
              Startup
            </button>
            <button
              className={`auth-tab ${mode === 'signup' && role === 'investor' ? 'auth-tab--active' : ''}`}
              onClick={() => { setMode('signup'); setRole('investor'); setError(''); }}
            >
              Investor
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-field__label">Full Name</label>
                <input
                  className="auth-field__input"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="auth-name"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-field__label">Email Address</label>
              <input
                className="auth-field__input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="auth-email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <input
                className="auth-field__input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                id="auth-password"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div className="auth-field">
                  <label className="auth-field__label">Confirm Password</label>
                  <input
                    className="auth-field__input"
                    type="password"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    id="auth-confirm-password"
                  />
                </div>

                {role === 'startup' && (
                  <div className="auth-row">
                    <div className="auth-field">
                      <label className="auth-field__label">Company Name</label>
                      <input
                        className="auth-field__input"
                        type="text"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        id="auth-company"
                      />
                    </div>
                    <div className="auth-field">
                      <label className="auth-field__label">Sector</label>
                      <select
                        className="auth-field__select"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        id="auth-sector"
                      >
                        <option value="">Select...</option>
                        <option value="Clean Energy">Clean Energy</option>
                        <option value="Water Tech">Water Tech</option>
                        <option value="Solar Tech">Solar Tech</option>
                        <option value="Thermal Storage">Thermal Storage</option>
                        <option value="Carbon Markets">Carbon Markets</option>
                        <option value="Environmental IoT">Environmental IoT</option>
                        <option value="Fintech">Fintech</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <button className="auth-submit" type="submit" disabled={loading} id="auth-submit-btn">
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : `Create ${role === 'startup' ? 'Startup' : 'Investor'} Account`}
            </button>
          </form>

          {/* Voice divider */}
          {mode === 'login' && (
            <>
              <div className="auth-divider">
                <div className="auth-divider__line" />
                <span className="auth-divider__text">or</span>
                <div className="auth-divider__line" />
              </div>
              <button className="auth-voice-btn" onClick={() => setShowVoice(true)} id="voice-login-btn">
                <span className="material-symbols-outlined">mic</span>
                Voice Login — Powered by JARVIS AI
              </button>
            </>
          )}
        </div>

        {/* Toggle */}
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>Don't have an account?{' '}<button className="auth-toggle__link" onClick={() => setMode('signup')}>Sign Up</button></>
          ) : (
            <>Already have an account?{' '}<button className="auth-toggle__link" onClick={() => setMode('login')}>Log In</button></>
          )}
        </div>

        {/* Demo credentials panel */}
        <div className="auth-demo-panel">
          <div className="auth-demo-panel__label">🧪 Demo Quick Login</div>
          <div className="auth-demo-panel__row">
            <button className="auth-demo-btn auth-demo-btn--investor" onClick={() => fillDemo('investor')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_balance_wallet</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>Investor Login</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>James Whitfield</div>
              </div>
            </button>
            <button className="auth-demo-btn auth-demo-btn--founder" onClick={() => fillDemo('founder')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>Startup Login</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>Priya Mehta · Aura Wind</div>
              </div>
            </button>
          </div>
          <div className="auth-demo-panel__row" style={{ marginTop: 8 }}>
            <button className="auth-demo-btn" style={{ background: '#FEF3C7', color: '#92400E', gridColumn: '1/-1' }}
              onClick={() => { setMode('login'); setEmail('admin@cleanledger.io'); setPassword('Admin1234!'); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>admin_panel_settings</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>Admin Login</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>admin@cleanledger.io · Admin1234!</div>
              </div>
            </button>
          </div>
          <p className="auth-demo-panel__note">
            Or register: <a href="/register/investor" style={{ color: '#4F46E5', fontWeight: 700 }}>Investor Wizard</a>{' '}·{' '}
            <a href="/register/startup" style={{ color: '#7C3AED', fontWeight: 700 }}>Startup Wizard</a>
          </p>
        </div>
      </div>

      {/* Voice Panel */}
      {showVoice && (
        <VoicePanel
          onClose={() => setShowVoice(false)}
          onAuthSuccess={handleVoiceAuth}
        />
      )}
    </div>
  );
}
