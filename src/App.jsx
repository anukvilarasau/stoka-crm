import React, { useState, useMemo } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = [
  'Prospecto', 'Contactado', 'Reunión agendada',
  'Propuesta enviada', 'Negociación', 'Ganado', 'Perdido',
];
const SECTORS = ['Logística', 'Industria', 'Minería', 'Farmacéutica', 'Alimentos', 'Retail'];
const PRODUCTS = ['ASRS', 'VLM', 'Carousel', 'AGV', 'Conveyor', 'Otro'];
const ACTIVITY_TYPES = ['Llamada', 'Mail', 'Reunión', 'Demo', 'Propuesta'];

const STAGE_COLOR = {
  'Prospecto': '#6366f1',
  'Contactado': '#3b82f6',
  'Reunión agendada': '#06b6d4',
  'Propuesta enviada': '#f59e0b',
  'Negociación': '#f97316',
  'Ganado': '#22c55e',
  'Perdido': '#ef4444',
};

const ACT_ICON = { Llamada: '📞', Mail: '✉️', Reunión: '📅', Demo: '🖥️', Propuesta: '📄' };

// ─── Theme ───────────────────────────────────────────────────────────────────

const c = {
  bg: '#0d0d0d',
  surface: '#161616',
  surface2: '#1e1e1e',
  surface3: '#252525',
  border: '#252525',
  border2: '#2e2e2e',
  accent: '#22c55e',
  blue: '#3b82f6',
  text: '#f0f0f0',
  textSec: '#8a8a8a',
  textDim: '#555',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// ─── Style helpers ───────────────────────────────────────────────────────────

const inp = {
  background: c.surface3,
  border: `1px solid ${c.border2}`,
  borderRadius: 6,
  color: c.text,
  padding: '7px 10px',
  fontSize: 13,
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const lbl = {
  fontSize: 11,
  color: c.textSec,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};

const btnStyle = (variant = 'primary', size = 'md') => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: size === 'sm' ? '4px 10px' : '8px 16px',
  borderRadius: 6,
  border: variant === 'ghost' ? `1px solid ${c.border2}` : 'none',
  background:
    variant === 'primary' ? c.accent :
    variant === 'blue'    ? c.blue :
    variant === 'danger'  ? c.danger : 'transparent',
  color: variant === 'ghost' ? c.textSec : '#fff',
  cursor: 'pointer',
  fontSize: size === 'sm' ? 12 : 13,
  fontWeight: 500,
  fontFamily: 'inherit',
});

// ─── Sample data ─────────────────────────────────────────────────────────────

const INIT_OPPS = [
  {
    id: '1', clientName: 'Carlos Méndez', company: 'LogiCorp SA',
    sector: 'Logística', product: 'ASRS', value: 280000,
    stage: 'Propuesta enviada', createdAt: '2026-04-10',
  },
  {
    id: '2', clientName: 'Ana Torres', company: 'FarmaPlus',
    sector: 'Farmacéutica', product: 'VLM', value: 145000,
    stage: 'Reunión agendada', createdAt: '2026-05-02',
  },
  {
    id: '3', clientName: 'Roberto Vega', company: 'MineSolutions',
    sector: 'Minería', product: 'AGV', value: 520000,
    stage: 'Negociación', createdAt: '2026-03-15',
  },
];

