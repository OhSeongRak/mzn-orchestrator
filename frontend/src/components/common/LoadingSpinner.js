import React from 'react';

const LoadingSpinner = ({ message = '처리 중...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-container">
          <div className="spinner-outer">
            <div className="spinner-inner"></div>
          </div>
          <div className="spinner-dots">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
          </div>
        </div>
        <div className="loading-text-container">
          <p className="loading-text">{message}</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(40, 44, 52, 0.95);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease-out;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          padding: 40px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          min-width: 280px;
          text-align: center;
        }

        .spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-outer {
          width: 60px;
          height: 60px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--accent-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          position: relative;
        }

        .spinner-inner {
          width: 40px;
          height: 40px;
          border: 2px solid var(--border-secondary);
          border-top: 2px solid var(--accent-cyan);
          border-radius: 50%;
          animation: spin 0.8s linear infinite reverse;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .spinner-dots {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--accent-blue);
          border-radius: 50%;
          animation: orbit 2s linear infinite;
        }

        .dot-1 {
          animation-delay: 0s;
        }

        .dot-2 {
          animation-delay: -0.67s;
        }

        .dot-3 {
          animation-delay: -1.33s;
        }

        .loading-text-container {
          width: 100%;
        }

        .loading-text {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 16px 0;
          font-family: var(--font-sans);
        }

        .loading-progress {
          width: 100%;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan), var(--accent-blue));
          background-size: 200% 100%;
          animation: progressMove 2s linear infinite;
          border-radius: 2px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(35px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: rotate(360deg) translateX(35px) rotate(-360deg);
            opacity: 1;
          }
        }

        @keyframes progressMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* 반응형 디자인 */
        @media (max-width: 480px) {
          .loading-content {
            min-width: 240px;
            padding: 32px 24px;
            gap: 24px;
          }

          .spinner-container {
            width: 60px;
            height: 60px;
          }

          .spinner-outer {
            width: 48px;
            height: 48px;
          }

          .spinner-inner {
            width: 32px;
            height: 32px;
          }

          .dot {
            width: 6px;
            height: 6px;
          }

          .loading-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;