import React, { useState } from 'react';
import './startupRegistration.css';
import VerificationBadge from '../components/ui/VerificationBadge';

const steps = [
  { id: 1, title: 'Business Details' },
  { id: 2, title: 'Team Members' },
  { id: 3, title: 'Documents & Pitch' },
  { id: 4, title: 'Funding Goal & Milestones' },
];

const StartupRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', category: '', incorporationProof: null, teamMembers: [],
    pitchDeck: null, fundingGoal: '', milestones: []
  });
  const [profileScore, setProfileScore] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const next = async () => {
    // In a real app you would persist each step via API; here we just advance.
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const previous = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const submit = async () => {
    const token = localStorage.getItem('token');
    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) payload.append(key, val);
    });
    const res = await fetch('/api/v1/startups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });
    if (res.ok) {
      const data = await res.json();
      setVerificationStatus('pending');
      alert('Startup profile submitted for verification');
    } else {
      const err = await res.json();
      alert('Error: ' + err.message);
    }
  };

  // Simple scoring heuristic – each filled field adds points.
  const calculateScore = () => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.category) score += 15;
    if (formData.incorporationProof) score += 20;
    if (formData.teamMembers.length) score += 15;
    if (formData.pitchDeck) score += 10;
    if (formData.fundingGoal) score += 10;
    setProfileScore(score);
  };

  // Re‑calculate when formData changes.
  React.useEffect(() => {
    calculateScore();
  }, [formData]);

  return (
    <div className="registration-wizard container">
      <h1>Startup Registration Wizard</h1>
      <VerificationBadge status={verificationStatus} />
      <div className="profile-score">
        Profile Completeness: {profileScore}%
      </div>
      <div className="steps-indicator">
        {steps.map((s) => (
          <span key={s.id} className={s.id === currentStep ? 'active' : ''}>
            {s.title}
          </span>
        ))}
      </div>

      {currentStep === 1 && (
        <div className="step-content">
          <label>Business Name:
            <input name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>Category:
            <input name="category" value={formData.category} onChange={handleChange} />
          </label>
          <label>Incorporation Proof (PDF):
            <input type="file" name="incorporationProof" accept="application/pdf" onChange={handleChange} />
          </label>
        </div>
      )}

      {currentStep === 2 && (
        <div className="step-content">
          <p>Team member details (name, LinkedIn, role) – for demo we capture a comma‑separated list.</p>
          <label>Team Members:
            <input
              name="teamMembers"
              placeholder="John Doe,LinkedInURL,CEO; Jane Smith,LinkedInURL,CTO"
              onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value.split(';').map(t => t.trim()) })}
            />
          </label>
        </div>
      )}

      {currentStep === 3 && (
        <div className="step-content">
          <label>Pitch Deck (PDF):
            <input type="file" name="pitchDeck" accept="application/pdf" onChange={handleChange} />
          </label>
        </div>
      )}

      {currentStep === 4 && (
        <div className="step-content">
          <label>Funding Goal (USD):
            <input name="fundingGoal" type="number" value={formData.fundingGoal} onChange={handleChange} />
          </label>
          {/* Milestones could be added here – omitted for brevity */}
        </div>
      )}

      <div className="navigation-buttons">
        {currentStep > 1 && <button onClick={previous}>Previous</button>}
        {currentStep < steps.length && <button onClick={next}>Next</button>}
        {currentStep === steps.length && <button onClick={submit}>Submit Profile</button>}
      </div>
    </div>
  );
};

export default StartupRegistration;
