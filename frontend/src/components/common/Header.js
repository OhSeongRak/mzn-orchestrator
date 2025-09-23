import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isDbConnected, connectionInfo, onBackToConnection }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (isDbConnected) {
      navigate('/services');
    } else {
      navigate('/');
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-main" onClick={handleLogoClick}>
            <h1 className="header-title">
              <span className="header-icon">⚡</span>
              <span className="header-text">MZN Orchestrator</span>
              <span className="header-platform"></span>
            </h1>
            <p className="header-subtitle">
              커스텀 SQL 생성 & AI SQL 생성 통합 플랫폼
            </p>
          </div>
          
          {isDbConnected && !isHomePage && (
            <div className="header-status">
              <div className="connection-info">
                <div className="connection-badge">
                  <span className="status-indicator"></span>
                  <div className="connection-details">
                    <span className="connection-label">Connected</span>
                    <span className="connection-value">{connectionInfo}</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={onBackToConnection}
              >
                <span className="btn-icon">🔄</span>
                Change Connection
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          padding: 20px 0;
          margin-bottom: 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(8px);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-main {
          cursor: pointer;
          transition: var(--transition);
          padding: 8px;
          border-radius: 8px;
        }

        .header-main:hover {
          background: var(--bg-highlight);
          transform: translateY(-1px);
        }

        .header-title {
          color: var(--text-white);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-sans);
          letter-spacing: -0.025em;
        }

        .header-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(97, 175, 239, 0.5));
        }

        .header-text {
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-platform {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .header-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 400;
          margin: 0;
          font-family: var(--font-sans);
          letter-spacing: 0.025em;
        }

        .header-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .connection-info {
          text-align: right;
        }

        .connection-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .connection-badge:hover {
          border-color: var(--accent-green);
          box-shadow: var(--shadow-md);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 0 rgba(152, 195, 121, 0.7);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(152, 195, 121, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(152, 195, 121, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(152, 195, 121, 0);
          }
        }

        .connection-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .connection-label {
          font-size: 0.75rem;
          color: var(--accent-green);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .connection-value {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .btn-icon {
          margin-right: 6px;
          font-size: 0.9rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .header {
            padding: 16px 0;
          }

          .header-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .header-icon {
            font-size: 1.8rem;
          }

          .header-subtitle {
            font-size: 0.8rem;
            text-align: center;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .header-status {
            align-items: center;
            width: 100%;
          }

          .connection-info {
            text-align: center;
          }

          .connection-badge {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .connection-details {
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 12px 0;
          }

          .header-title {
            font-size: 1.3rem;
          }

          .header-icon {
            font-size: 1.5rem;
          }

          .header-subtitle {
            font-size: 0.75rem;
          }

          .connection-badge {
            padding: 8px 12px;
            width: 100%;
          }

          .connection-value {
            font-size: 0.75rem;
          }

          .btn-sm {
            width: 100%;
            padding: 10px 16px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;