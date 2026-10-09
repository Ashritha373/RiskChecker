import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiskAssessment from './pages/RiskAssessment';
import AssessmentResult from './pages/AssessmentResult';
import WhatIfAnalysis from './pages/WhatIfAnalysis';
import ModelAnalysis from './pages/ModelAnalysis';
import DatasetExplorer from './pages/DatasetExplorer';
import History from './pages/History';
import { api } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('risk_dss_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState(null);
  const [summary, setSummary] = useState(null);
  const [modelDetails, setModelDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Assessment Result state
  const [currentResult, setCurrentResult] = useState(null);
  const [whatIfCase, setWhatIfCase] = useState(null);
  const [prefilledFormCase, setPrefilledFormCase] = useState(null);
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cfg, summ, mDetails] = await Promise.all([
        api.getConfig(),
        api.getSummary(),
        api.getModelDetails(),
      ]);
      setConfig(cfg);
      setSummary(summ);
      setModelDetails(mDetails);
      setIsConnected(true);
      setConnectionError(null);
    } catch (err) {
      console.warn('Backend connecting...', err);
      setIsConnected(false);
      setConnectionError(err.message || 'The backend could not be reached.');
      setTimeout(loadInitialData, 3000);
    }
  };

  const handleAssessmentComplete = (result, inputData) => {
    setCurrentResult(result);
    setWhatIfCase(inputData);
    setPrefilledFormCase(null);
    setActiveTab('result');
  };

  const handleStartWhatIf = (caseInputs) => {
    setWhatIfCase(caseInputs);
    setActiveTab('what-if');
  };

  const handleSelectCaseForAssessment = (caseInputs) => {
    setPrefilledFormCase(caseInputs);
    setActiveTab('assess');
  };

  const handleRetrainSuccess = (newSummary) => {
    if (newSummary) setSummary(newSummary);
  };

  const handleLogout = () => {
    localStorage.removeItem('risk_dss_user');
    setCurrentUser(null);
  };

  // Show Login screen if not signed in
  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab === 'result' ? 'assess' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        systemSummary={summary}
        isConnected={isConnected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="app-workspace">
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            systemSummary={summary}
            setActiveTab={setActiveTab}
            connectionError={connectionError}
            onRetry={loadInitialData}
          />
        )}

        {activeTab === 'assess' && (
          <RiskAssessment
            config={config}
            initialCase={prefilledFormCase}
            onAssessmentComplete={handleAssessmentComplete}
          />
        )}

        {activeTab === 'result' && (
          <AssessmentResult
            result={currentResult}
            onStartWhatIf={handleStartWhatIf}
            onNewAssessment={() => setActiveTab('assess')}
            onSaveToHistory={() => {}}
          />
        )}

        {activeTab === 'what-if' && (
          <WhatIfAnalysis
            initialCase={whatIfCase}
          />
        )}

        {activeTab === 'models' && (
          <ModelAnalysis
            modelDetails={modelDetails}
            onRetrainSuccess={handleRetrainSuccess}
            connectionError={connectionError}
            onRetry={loadInitialData}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer />
        )}

        {activeTab === 'history' && (
          <History
            onSelectCaseForWhatIf={handleStartWhatIf}
            onSelectCaseForAssessment={handleSelectCaseForAssessment}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>RiskChecker <span aria-hidden="true">·</span> Risk assessment workspace</span>
        <span>Support Vector Machine <span aria-hidden="true">·</span> K-Nearest Neighbors <span aria-hidden="true">·</span> Decision Tree</span>
      </footer>
      </div>
    </div>
  );
}