const INIT_ACTS = [
  {
    id: 'a1', opportunityId: '1', type: 'Reunión', date: '2026-04-12',
    description: 'Presentación inicial del sistema ASRS al equipo de operaciones.',
    nextStep: 'Enviar propuesta técnica', nextStepDate: '2026-04-20',
  },
  {
    id: 'a2', opportunityId: '1', type: 'Propuesta', date: '2026-04-22',
    description: 'Propuesta técnica y económica enviada por email.',
    nextStep: 'Follow-up telefónico', nextStepDate: '2026-06-04',
  },
  {
    id: 'a3', opportunityId: '2', type: 'Llamada', date: '2026-05-05',
    description: 'Llamada de calificación. Alto interés en VLM para almacén regulado.',
    nextStep: 'Agendar demo en planta', nextStepDate: '2026-06-02',
  },
  {
    id: 'a4', opportunityId: '3', type: 'Demo', date: '2026-04-28',
    description: 'Demo en sitio de AGVs en operación real. Muy buena recepción.',
    nextStep: 'Negociar términos contractuales', nextStepDate: '2026-05-30',
  },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

const usd = v => '$' + Number(v).toLocaleString('en-US');

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Badge({ stage }) {
  const color = STAGE_COLOR[stage] || c.textSec;
  return (
    <span style={{
      background: color + '1a', color,
      border: `1px solid ${color}33`,
      borderRadius: 4, padding: '2px 8px',
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{stage}</span>
  );
}

function Field({ label: l, children, half }) {
  return (
    <div style={{ marginBottom: 12, gridColumn: half ? undefined : '1 / -1' }}>
      <label style={lbl}>{l}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: c.surface, border: `1px solid ${c.border2}`,
        borderRadius: 10, width: '100%', maxWidth: wide ? 600 : 520,
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${c.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: c.textSec,
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px',
          }}>×</button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── New Opportunity Modal ────────────────────────────────────────────────────

function NewOppModal({ onClose, onSave }) {
  const [f, setF] = useState({
    clientName: '', company: '', sector: SECTORS[0], product: PRODUCTS[0],
    value: '', createdAt: new Date().toISOString().slice(0, 10), stage: STAGES[0],
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const valid = f.clientName.trim() && f.company.trim() && parseFloat(f.value) > 0;

  return (
    <Modal title="Nueva Oportunidad" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Field label="Nombre del cliente" half>
          <input style={inp} value={f.clientName} onChange={set('clientName')} placeholder="Juan García" />
        </Field>
        <Field label="Empresa" half>
          <input style={inp} value={f.company} onChange={set('company')} placeholder="ACME SA" />
        </Field>
        <Field label="Sector" half>
          <select style={inp} value={f.sector} onChange={set('sector')}>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Producto" half>
          <select style={inp} value={f.product} onChange={set('product')}>
            {PRODUCTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Valor estimado (USD)" half>
          <input style={inp} type="number" value={f.value} onChange={set('value')} placeholder="150000" min="0" />
        </Field>
        <Field label="Fecha de creación" half>
          <input style={inp} type="date" value={f.createdAt} onChange={set('createdAt')} />
        </Field>
        <Field label="Estado inicial">
          <select style={inp} value={f.stage} onChange={set('stage')}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
        <button style={{ ...btnStyle('primary'), opacity: valid ? 1 : .5, cursor: valid ? 'pointer' : 'default' }}
          onClick={() => valid && onSave({ ...f, id: Date.now().toString(), value: parseFloat(f.value) })}>
          Guardar
        </button>
      </div>
    </Modal>
  );
}

// ─── New Activity Modal ───────────────────────────────────────────────────────

function NewActModal({ opp, onClose, onSave }) {
  const [f, setF] = useState({
    type: ACTIVITY_TYPES[0],
    date: new Date().toISOString().slice(0, 10),
    description: '', nextStep: '', nextStepDate: '',
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const valid = f.description.trim();

  return (
    <Modal title={`Nueva actividad — ${opp.company}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Field label="Tipo" half>
          <select style={inp} value={f.type} onChange={set('type')}>
            {ACTIVITY_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Fecha" half>
          <input style={inp} type="date" value={f.date} onChange={set('date')} />
        </Field>
        <Field label="Descripción">
          <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }}
            value={f.description} onChange={set('description')}
            placeholder="Qué ocurrió en esta interacción..." />
        </Field>
        <Field label="Próximo paso" half>
          <input style={inp} value={f.nextStep} onChange={set('nextStep')} placeholder="ej. Enviar cotización" />
        </Field>
        <Field label="Fecha próximo paso" half>
          <input style={inp} type="date" value={f.nextStepDate} onChange={set('nextStepDate')} />
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
        <button style={{ ...btnStyle('primary'), opacity: valid ? 1 : .5, cursor: valid ? 'pointer' : 'default' }}
          onClick={() => valid && onSave({ ...f, id: Date.now().toString(), opportunityId: opp.id })}>
          Guardar actividad
        </button>
      </div>
    </Modal>
  );
}

// ─── Edit Opportunity Modal ───────────────────────────────────────────────────

function EditOppModal({ opp, onClose, onSave }) {
  const [f, setF] = useState({ ...opp });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  return (
    <Modal title="Editar oportunidad" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Field label="Nombre del cliente" half>
          <input style={inp} value={f.clientName} onChange={set('clientName')} />
        </Field>
        <Field label="Empresa" half>
          <input style={inp} value={f.company} onChange={set('company')} />
        </Field>
        <Field label="Sector" half>
          <select style={inp} value={f.sector} onChange={set('sector')}>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Producto" half>
          <select style={inp} value={f.product} onChange={set('product')}>
            {PRODUCTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Valor estimado (USD)" half>
          <input style={inp} type="number" value={f.value}
            onChange={e => setF(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} />
        </Field>
        <Field label="Fecha de creación" half>
          <input style={inp} type="date" value={f.createdAt} onChange={set('createdAt')} />
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
        <button style={btnStyle('primary')} onClick={() => onSave(f)}>Guardar cambios</button>
      </div>
    </Modal>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ opps, acts, onSelect }) {
  const today = new Date();
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

  const active = opps.filter(o => o.stage !== 'Ganado' && o.stage !== 'Perdido');
  const won    = opps.filter(o => o.stage === 'Ganado');
  const total  = active.reduce((s, o) => s + o.value, 0);
  const avg    = active.length ? Math.round(total / active.length) : 0;

  const upcoming = acts
    .filter(a => a.nextStepDate && (() => { const d = new Date(a.nextStepDate); return d >= today && d <= weekEnd; })())
    .sort((a, b) => new Date(a.nextStepDate) - new Date(b.nextStepDate))
    .slice(0, 7);

  const Stat = ({ label, value, sub, color = c.accent }) => (
    <div style={{
      background: c.surface, border: `1px solid ${c.border}`,
      borderRadius: 8, padding: '14px 18px', flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 10, color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: c.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '20px 24px' }}>
      <h2 style={{ color: c.text, marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Dashboard</h2>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat label="Oportunidades activas" value={active.length} sub={`${won.length} ganadas · ${opps.length} totales`} />
        <Stat label="Pipeline total" value={usd(total)} sub={`${active.length} deals`} color={c.blue} />
        <Stat label="Ticket promedio" value={usd(avg)} sub="activos" color={c.warning} />
        <Stat label="Ganadas" value={won.length} sub={usd(won.reduce((s, o) => s + o.value, 0))} color={c.accent} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, marginBottom: 20 }}>
        {/* Stage chart */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 14 }}>Por etapa</div>
          {STAGES.map(s => {
            const cnt = opps.filter(o => o.stage === s).length;
            const val = opps.filter(o => o.stage === s).reduce((sum, o) => sum + o.value, 0);
            const pct = opps.length ? (cnt / opps.length) * 100 : 0;
            return (
              <div key={s} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: c.textSec }}>{s}</span>
                  <span style={{ fontSize: 11, color: c.text }}>{cnt} · {usd(val)}</span>
                </div>
                <div style={{ height: 3, background: c.border2, borderRadius: 2 }}>
                  <div style={{ height: 3, width: `${pct}%`, background: STAGE_COLOR[s], borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 14 }}>
            Próximos seguimientos (7 días)
          </div>
          {upcoming.length === 0 && (
            <div style={{ color: c.textDim, fontSize: 13, padding: '8px 0' }}>Sin actividades próximas</div>
          )}
          {upcoming.map(a => {
            const o = opps.find(x => x.id === a.opportunityId);
            return (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '8px 0', borderBottom: `1px solid ${c.border}`,
                cursor: 'pointer',
              }} onClick={() => o && onSelect(o)}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.accent }}>{o?.company}</div>
                  <div style={{ fontSize: 12, color: c.textSec, marginTop: 1 }}>{a.nextStep}</div>
                </div>
                <span style={{ fontSize: 11, color: c.textDim, flexShrink: 0, marginLeft: 10 }}>{a.nextStepDate}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, overflow: 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, fontSize: 12, fontWeight: 600, color: c.text }}>
          Todas las oportunidades
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['Empresa', 'Contacto', 'Sector', 'Producto', 'Valor', 'Estado', 'Creado'].map(h => (
              <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: c.textSec, whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {opps.map(o => (
              <tr key={o.id} style={{ borderTop: `1px solid ${c.border}`, cursor: 'pointer' }} onClick={() => onSelect(o)}>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: c.text }}>{o.company}</td>
                <td style={{ padding: '9px 12px', color: c.textSec }}>{o.clientName}</td>
                <td style={{ padding: '9px 12px', color: c.textSec }}>{o.sector}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ fontSize: 11, background: c.border2, color: c.textSec, padding: '2px 6px', borderRadius: 3 }}>{o.product}</span>
                </td>
                <td style={{ padding: '9px 12px', color: c.accent, fontWeight: 700 }}>{usd(o.value)}</td>
                <td style={{ padding: '9px 12px' }}><Badge stage={o.stage} /></td>
                <td style={{ padding: '9px 12px', color: c.textDim }}>{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

function Kanban({ opps, onSelect, onStageChange, onNew }) {
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: c.text, fontWeight: 600, fontSize: 17 }}>Pipeline Kanban</h2>
        <button style={btnStyle('primary')} onClick={onNew}>+ Nueva oportunidad</button>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {STAGES.map(stage => {
          const cards = opps.filter(o => o.stage === stage);
          const stageVal = cards.reduce((s, o) => s + o.value, 0);
          const col = STAGE_COLOR[stage];
          const isTarget = dropTarget === stage;

          return (
            <div key={stage}
              style={{
                minWidth: 192, width: 192, flexShrink: 0,
                background: isTarget ? col + '0d' : c.surface,
                borderRadius: 8,
                border: `1px solid ${isTarget ? col + '55' : c.border}`,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onDragOver={e => { e.preventDefault(); setDropTarget(stage); }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={e => {
                e.preventDefault();
                if (dragging) onStageChange(dragging, stage);
                setDragging(null); setDropTarget(null);
              }}
            >
              <div style={{
                padding: '10px 12px', borderBottom: `1px solid ${c.border}`,
                borderTop: `3px solid ${col}`, borderRadius: '8px 8px 0 0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.text, letterSpacing: '0.02em' }}>{stage}</span>
                  <span style={{
                    background: col + '22', color: col, borderRadius: 10,
                    padding: '0 7px', fontSize: 11, fontWeight: 700,
                  }}>{cards.length}</span>
                </div>
                <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>{usd(stageVal)}</div>
              </div>
              <div style={{ padding: 6, minHeight: 64 }}>
                {cards.map(opp => (
                  <div key={opp.id}
                    draggable
                    onDragStart={() => setDragging(opp.id)}
                    onDragEnd={() => { setDragging(null); setDropTarget(null); }}
                    onClick={() => onSelect(opp)}
                    style={{
                      background: c.surface2, border: `1px solid ${c.border2}`,
                      borderLeft: `3px solid ${col}`,
                      borderRadius: 6, padding: '9px 10px', marginBottom: 5,
                      cursor: 'grab', opacity: dragging === opp.id ? 0.5 : 1,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 2 }}>{opp.company}</div>
                    <div style={{ fontSize: 11, color: c.textSec, marginBottom: 7 }}>{opp.clientName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, background: c.border2, color: c.textDim, padding: '1px 5px', borderRadius: 3 }}>
                        {opp.product}
                      </span>
                      <span style={{ fontSize: 11, color: c.accent, fontWeight: 700 }}>{usd(opp.value)}</span>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div style={{ padding: '10px 6px', fontSize: 11, color: c.textDim, textAlign: 'center' }}>
                    Arrastrá aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ opps, acts, onSelect, onNew }) {
  const [fSector,  setFSector]  = useState('');
  const [fProduct, setFProduct] = useState('');
  const [fStage,   setFStage]   = useState('');
  const [search,   setSearch]   = useState('');
  const [sortKey,  setSortKey]  = useState('createdAt');
  const [sortDir,  setSortDir]  = useState(-1);

  const filtered = useMemo(() => {
    let list = [...opps];
    if (fSector)  list = list.filter(o => o.sector === fSector);
    if (fProduct) list = list.filter(o => o.product === fProduct);
    if (fStage)   list = list.filter(o => o.stage === fStage);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.company.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
    return list;
  }, [opps, fSector, fProduct, fStage, search, sortKey, sortDir]);

  const toggleSort = k => () => {
    if (sortKey === k) setSortDir(d => -d);
    else { setSortKey(k); setSortDir(-1); }
  };
  const TH = ({ label, k }) => (
    <th onClick={toggleSort(k)} style={{
      padding: '6px 12px', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap',
      fontSize: 10, fontWeight: 500, color: sortKey === k ? c.accent : c.textSec,
    }}>
      {label}{sortKey === k ? (sortDir < 0 ? ' ↓' : ' ↑') : ''}
    </th>
  );
  const selStyle = { ...inp, width: 'auto', padding: '6px 10px' };

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ color: c.text, fontWeight: 600, fontSize: 17 }}>Oportunidades</h2>
        <button style={btnStyle('primary')} onClick={onNew}>+ Nueva oportunidad</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <input style={{ ...inp, width: 180, padding: '6px 10px' }}
          placeholder="Buscar empresa o contacto..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={selStyle} value={fSector} onChange={e => setFSector(e.target.value)}>
          <option value="">Todos los sectores</option>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={selStyle} value={fProduct} onChange={e => setFProduct(e.target.value)}>
          <option value="">Todos los productos</option>
          {PRODUCTS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={selStyle} value={fStage} onChange={e => setFStage(e.target.value)}>
          <option value="">Todos los estados</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 11, color: c.textDim }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.border}` }}>
              <TH label="Empresa" k="company" />
              <TH label="Contacto" k="clientName" />
              <TH label="Sector" k="sector" />
              <TH label="Producto" k="product" />
              <TH label="Valor" k="value" />
              <TH label="Estado" k="stage" />
              <TH label="Creado" k="createdAt" />
              <th style={{ padding: '6px 12px', fontSize: 10, fontWeight: 500, color: c.textSec }}>Act.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const actCount = acts.filter(a => a.opportunityId === o.id).length;
              return (
                <tr key={o.id} style={{ borderTop: `1px solid ${c.border}`, cursor: 'pointer' }}
                  onClick={() => onSelect(o)}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: c.text }}>{o.company}</td>
                  <td style={{ padding: '9px 12px', color: c.textSec }}>{o.clientName}</td>
                  <td style={{ padding: '9px 12px', color: c.textSec }}>{o.sector}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ fontSize: 11, background: c.border2, color: c.textSec, padding: '2px 6px', borderRadius: 3 }}>{o.product}</span>
                  </td>
                  <td style={{ padding: '9px 12px', color: c.accent, fontWeight: 700 }}>{usd(o.value)}</td>
                  <td style={{ padding: '9px 12px' }}><Badge stage={o.stage} /></td>
                  <td style={{ padding: '9px 12px', color: c.textDim }}>{o.createdAt}</td>
                  <td style={{ padding: '9px 12px', color: actCount ? c.textSec : c.textDim, textAlign: 'center' }}>{actCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: c.textDim, fontSize: 13 }}>
            Sin resultados para los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Opportunity Detail ───────────────────────────────────────────────────────

function Detail({ opp, acts, onBack, onAddAct, onStageChange, onDelete, onEdit }) {
  const [showActModal,  setShowActModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(false);

  const oppActs = acts
    .filter(a => a.opportunityId === opp.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const col = STAGE_COLOR[opp.stage];

  return (
    <div style={{ padding: '20px 24px', maxWidth: 860 }}>
      {showActModal && (
        <NewActModal opp={opp} onClose={() => setShowActModal(false)}
          onSave={act => { onAddAct(act); setShowActModal(false); }} />
      )}
      {showEditModal && (
        <EditOppModal opp={opp} onClose={() => setShowEditModal(false)}
          onSave={updated => { onEdit(updated); setShowEditModal(false); }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button style={btnStyle('ghost', 'sm')} onClick={onBack}>← Volver</button>
        <span style={{ color: c.textDim }}>·</span>
        <Badge stage={opp.stage} />
      </div>

      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderTop: `3px solid ${col}`, borderRadius: 8, padding: 18, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h2 style={{ color: c.text, fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>{opp.company}</h2>
            <div style={{ color: c.textSec, fontSize: 13 }}>
              {opp.clientName} &nbsp;·&nbsp; {opp.sector} &nbsp;·&nbsp;
              <span style={{ background: c.border2, padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>{opp.product}</span>
            </div>
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 4 }}>Creado: {opp.createdAt}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.accent }}>{usd(opp.value)}</div>
            <button style={{ ...btnStyle('ghost', 'sm'), marginTop: 8 }} onClick={() => setShowEditModal(true)}>
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Stage buttons */}
      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: 14, marginBottom: 14,
      }}>
        <div style={{ fontSize: 10, color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          Mover a etapa
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STAGES.map(s => {
            const active = s === opp.stage;
            const sc = STAGE_COLOR[s];
            return (
              <button key={s} style={{
                ...btnStyle('ghost', 'sm'),
                background: active ? sc + '22' : 'transparent',
                color: active ? sc : c.textSec,
                border: `1px solid ${active ? sc : c.border2}`,
                fontWeight: active ? 700 : 400,
              }} onClick={() => onStageChange(opp.id, s)}>{s}</button>
            );
          })}
        </div>
      </div>

      {/* Activities */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>
            Historial de actividades
            <span style={{ marginLeft: 8, fontSize: 11, color: c.textDim, fontWeight: 400 }}>{oppActs.length} registros</span>
          </div>
          <button style={btnStyle('primary', 'sm')} onClick={() => setShowActModal(true)}>+ Actividad</button>
        </div>

        {oppActs.length === 0 && (
          <div style={{ padding: '16px 0', color: c.textDim, fontSize: 13 }}>
            Sin actividades. Registrá el primer contacto.
          </div>
        )}

        {oppActs.map((a, i) => (
          <div key={a.id} style={{
            display: 'flex', gap: 12, padding: '12px 0',
            borderBottom: i < oppActs.length - 1 ? `1px solid ${c.border}` : 'none',
          }}>
            <div style={{
              width: 34, height: 34, flexShrink: 0, background: c.surface2,
              border: `1px solid ${c.border2}`, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>{ACT_ICON[a.type] || '📌'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: c.text, fontSize: 13 }}>{a.type}</span>
                </div>
                <span style={{ fontSize: 11, color: c.textDim, flexShrink: 0 }}>{a.date}</span>
              </div>
              <div style={{ color: c.textSec, fontSize: 13, lineHeight: 1.5 }}>{a.description}</div>
              {a.nextStep && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: c.surface3, border: `1px solid ${c.border2}`,
                  borderRadius: 4, padding: '4px 8px', marginTop: 6,
                  fontSize: 12, color: c.textSec,
                }}>
                  <span style={{ color: c.warning, fontWeight: 700 }}>→</span>
                  {a.nextStep}
                  {a.nextStepDate && <span style={{ color: c.textDim }}>· {a.nextStepDate}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete */}
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        {confirmDel ? (
          <>
            <span style={{ fontSize: 12, color: c.textSec }}>¿Confirmar eliminación?</span>
            <button style={btnStyle('ghost', 'sm')} onClick={() => setConfirmDel(false)}>Cancelar</button>
            <button style={btnStyle('danger', 'sm')} onClick={() => { onDelete(opp.id); onBack(); }}>
              Sí, eliminar
            </button>
          </>
        ) : (
          <button style={{ ...btnStyle('ghost', 'sm'), color: c.danger, borderColor: c.danger + '44' }}
            onClick={() => setConfirmDel(true)}>
            Eliminar oportunidad
          </button>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'kanban',    label: 'Kanban' },
  { id: 'list',      label: 'Lista' },
];

export default function App() {
  const [opps,    setOpps]    = useState(INIT_OPPS);
  const [acts,    setActs]    = useState(INIT_ACTS);
  const [view,    setView]    = useState('dashboard');
  const [selId,   setSelId]   = useState(null);
  const [newOpp,  setNewOpp]  = useState(false);

  const addOpp      = o  => { setOpps(p => [...p, o]); setNewOpp(false); };
  const editOpp     = o  => setOpps(p => p.map(x => x.id === o.id ? o : x));
  const addAct      = a  => setActs(p => [...p, a]);
  const changeStage = (id, s) => setOpps(p => p.map(o => o.id === id ? { ...o, stage: s } : o));
  const deleteOpp   = id => { setOpps(p => p.filter(o => o.id !== id)); setActs(p => p.filter(a => a.opportunityId !== id)); };

  const selectOpp = o => { setSelId(o.id); setView('detail'); };
  const curOpp    = selId ? opps.find(o => o.id === selId) : null;

  const navTo = v => { setView(v); setSelId(null); };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${c.bg}; color: ${c.text}; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${c.surface}; }
        ::-webkit-scrollbar-thumb { background: ${c.border2}; border-radius: 4px; }
        select option { background: ${c.surface2}; }
        @media (max-width:640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {newOpp && <NewOppModal onClose={() => setNewOpp(false)} onSave={addOpp} />}

      {/* Nav */}
      <div style={{
        background: c.surface, borderBottom: `1px solid ${c.border}`,
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 500,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28, padding: '11px 0', flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, background: c.accent, borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '-0.05em',
          }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', color: c.text }}>Stoka CRM</span>
        </div>

        {VIEWS.map(v => {
          const active = view === v.id && !selId;
          return (
            <button key={v.id} onClick={() => navTo(v.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '15px 12px', fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? c.accent : c.textSec,
              borderBottom: active ? `2px solid ${c.accent}` : '2px solid transparent',
            }}>{v.label}</button>
          );
        })}

        {selId && (
          <button onClick={() => { /* stay */ }} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            padding: '15px 12px', fontSize: 13, fontWeight: 600,
            color: c.accent, borderBottom: `2px solid ${c.accent}`,
          }}>Detalle</button>
        )}

        <div style={{ flex: 1 }} />
        <button style={btnStyle('primary', 'sm')} onClick={() => setNewOpp(true)}>+ Nueva</button>
      </div>

      {/* Content */}
      {view === 'detail' && curOpp ? (
        <Detail
          opp={curOpp}
          acts={acts}
          onBack={() => navTo('list')}
          onAddAct={addAct}
          onStageChange={changeStage}
          onDelete={deleteOpp}
          onEdit={editOpp}
        />
      ) : view === 'kanban' ? (
        <Kanban opps={opps} onSelect={selectOpp} onStageChange={changeStage} onNew={() => setNewOpp(true)} />
      ) : view === 'list' ? (
        <ListView opps={opps} acts={acts} onSelect={selectOpp} onNew={() => setNewOpp(true)} />
      ) : (
        <Dashboard opps={opps} acts={acts} onSelect={selectOpp} />
      )}
    </div>
  );
}
