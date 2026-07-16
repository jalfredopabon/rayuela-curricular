import React, { useState, useEffect } from 'react';
import './index.css';

// Import data
import lenguajeData from './data/lenguaje.json';
import matematicasData from './data/matematicas.json';
import habilidadesData from './data/habilidades.json';
import contextualData from './data/contextual.json';
import ebcLenguajeData from './data/ebc_lenguaje.json';
import ebcMatematicasData from './data/ebc_matematicas.json';

export default function App() {
  // --- 1. Global Filter States ---
  const [activeStage, setActiveStage] = useState('ETAPA 1: Socioemocionales y de protección');
  const [activeComplexity, setActiveComplexity] = useState('Alta');
  const [activeLearningType, setActiveLearningType] = useState('Procesos cognitivos');

  // --- 2. Navigation States ---
  const [activeTab, setActiveTab] = useState('lenguaje'); // 'lenguaje', 'lenguaje-ebc', 'matematicas', 'matematicas-ebc', 'habilidades', 'contextual'

  // --- 3. Persistent Checklist States ---
  const [checkedEbcLenguaje, setCheckedEbcLenguaje] = useState(() => {
    const saved = localStorage.getItem('checkedEbcLenguaje');
    return saved ? JSON.parse(saved) : {};
  });

  const [checkedEbcMatematicas, setCheckedEbcMatematicas] = useState(() => {
    const saved = localStorage.getItem('checkedEbcMatematicas');
    return saved ? JSON.parse(saved) : {};
  });

  const [checkedHabilidades, setCheckedHabilidades] = useState(() => {
    const saved = localStorage.getItem('checkedHabilidades');
    if (saved) return JSON.parse(saved);
    const initial = {};
    habilidadesData.forEach(item => {
      if (item['Habilidades para la Vida y Competencias Socioemocionales']) {
        initial[item['Habilidades para la Vida y Competencias Socioemocionales']] = item['Columna1'] === true || item['Columna1'] === 'True';
      }
    });
    return initial;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('checkedEbcLenguaje', JSON.stringify(checkedEbcLenguaje));
  }, [checkedEbcLenguaje]);

  useEffect(() => {
    localStorage.setItem('checkedEbcMatematicas', JSON.stringify(checkedEbcMatematicas));
  }, [checkedEbcMatematicas]);

  useEffect(() => {
    localStorage.setItem('checkedHabilidades', JSON.stringify(checkedHabilidades));
  }, [checkedHabilidades]);

  // --- 4. Filtering Logic for Grid Tables ---
  const filteredLenguaje = lenguajeData.filter(row => {
    if (row['Factor'] === 'Total de subprocesos') return false;
    const rowStage = (row['Etapa y fase de respuesta educativa'] || '').trim();
    const rowComplexity = (row['Complejidad'] || '').trim();
    const rowType = (row['Tipo de aprendizaje'] || '').trim();
    return rowStage === activeStage && rowComplexity === activeComplexity && rowType === activeLearningType;
  });

  const filteredMatematicas = matematicasData.filter(row => {
    if (row['Procesos de pensamiento matemático'] === 'Total de subprocesos') return false;
    const rowStage = (row['Etapa y fase de respuesta educativa'] || '').trim();
    const rowComplexity = (row['Complejidad'] || '').trim();
    const rowType = (row['Tipo de aprendizaje'] || '').trim();
    return rowStage === activeStage && rowComplexity === activeComplexity && rowType === activeLearningType;
  });

  const filteredContextual = contextualData.filter(row => {
    if (row['Tipologías categoriales de riesgos de protección'] === 'Total') return false;
    return true;
  });

  // --- 5. Calculation of Progress Metrics ---
  const totalEbcLenguajeItems = Object.values(ebcLenguajeData).flat().length;
  const checkedEbcLenguajeCount = Object.values(checkedEbcLenguaje).filter(Boolean).length;
  const progressLenguaje = totalEbcLenguajeItems > 0 
    ? Math.round((checkedEbcLenguajeCount / totalEbcLenguajeItems) * 100) 
    : 0;

  const totalEbcMatematicasItems = Object.values(ebcMatematicasData).flat().length;
  const checkedEbcMatematicasCount = Object.values(checkedEbcMatematicas).filter(Boolean).length;
  const progressMatematicas = totalEbcMatematicasItems > 0 
    ? Math.round((checkedEbcMatematicasCount / totalEbcMatematicasItems) * 100) 
    : 0;

  const totalHabilidadesItems = habilidadesData.length;
  const checkedHabilidadesCount = Object.values(checkedHabilidades).filter(Boolean).length;
  const progressHabilidades = totalHabilidadesItems > 0 
    ? Math.round((checkedHabilidadesCount / totalHabilidadesItems) * 100) 
    : 0;

  // --- 6. Handlers for Checklists ---
  const toggleEbcLenguaje = (item) => {
    setCheckedEbcLenguaje(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleEbcMatematicas = (item) => {
    setCheckedEbcMatematicas(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleHabilidad = (name) => {
    setCheckedHabilidades(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleResetProgress = () => {
    if (window.confirm("¿Deseas reiniciar todo el progreso marcado?")) {
      setCheckedEbcLenguaje({});
      setCheckedEbcMatematicas({});
      const initial = {};
      habilidadesData.forEach(item => {
        if (item['Habilidades para la Vida y Competencias Socioemocionales']) {
          initial[item['Habilidades para la Vida y Competencias Socioemocionales']] = true;
        }
      });
      setCheckedHabilidades(initial);
    }
  };

  // Helper for Coherence Badge style mapping
  const renderCoherenceBadge = (text) => {
    const cleanText = (text || '').trim();
    let badgeClass = 'coherence-badge';
    let label = cleanText;

    if (cleanText.toLowerCase().includes('horizontal')) {
      badgeClass += ' horizontal';
      label = 'Horizontal 🔸';
    } else if (cleanText.toLowerCase().includes('vertical')) {
      badgeClass += ' vertical';
      label = 'Vertical 🔹';
    } else if (cleanText.toLowerCase().includes('transversal') || cleanText.toLowerCase().includes('nuclear')) {
      badgeClass += ' transversal';
      label = cleanText.includes('nuclear') ? 'Disciplinar-nuclear 🟢' : 'Transversal 🟢';
    }

    return <span className={badgeClass}>{label}</span>;
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header>
        <div className="header-brand">
          <span className="material-symbols-outlined text-primary fill" style={{ fontSize: '28px', color: 'var(--color-primary-container)' }}>
            menu_book
          </span>
          <h1 className="header-title">Rayuela curricular</h1>
          <span className="badge-elite">Ciclo III (Grados 6°-7°)</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              boxShadow: '0 0 0 3px rgba(34,197,94,0.25)'
            }}></span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-body)', fontWeight: 500 }}>
              Modo: Planificación Docente
            </span>
          </div>
          <button 
            onClick={handleResetProgress}
            style={{ 
              background: 'none', 
              border: '1px solid var(--color-border-light)', 
              padding: '6px 12px', 
              borderRadius: 'var(--rounded-md)',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'var(--color-text-body)'
            }}
          >
            Reiniciar progreso
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="main-layout">
        {/* LEFT COLUMN: CONTROL PANEL */}
        <aside className="control-panel">
          <h2 className="panel-title">Configuración pedagógica</h2>

          {/* 1. Etapa de Respuesta Educativa */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>emergency</span>
              Etapa de respuesta
            </label>
            <button 
              className={`capsule-btn ${activeStage === 'ETAPA 1: Socioemocionales y de protección' ? 'active' : ''}`}
              onClick={() => setActiveStage('ETAPA 1: Socioemocionales y de protección')}
            >
              <span>Etapa 1: Socioemocional</span>
            </button>
            <button 
              className={`capsule-btn ${activeStage === 'ETAPA 2: Procesos cognitivos y de transición' ? 'active' : ''}`}
              onClick={() => setActiveStage('ETAPA 2: Procesos cognitivos y de transición')}
            >
              <span>Etapa 2: Transición</span>
            </button>
            <button 
              className={`capsule-btn ${activeStage === 'ETAPA 3. prendizajes disciplinares y académicos consolidados' ? 'active' : ''}`}
              onClick={() => setActiveStage('ETAPA 3. prendizajes disciplinares y académicos consolidados')}
            >
              <span>Etapa 3: Consolidado académico</span>
            </button>
          </div>

          {/* 2. Complejidad de Riesgo */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lan</span>
              Complejidad del entorno
            </label>
            <div className="segmented-control">
              <button 
                className={`segment-btn ${activeComplexity === 'Baja' ? 'active' : ''}`}
                onClick={() => setActiveComplexity('Baja')}
              >
                Baja
              </button>
              <button 
                className={`segment-btn ${activeComplexity === 'Media' ? 'active' : ''}`}
                onClick={() => setActiveComplexity('Media')}
              >
                Media
              </button>
              <button 
                className={`segment-btn ${activeComplexity === 'Alta' ? 'active' : ''}`}
                onClick={() => setActiveComplexity('Alta')}
              >
                Alta
              </button>
            </div>
          </div>

          {/* 3. Tipo de Aprendizaje (Sliding Segmented Toggle) */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>swap_horiz</span>
              Tipo de Aprendizaje
            </label>
            <div className="sliding-toggle-container">
              <div 
                className="sliding-toggle-active-bg" 
                style={{ 
                  width: 'calc(50% - 4px)',
                  left: activeLearningType === 'Procesos cognitivos' ? '4px' : 'calc(50%)' 
                }}
              ></div>
              <button 
                className={`sliding-toggle-btn ${activeLearningType === 'Procesos cognitivos' ? 'active' : ''}`}
                onClick={() => setActiveLearningType('Procesos cognitivos')}
              >
                Procesos cognitivos
              </button>
              <button 
                className={`sliding-toggle-btn ${activeLearningType === 'Conocimientos disciplinares' ? 'active' : ''}`}
                onClick={() => setActiveLearningType('Conocimientos disciplinares')}
              >
                Conocimientos disciplinares
              </button>
            </div>
          </div>

          {/* Warning banner for High Complexity (forced horizontal coherence) */}
          {activeComplexity === 'Alta' && (
            <div style={{ 
              backgroundColor: '#FFFBEB', 
              border: '1px solid #FCD34D', 
              padding: '12px', 
              borderRadius: 'var(--rounded-md)',
              fontSize: '12px',
              color: '#92400E',
              lineHeight: '1.4'
            }}>
              <strong>Aviso de Riesgo Alto:</strong> En contextos de riesgo alto (ej. sismos, reclutamiento, minas), la coherencia se restringe a <strong>Horizontal</strong>. Los procesos anticipatorios están deshabilitados para priorizar la protección inmediata.
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: WORKPLACE */}
        <section className="content-area">
          {/* DASHBOARD METRICS */}
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('lenguaje-ebc')}>
              <h3 className="card-title">Progreso lenguaje</h3>
              <div className="card-metric">{progressLenguaje}%</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressLenguaje}%` }}></div>
              </div>
              <div className="card-subtitle">
                {checkedEbcLenguajeCount} de {totalEbcLenguajeItems} estándares logrados
              </div>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('matematicas-ebc')}>
              <h3 className="card-title">Progreso matemáticas</h3>
              <div className="card-metric">{progressMatematicas}%</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressMatematicas}%` }}></div>
              </div>
              <div className="card-subtitle">
                {checkedEbcMatematicasCount} de {totalEbcMatematicasItems} estándares logrados
              </div>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('habilidades')}>
              <h3 className="card-title">Habilidades socioemocionales</h3>
              <div className="card-metric">{progressHabilidades}%</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressHabilidades}%` }}></div>
              </div>
              <div className="card-subtitle">
                {checkedHabilidadesCount} de {totalHabilidadesItems} habilidades completadas
              </div>
            </div>
          </div>

          {/* MAIN PEDAGOGICAL WORKPLACE */}
          <div className="subprocess-container">
            <div className="subprocess-header">
              {/* TABS */}
              <div className="tabs-navigation">
                <button className={`tab-btn ${activeTab === 'lenguaje' ? 'active' : ''}`} onClick={() => setActiveTab('lenguaje')}>
                  Cuadrícula lenguaje
                </button>
                <button className={`tab-btn ${activeTab === 'lenguaje-ebc' ? 'active' : ''}`} onClick={() => setActiveTab('lenguaje-ebc')}>
                  EBC lenguaje (checklist)
                </button>
                <button className={`tab-btn ${activeTab === 'matematicas' ? 'active' : ''}`} onClick={() => setActiveTab('matematicas')}>
                  Cuadrícula matemáticas
                </button>
                <button className={`tab-btn ${activeTab === 'matematicas-ebc' ? 'active' : ''}`} onClick={() => setActiveTab('matematicas-ebc')}>
                  EBC matemáticas (checklist)
                </button>
                <button className={`tab-btn ${activeTab === 'habilidades' ? 'active' : ''}`} onClick={() => setActiveTab('habilidades')}>
                  Habilidades para la vida
                </button>
                <button className={`tab-btn ${activeTab === 'contextual' ? 'active' : ''}`} onClick={() => setActiveTab('contextual')}>
                  Riesgos del entorno
                </button>
              </div>
            </div>

            {/* TAB VIEW 1: LENGUAJE GRID */}
            {activeTab === 'lenguaje' && (
              <>
                {/* Desktop View Table */}
                <div className="table-wrapper">
                  {filteredLenguaje.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Subproceso</th>
                          <th>Objetivo Bloom</th>
                          <th>Coherencia</th>
                          <th>Evidencias</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLenguaje.map((row, idx) => (
                          <tr key={idx} className={idx === 0 ? 'priority-row' : 'standard-row'}>
                            <td className="font-medium text-spec-text-dark">
                              {row['Sub-proceso']}
                            </td>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--color-text-dark)' }}>{row['Objetivo de aprendizaje Taxonomía de Bloom']}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                Taxonomía: {row['Proceso cognitivo Taxonomía de Bloom']}
                              </div>
                            </td>
                            <td>{renderCoherenceBadge(row['Tipo de coherencia'])}</td>
                            <td>
                              <div className="badge-container">
                                <span className="dot-evidence conceptual" title={`Conceptual: ${row['Evidencias de aprendizaje Conceptual (Saber / Conocer)']}`}></span>
                                <span className="dot-evidence procedimental" title={`Procedimental: ${row['Evidencias de aprendizaje Procedimental (Saber hacer)']}`}></span>
                                <span className="dot-evidence actitudinal" title={`Actitudinal: ${row['Evidencias de aprendizaje Procedimental Actitudinal (Saber ser)']}`}></span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '40px', textAlignment: 'center', color: 'var(--color-text-muted)' }}>
                      No hay subprocesos activos en Lenguaje para la configuración seleccionada.
                    </div>
                  )}
                </div>

                {/* Mobile View Cards */}
                <div className="responsive-cards">
                  {filteredLenguaje.map((row, idx) => (
                    <div key={idx} className="mobile-card" style={idx === 0 ? { borderLeft: '4px solid var(--color-primary-container)' } : {}}>
                      <span className="mobile-card-label">Subproceso</span>
                      <p style={{ fontWeight: '600', color: 'var(--color-text-dark)' }}>{row['Sub-proceso']}</p>
                      <span className="mobile-card-label" style={{ marginTop: '8px' }}>Objetivo Bloom</span>
                      <p style={{ fontSize: '13px' }}>{row['Objetivo de aprendizaje Taxonomía de Bloom']}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
                        {renderCoherenceBadge(row['Tipo de coherencia'])}
                        <div className="badge-container">
                          <span className="dot-evidence conceptual" title="Conceptual"></span>
                          <span className="dot-evidence procedimental" title="Procedimental"></span>
                          <span className="dot-evidence actitudinal" title="Actitudinal"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border-light)', fontSize: '13px', fontWeight: 'bold' }}>
                  Subprocesos activos bajo este escenario: {filteredLenguaje.length} de 39
                </div>
              </>
            )}

            {/* TAB VIEW 2: LENGUAJE EBC CHECKLIST */}
            {activeTab === 'lenguaje-ebc' && (
              <div className="ebc-list">
                {Object.entries(ebcLenguajeData).map(([factor, items]) => (
                  <div key={factor} style={{ marginBottom: '24px' }}>
                    <h4 className="font-serif" style={{ color: 'var(--color-primary-container)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px', marginBottom: '12px' }}>
                      {factor}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, idx) => {
                        const isChecked = !!checkedEbcLenguaje[item];
                        return (
                          <div 
                            key={idx} 
                            className={`ebc-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleEbcLenguaje(item)}
                          >
                            <div className="checkbox-target"></div>
                            <span className="ebc-text">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB VIEW 3: MATEMATICAS GRID */}
            {activeTab === 'matematicas' && (
              <>
                {/* Desktop View Table */}
                <div className="table-wrapper">
                  {filteredMatematicas.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Subproceso</th>
                          <th>Objetivo Bloom</th>
                          <th>Coherencia</th>
                          <th>Evidencias</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMatematicas.map((row, idx) => (
                          <tr key={idx} className={idx === 0 ? 'priority-row' : 'standard-row'}>
                            <td>
                              <strong style={{ display: 'block', fontSize: '11px', color: 'var(--color-primary-container)', marginBottom: '4px' }}>
                                {row['Procesos de pensamiento matemático']}
                              </strong>
                              <span style={{ fontWeight: '600', color: 'var(--color-text-dark)' }}>
                                {row['Tipos de\npensamiento']}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: '500', color: 'var(--color-text-body)' }}>{row['Objetivo de aprendizaje Taxonomía de Bloom']}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                Taxonomía: {row['Proceso cognitivo Taxonomía de Bloom']}
                              </div>
                            </td>
                            <td>{renderCoherenceBadge(row['Tipo de coherencia'])}</td>
                            <td>
                              <div className="badge-container">
                                <span className="dot-evidence conceptual" title={`Conceptual: ${row['Evidencias de aprendizaje Conceptual (Saber / Conocer)']}`}></span>
                                <span className="dot-evidence procedimental" title={`Procedimental: ${row['Evidencias de aprendizaje Procedimental (Saber hacer)']}`}></span>
                                <span className="dot-evidence actitudinal" title={`Actitudinal: ${row['Evidencias de aprendizaje Procedimental Actitudinal (Saber ser)']}`}></span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '40px', textAlignment: 'center', color: 'var(--color-text-muted)' }}>
                      No hay subprocesos activos en Matemáticas para la configuración seleccionada.
                    </div>
                  )}
                </div>

                {/* Mobile View Cards */}
                <div className="responsive-cards">
                  {filteredMatematicas.map((row, idx) => (
                    <div key={idx} className="mobile-card" style={idx === 0 ? { borderLeft: '4px solid var(--color-primary-container)' } : {}}>
                      <span className="mobile-card-label">Subproceso</span>
                      <p style={{ fontWeight: '600', color: 'var(--color-text-dark)' }}>{row['Tipos de\npensamiento']}</p>
                      <span className="mobile-card-label" style={{ marginTop: '8px' }}>Objetivo Bloom</span>
                      <p style={{ fontSize: '13px' }}>{row['Objetivo de aprendizaje Taxonomía de Bloom']}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
                        {renderCoherenceBadge(row['Tipo de coherencia'])}
                        <div className="badge-container">
                          <span className="dot-evidence conceptual" title="Conceptual"></span>
                          <span className="dot-evidence procedimental" title="Procedimental"></span>
                          <span className="dot-evidence actitudinal" title="Actitudinal"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border-light)', fontSize: '13px', fontWeight: 'bold' }}>
                  Subprocesos activos bajo este escenario: {filteredMatematicas.length} de 37
                </div>
              </>
            )}

            {/* TAB VIEW 4: MATEMATICAS EBC CHECKLIST */}
            {activeTab === 'matematicas-ebc' && (
              <div className="ebc-list">
                {Object.entries(ebcMatematicasData).map(([factor, items]) => (
                  <div key={factor} style={{ marginBottom: '24px' }}>
                    <h4 className="font-serif" style={{ color: 'var(--color-primary-container)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px', marginBottom: '12px' }}>
                      {factor}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, idx) => {
                        const isChecked = !!checkedEbcMatematicas[item];
                        return (
                          <div 
                            key={idx} 
                            className={`ebc-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleEbcMatematicas(item)}
                          >
                            <div className="checkbox-target"></div>
                            <span className="ebc-text">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB VIEW 5: HABILIDADES */}
            {activeTab === 'habilidades' && (
              <div className="ebc-list">
                <div style={{ padding: '8px 0 20px 0', borderBottom: '1px solid var(--color-border-light)', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-body)' }}>
                    Marque las habilidades socioemocionales desarrolladas en el aula de emergencia. Estas se agrupan según las dimensiones de respuesta.
                  </p>
                </div>
                {habilidadesData.map((item, idx) => {
                  const name = item['Habilidades para la Vida y Competencias Socioemocionales'];
                  if (!name) return null;
                  const isChecked = !!checkedHabilidades[name];
                  return (
                    <div 
                      key={idx} 
                      className={`ebc-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleHabilidad(name)}
                      style={{ padding: '16px' }}
                    >
                      <div className="checkbox-target" style={{ marginTop: '4px' }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary-container)', textTransform: 'uppercase' }}>
                          {item['Dimensión de Habilidades para la Vida y Competencias Socioemocionales']} | {item['Etapa de respuesta en la emergencia.']}
                        </span>
                        <span className="ebc-text" style={{ fontSize: '14px', fontWeight: '600' }}>{name}</span>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          <strong>Objetivo:</strong> {item['Objetivo de aprendizaje Taxonomía de Bloom']}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-body)', marginTop: '4px' }}>
                          <strong>Evidencias (Conmigo mismo):</strong> {item['Evidencias de aprendizaje             Conmigo mismo:']}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB VIEW 6: CONTEXTUAL RISKS */}
            {activeTab === 'contextual' && (
              <div className="ebc-list">
                {filteredContextual.map((item, idx) => (
                  <div key={idx} style={{ padding: '20px', border: '1px solid var(--color-border-light)', borderRadius: 'var(--rounded-lg)', backgroundColor: 'var(--color-bg-base)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary-vibrant)', textTransform: 'uppercase' }}>
                        {item['Tipologías categoriales de riesgos de protección']?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Articula: {item['Estrategia de NRC con la que se articula']}
                      </span>
                    </div>
                    <h4 className="font-serif" style={{ fontSize: '18px', margin: '8px 0', color: 'var(--color-text-dark)' }}>
                      {item['Riesgos clasificados por tipo de afectación']}
                    </h4>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-body)', marginBottom: '12px' }}>
                      <strong>Objetivo clave:</strong> {item['Objetivo de aprendizaje']}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary-container)' }}>Desafío del Proyecto</strong>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>{item['Desafío del proyecto']}</p>
                      </div>
                      <div>
                        <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary-container)' }}>Acción Propuesta (Crear)</strong>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>{item['Crear (Proponer una acción segura)']}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Herramienta de Planificación Curricular de Emergencia - Ciclo III</p>
        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>NRC © 2026. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
