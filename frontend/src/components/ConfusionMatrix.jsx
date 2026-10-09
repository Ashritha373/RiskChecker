import React from 'react';

export default function ConfusionMatrix({ matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], classes = ['Low', 'Medium', 'High'], modelName = '' }) {
  const flatVals = matrix.flat();
  const maxVal = Math.max(...flatVals, 1);
  const totalSamples = flatVals.reduce((a, b) => a + b, 0);

  return (
    <div className="clean-box confusion-matrix" style={{ padding: '18px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>
          Confusion Matrix {modelName && `(${modelName})`}
        </h4>
        <p style={{ fontSize: '11px', color: '#71717a' }}>
          Test set validation (N = {totalSamples})
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>
          Predicted &rarr;
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '10px',
            color: '#71717a',
            marginRight: '8px',
            textTransform: 'uppercase'
          }}>
            Actual &rarr;
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: `50px repeat(${classes.length}, 65px)`, gap: '3px', marginBottom: '3px' }}>
              <div />
              {classes.map((c) => (
                <div key={c} style={{ textAlign: 'center', fontSize: '11px', color: '#a1a1aa' }}>
                  {c}
                </div>
              ))}
            </div>

            {matrix.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: `50px repeat(${classes.length}, 65px)`, gap: '3px', marginBottom: '3px', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#a1a1aa', textAlign: 'right', paddingRight: '6px' }}>
                  {classes[rowIdx]}
                </div>
                {row.map((cellVal, colIdx) => {
                  const isDiagonal = rowIdx === colIdx;
                  const rowSum = row.reduce((a, b) => a + b, 0);
                  const rowPct = rowSum > 0 ? Math.round((cellVal / rowSum) * 100) : 0;
                  
                  return (
                    <div
                      key={colIdx}
                      style={{
                        height: '46px',
                        borderRadius: '4px',
                        backgroundColor: isDiagonal
                          ? `rgba(168, 185, 160, ${0.1 + (cellVal / maxVal) * 0.28})`
                          : `rgba(235, 198, 174, ${cellVal > 0 ? 0.08 + (cellVal / maxVal) * 0.24 : 0.04})`,
                        border: '1px solid #e6e5dc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDiagonal ? '#465b43' : '#8a655c'
                      }}
                      aria-label={`${classes[rowIdx]} actual, ${classes[colIdx]} predicted: ${cellVal}`}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'inherit' }}>
                        {cellVal}
                      </span>
                      <span style={{ fontSize: '9px', color: '#71717a' }}>{rowPct}%</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
