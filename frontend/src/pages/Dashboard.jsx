import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { api } from '../api';

const formatPercent = (value) => (
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '--'
);

export default function Dashboard({ systemSummary, setActiveTab, connectionError, onRetry }) {
  const [recentHistory, setRecentHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const datasetInfo = systemSummary?.dataset_info || {};
  const bestModel = systemSummary?.best_model || {};
  const modelComparisons = systemSummary?.model_comparisons || {};
  const classDistribution = datasetInfo.class_distribution || {};
  const totalRecords = datasetInfo.total_records;
  const hasModelResults = Object.keys(modelComparisons).length > 0;

  const loadRecentHistory = async () => {
    try {
      const history = await api.getHistory(5);
      setRecentHistory(history);
      setHistoryError(null);
    } catch (err) {
      setHistoryError(err.message || 'Recent assessment history is unavailable.');
    }
  };

  useEffect(() => {
    api.getHistory(5)
      .then((history) => {
        setRecentHistory(history);
        setHistoryError(null);
      })
      .catch((err) => {
        setHistoryError(err.message || 'Recent assessment history is unavailable.');
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Block */}
      <div className="clean-box" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '720px' }}>
            <span className="eyebrow">RISK INTELLIGENCE</span>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5' }}>
              Risk overview
            </h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '6px', lineHeight: 1.6 }}>
              Review your historical dataset and model performance, or begin a new risk assessment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('assess')}
              className="btn-primary"
            >
              Start New Assessment
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className="btn-secondary"
            >
              View Models
            </button>
          </div>
        </div>
      </div>

      {connectionError && (
        <div className="status-message status-error" role="alert">
          <div><strong>Live system data is unavailable.</strong><span>{connectionError}</span></div>
          <button type="button" className="btn-secondary" onClick={onRetry}>Retry connection</button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <MetricCard
          title="Historical Cases"
          value={Number.isFinite(totalRecords) ? totalRecords.toLocaleString() : '--'}
          subtitle="Multi-domain risk records"
          badgeText={`${Object.keys(datasetInfo.category_distribution || {}).length || '--'} Categories`}
        />

        <MetricCard
          title="Optimal Classifier"
          value={bestModel.key ? bestModel.key.toUpperCase() : '--'}
          subtitle={bestModel.selection_reason || 'Model results unavailable'}
          badgeText={`F1: ${formatPercent(bestModel.cv_f1_macro)}`}
        />

        <MetricCard
          title="Test Accuracy"
          value={Number.isFinite(bestModel.test_accuracy) ? `${bestModel.test_accuracy}%` : '--'}
          subtitle="20% Holdout Split"
          badgeText={Number.isFinite(bestModel.test_accuracy) ? 'Verified' : 'Unavailable'}
        />

        <MetricCard
          title="Cross-Validation"
          value={systemSummary?.cross_validations?.[bestModel.key]?.n_splits
            ? `${systemSummary.cross_validations[bestModel.key].n_splits}-Fold`
            : '--'}
          subtitle="Stratified sampling"
          badgeText={systemSummary?.cross_validations?.[bestModel.key]?.n_splits ? 'Standard' : 'Unavailable'}
        />
      </div>

      {/* Models & Class Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Leaderboard */}
        <div className="clean-box" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>
              Model Performance Summary
            </h4>
            <button
              onClick={() => setActiveTab('models')}
              style={{ fontSize: '12px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Details &rarr;
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a', color: '#71717a', fontSize: '10px', textTransform: 'uppercase' }}>
                <th style={{ padding: '6px 8px' }}>Model</th>
                <th style={{ padding: '6px 8px' }}>Accuracy</th>
                <th style={{ padding: '6px 8px' }}>Precision</th>
                <th style={{ padding: '6px 8px' }}>Recall</th>
                <th style={{ padding: '6px 8px' }}>F1 (Macro)</th>
              </tr>
            </thead>
            <tbody>
              {!hasModelResults && (
                <tr><td colSpan="5" className="table-empty">Model results will appear when the backend is available.</td></tr>
              )}
              {['svm', 'knn', 'decision_tree'].map((key) => {
                const m = modelComparisons[key] || {};
                const isBest = bestModel.key === key;
                if (!Object.keys(m).length) return null;
                return (
                  <tr key={key} style={{ borderBottom: '1px solid #1f1f23' }}>
                    <td style={{ padding: '8px', fontWeight: 500, color: '#f4f4f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{key.toUpperCase()}</span>
                        {isBest && (
                          <span style={{ fontSize: '9px', backgroundColor: '#18181b', color: '#10b981', border: '1px solid #27272a', padding: '1px 4px', borderRadius: '3px' }}>
                            Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>
                      {formatPercent(m.accuracy)}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>
                      {formatPercent(m.precision_macro)}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>
                      {formatPercent(m.recall_macro)}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f4f4f5' }}>
                      {formatPercent(m.f1_macro)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Distribution */}
        <div className="clean-box" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5', marginBottom: '12px' }}>
            Class Distribution
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.keys(classDistribution).length === 0 && (
              <p className="inline-empty">Class distribution is unavailable until the dataset loads.</p>
            )}
            {Object.entries(classDistribution).map(([label, count]) => {
              const pct = Number.isFinite(totalRecords) && totalRecords > 0
                ? Math.round((count / totalRecords) * 100)
                : 0;
              const color = label === 'Low' ? '#10b981' : (label === 'Medium' ? '#f59e0b' : '#ef4444');

              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 500, color }}>{label} Risk</span>
                    <span style={{ color: '#71717a', fontFamily: 'var(--font-mono)' }}>{count} cases ({pct}%)</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#18181b', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #27272a' }}>
            <button
              onClick={() => setActiveTab('assess')}
              style={{ fontSize: '12px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Start New Evaluation &rarr;
            </button>
          </div>
        </div>
      </div>

      <section className="clean-box dashboard-history">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">RECENT ACTIVITY</span>
            <h2>Saved assessments</h2>
          </div>
          <button type="button" className="text-action" onClick={() => setActiveTab('history')}>View history</button>
        </div>
        {historyError ? (
          <div className="status-message status-error" role="alert">
            <span>{historyError}</span>
            <button type="button" className="btn-secondary" onClick={loadRecentHistory}>Retry</button>
          </div>
        ) : recentHistory.length === 0 ? (
          <p className="inline-empty">No saved assessments yet. Completed assessments can be saved to your history.</p>
        ) : (
          <div className="recent-list">
            {recentHistory.map((item) => (
              <button type="button" className="recent-row" key={item.id} onClick={() => setActiveTab('history')}>
                <span className="recent-title">{item.case_title || 'Risk assessment'}</span>
                <span>{item.category}</span>
                <span className={`risk-label risk-${String(item.predicted_risk || '').toLowerCase()}`}>
                  {item.predicted_risk} risk
                </span>
                <span className="recent-date">{item.timestamp}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
