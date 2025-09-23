import React from 'react';

const ServiceSelection = ({ onServiceSelect, connectionInfo }) => {
  const services = [
    {
      id: 'custom-sql',
      title: '커스텀 SQL 생성기',
      icon: '⚙️',
      description: '테이블 컬럼별 옵션 설정을 통한 커스텀 INSERT문 생성',
      features: [
        '테이블 컬럼별 세부 옵션 설정',
        'WHERE 조건 커스터마이징',
        'AI SQL 정합성 검증'
      ],
      buttonText: '커스텀 생성기 사용',
      buttonClass: 'btn-primary',
      accentColor: 'var(--accent-blue)'
    },
    {
      id: 'ai-sql',
      title: 'AI SQL 생성 도구',
      icon: '🤖',
      description: 'NE ID 기반 자동 SQL 생성 도구',
      features: [
        '5개 테이블 자동 연계 처리',
        'NE ID 기반 관련 데이터 추출',
        'ABC Lab API 자동 변환'
      ],
      buttonText: 'AI SQL 도구 사용',
      buttonClass: 'btn-success',
      accentColor: 'var(--accent-green)'
    }
  ];

  return (
    <section className="service-selection">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎯</span>
          서비스 선택
        </h2>
        <p>사용할 SQL Generator를 선택해주세요</p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`service-card ${service.isNew ? 'service-card-new' : ''}`}
            style={{'--accent-color': service.accentColor}}
          >
            {service.isNew && (
              <div className="new-corner-badge">
                <span>NEW</span>
              </div>
            )}
            
            <div className="service-header">
              <div className="service-icon">{service.icon}</div>
              <div className="service-title-section">
                <h3 className="service-title">
                  {service.title}
                </h3>
                {service.isNew && <span className="new-pill">NEW</span>}
              </div>
            </div>
            
            <p className="service-description">{service.description}</p>
            
            <ul className="service-features">
              {service.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button
              className={`btn ${service.buttonClass} service-btn`}
              onClick={() => onServiceSelect(service.id)}
            >
              <span className="btn-icon">{service.icon}</span>
              {service.buttonText}
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .service-selection {
          animation: fadeInUp 0.6s ease-out;
          padding: 40px 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header h2 {
          color: var(--text-white);
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: var(--font-sans);
          letter-spacing: -0.025em;
        }

        .section-icon {
          font-size: 2.8rem;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(198, 120, 221, 0.5));
        }

        .section-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
          font-weight: 400;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
          margin-bottom: 40px;
        }

        .service-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 32px;
          box-shadow: var(--shadow-md);
          transition: var(--transition-slow);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--accent-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-color);
          box-shadow: 
            var(--shadow-lg),
            0 0 0 1px var(--accent-color);
        }

        .service-card:hover::before {
          transform: scaleX(1);
        }

        .service-card-new {
          border-color: var(--accent-green);
          background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(152, 195, 121, 0.05) 100%);
        }

        .service-card-new:hover {
          box-shadow: 
            var(--shadow-lg),
            0 0 20px rgba(152, 195, 121, 0.3);
        }

        .new-corner-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-left: 50px solid transparent;
          border-top: 50px solid var(--accent-green);
          z-index: 1;
        }

        .new-corner-badge span {
          position: absolute;
          top: -40px;
          right: -20px;
          color: var(--text-white);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transform: rotate(45deg);
        }

        .service-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .service-icon {
          font-size: 3rem;
          background: var(--accent-color);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(97, 175, 239, 0.5));
          flex-shrink: 0;
        }

        .service-title-section {
          flex: 1;
        }

        .service-title {
          color: var(--text-white);
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .new-pill {
          background: var(--accent-green);
          color: var(--text-white);
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          animation: glow 2s infinite;
        }

        .service-description {
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .service-features {
          list-style: none;
          margin-bottom: 32px;
          padding: 0;
        }

        .service-features li {
          color: var(--text-primary);
          margin-bottom: 12px;
          font-size: 0.9rem;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          line-height: 1.5;
        }

        .feature-check {
          color: var(--accent-color);
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .service-btn {
          width: 100%;
          padding: 16px 24px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: var(--transition);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .service-selection {
            padding: 24px 0;
          }

          .section-header {
            margin-bottom: 40px;
          }

          .section-header h2 {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
          }

          .section-icon {
            font-size: 2.2rem;
          }

          .section-header p {
            font-size: 1rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .service-card {
            padding: 24px;
          }

          .service-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
          }

          .service-icon {
            font-size: 2.5rem;
          }

          .service-title {
            font-size: 1.3rem;
            justify-content: center;
          }

          .service-features {
            margin-bottom: 24px;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .service-card {
            padding: 20px;
          }

          .service-icon {
            font-size: 2.2rem;
          }

          .service-title {
            font-size: 1.2rem;
          }

          .service-features li {
            font-size: 0.85rem;
          }

          .service-btn {
            padding: 14px 20px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
};

export default ServiceSelection;