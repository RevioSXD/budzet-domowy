import { useState, useEffect, useMemo, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase.js';
import { MONTHS, CATEGORIES, DEFAULT_DATA, genId, fmt, sumArr } from './data.js';

const ALLOWED_EMAILS = [
  '99hobbit@gmail.com',
  'piotr.trzeciak14@gmail.com',
];

// ——— Login Screen ———

function LoginScreen({ onLogin, error, loading }) {
  return (
    <div style={loginStyles.wrap}>
      <div style={loginStyles.card}>
        <div style={loginStyles.icon}>💰</div>
        <h1 style={loginStyles.title}>Budżet Domowy</h1>
        <p style={loginStyles.subtitle}>Piotr & Patrycja</p>
        {error && <div style={loginStyles.error}>{error}</div>}
        <button
          style={loginStyles.btn}
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? '⏳ Logowanie...' : '🔐 Zaloguj się kontem Google'}
        </button>
        <p style={loginStyles.hint}>Dostęp tylko dla autoryzowanych kont</p>
      </div>
    </div>
  );
}

const loginStyles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #0d0d24 0%, #141432 100%)',
    padding: 20,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '48px 32px',
    textAlign: 'center',
    maxWidth: 360,
    width: '100%',
  },
  icon: { fontSize: 56, marginBottom: 12 },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--text-muted)',
    margin: '0 0 32px',
  },
  error: {
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: 500,
  },
  btn: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: 14,
    border: 'none',
    background: 'var(--accent-teal)',
    color: '#000',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.1s',
  },
  hint: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 16,
    marginBottom: 0,
  },
};

// ——— Small Components ———

function ItemForm({ item, onSave, onCancel, showCategory }) {
  const [name, setName] = useState(item?.name || '');
  const [amount, setAmount] = useState(item?.amount || '');
  const [category, setCategory] = useState(item?.category || 'inne');

  return (
    <div className="slide-down" style={s.form}>
      <input
        style={s.input}
        placeholder="Nazwa wydatku"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        style={s.input}
        placeholder="Kwota (zł)"
        type="number"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {showCategory && (
        <select style={s.input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      )}
      <div style={s.formBtns}>
        <button
          style={s.btnSave}
          onClick={() => {
            if (!name.trim() || !amount) return;
            onSave({ name: name.trim(), amount: Number(amount), category });
          }}
        >
          ✓ Zapisz
        </button>
        <button style={s.btnCancel} onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete, showCategory }) {
  const cat = showCategory && CATEGORIES[item.category || 'inne'];
  return (
    <div style={s.itemRow}>
      <div style={s.itemLeft}>
        {cat && (
          <span style={{ ...s.catDot, background: cat.color }}></span>
        )}
        <span style={s.itemName}>{item.name}</span>
      </div>
      <div style={s.itemRight}>
        <span style={s.itemAmount}>{fmt(item.amount)}</span>
        <button style={s.iconBtn} onClick={() => onEdit(item)}>✏️</button>
        <button style={s.iconBtn} onClick={() => onDelete(item.id)}>🗑</button>
      </div>
    </div>
  );
}

function Section({ title, icon, items, onAdd, onEdit, onDelete, showCategory, color }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const total = sumArr(items);

  return (
    <div className="fade-up" style={{ ...s.section, borderLeftColor: color }}>
      <div style={s.sectionHead}>
        <span style={s.sectionTitle}>{icon} {title}</span>
        <span style={{ ...s.sectionSum, color }}>{fmt(total)}</span>
      </div>
      <div style={s.sectionItems}>
        {(items || []).map((it, i) =>
          editing?.id === it.id ? (
            <ItemForm
              key={it.id}
              item={it}
              showCategory={showCategory}
              onSave={(vals) => { onEdit(it.id, vals); setEditing(null); }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <ItemRow
              key={it.id}
              item={it}
              showCategory={showCategory}
              onEdit={setEditing}
              onDelete={onDelete}
            />
          )
        )}
      </div>
      {adding ? (
        <ItemForm
          showCategory={showCategory}
          onSave={(vals) => { onAdd({ ...vals, id: genId() }); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          style={{ ...s.addBtn, color, borderColor: color + '33' }}
          onClick={() => setAdding(true)}
        >
          ＋ Dodaj
        </button>
      )}
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={s.statRow}>
      <span style={s.statLabel}>{label}</span>
      <span style={{ ...s.statVal, color: color || 'var(--text-primary)' }}>{fmt(value)}</span>
    </div>
  );
}

function PersonCard({ name, icon, inc, fix, ext, rem }) {
  return (
    <div className="fade-up" style={s.personCard}>
      <div style={s.personHeader}>{icon} {name}</div>
      <StatRow label="Przychody" value={inc} color="var(--accent-teal)" />
      <StatRow label="Stałe koszty" value={fix} color="var(--accent-red)" />
      <StatRow label="Dodatkowe" value={ext} color="var(--accent-amber)" />
      <div style={s.divider} />
      <StatRow
        label="Pozostaje"
        value={rem}
        color={rem >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)'}
      />
    </div>
  );
}

function CategoryChart({ fixedCosts, extraCosts }) {
  const all = [
    ...(fixedCosts?.piotr || []),
    ...(fixedCosts?.patrycja || []),
    ...(extraCosts?.piotr || []),
    ...(extraCosts?.patrycja || []),
  ];
  const byCat = {};
  all.forEach((it) => {
    const c = it.category || 'inne';
    byCat[c] = (byCat[c] || 0) + (Number(it.amount) || 0);
  });
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;
  const total = sorted.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="fade-up" style={s.catCard}>
      <div style={s.catCardTitle}>Wydatki wg kategorii</div>
      <div style={s.catCardTotal}>Razem: {fmt(total)}</div>
      {sorted.map(([key, val], i) => {
        const cat = CATEGORIES[key] || CATEGORIES.inne;
        const pct = ((val / total) * 100).toFixed(1);
        return (
          <div key={key} style={{ ...s.catItem, animationDelay: `${i * 0.04}s` }} className="fade-up">
            <div style={s.catTop}>
              <span>{cat.icon} {cat.label}</span>
              <span style={s.catAmount}>{fmt(val)} <span style={s.catPct}>({pct}%)</span></span>
            </div>
            <div style={s.barTrack}>
              <div
                style={{
                  ...s.barFill,
                  width: `${(val / max) * 100}%`,
                  background: `linear-gradient(90deg, ${cat.color}cc, ${cat.color})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ——— Main App ———

function BudgetApp({ user }) {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [person, setPerson] = useState('piotr');
  const [synced, setSynced] = useState(false);

  const monthKey = month.replace('-', '_');
  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-');
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
  }, [month]);

  // Firebase realtime listener
  useEffect(() => {
    setLoading(true);
    setSynced(false);
    const dbRef = ref(db, `budget/${monthKey}`);
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Firebase strips empty arrays, so ensure structure
        const safe = {
          incomes: {
            piotr: val.incomes?.piotr || [],
            patrycja: val.incomes?.patrycja || [],
          },
          fixedCosts: {
            piotr: val.fixedCosts?.piotr || [],
            patrycja: val.fixedCosts?.patrycja || [],
          },
          extraCosts: {
            piotr: val.extraCosts?.piotr || [],
            patrycja: val.extraCosts?.patrycja || [],
          },
        };
        setData(safe);
      } else {
        // First time — seed with defaults for May 2026
        const defaults = JSON.parse(JSON.stringify(DEFAULT_DATA));
        if (month === '2026-05') {
          set(dbRef, defaults);
        }
        setData(defaults);
      }
      setLoading(false);
      setSynced(true);
    });
    return () => unsub();
  }, [monthKey, month]);

  const persist = useCallback(
    (newData) => {
      setData(newData);
      set(ref(db, `budget/${monthKey}`), newData);
    },
    [monthKey]
  );

  const mutate = useCallback(
    (path, fn) => {
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        let target = next;
        for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
        target[path[path.length - 1]] = fn(target[path[path.length - 1]] || []);
        set(ref(db, `budget/${monthKey}`), next);
        return next;
      });
    },
    [monthKey]
  );

  const addItem = (section, who) => (item) =>
    mutate([section, who], (arr) => [...arr, item]);
  const editItem = (section, who) => (id, vals) =>
    mutate([section, who], (arr) => arr.map((x) => (x.id === id ? { ...x, ...vals } : x)));
  const deleteItem = (section, who) => (id) =>
    mutate([section, who], (arr) => arr.filter((x) => x.id !== id));

  const changeMonth = (dir) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  if (loading || !data) {
    return (
      <div className="app-shell" style={s.loadingWrap}>
        <div style={s.loadingDot} />
        <div style={s.loadingText}>Wczytuję budżet...</div>
      </div>
    );
  }

  const inc = { piotr: sumArr(data.incomes?.piotr), patrycja: sumArr(data.incomes?.patrycja) };
  const fix = { piotr: sumArr(data.fixedCosts?.piotr), patrycja: sumArr(data.fixedCosts?.patrycja) };
  const ext = { piotr: sumArr(data.extraCosts?.piotr), patrycja: sumArr(data.extraCosts?.patrycja) };
  const rem = { piotr: inc.piotr - fix.piotr - ext.piotr, patrycja: inc.patrycja - fix.patrycja - ext.patrycja };
  const totalInc = inc.piotr + inc.patrycja;
  const totalExp = fix.piotr + fix.patrycja + ext.piotr + ext.patrycja;
  const totalRem = totalInc - totalExp;

  return (
    <div className="app-shell">
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerRow}>
          <div>
            <div style={s.logoRow}>
              <span style={s.logoIcon}>💰</span>
              <span style={s.logoText}>Budżet</span>
              {synced && <span style={s.syncDot} title="Zsynchronizowano">●</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.monthNav}>
              <button style={s.monthBtn} onClick={() => changeMonth(-1)}>‹</button>
              <span style={s.monthText}>{monthLabel}</span>
              <button style={s.monthBtn} onClick={() => changeMonth(1)}>›</button>
            </div>
            <button
              onClick={() => signOut(auth)}
              style={s.logoutBtn}
              title={user?.email}
            >
              {user?.photoURL
                ? <img src={user.photoURL} style={s.avatar} alt="" referrerPolicy="no-referrer" />
                : '👤'}
            </button>
          </div>
        </div>

        {/* Big numbers */}
        <div style={s.heroNumbers}>
          <div style={s.heroItem}>
            <div style={s.heroLabel}>Przychody</div>
            <div style={{ ...s.heroVal, color: 'var(--accent-teal)' }}>{fmt(totalInc)}</div>
          </div>
          <div style={s.heroDivider} />
          <div style={s.heroItem}>
            <div style={s.heroLabel}>Wydatki</div>
            <div style={{ ...s.heroVal, color: 'var(--accent-red)' }}>{fmt(totalExp)}</div>
          </div>
          <div style={s.heroDivider} />
          <div style={s.heroItem}>
            <div style={s.heroLabel}>Zostaje</div>
            <div
              style={{
                ...s.heroVal,
                color: totalRem >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
              }}
            >
              {fmt(totalRem)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div
            style={{
              ...s.progressFill,
              width: `${Math.min((totalExp / (totalInc || 1)) * 100, 100)}%`,
              background:
                totalExp / totalInc > 0.9
                  ? 'var(--accent-red)'
                  : totalExp / totalInc > 0.7
                  ? 'var(--accent-amber)'
                  : 'var(--accent-teal)',
            }}
          />
        </div>
        <div style={s.progressLabel}>
          {((totalExp / (totalInc || 1)) * 100).toFixed(0)}% budżetu wydane
        </div>
      </header>

      {/* Tabs */}
      <nav style={s.tabBar}>
        {[
          { id: 'overview', label: '📊 Przegląd' },
          { id: 'piotr', label: '👨 Piotr' },
          { id: 'patrycja', label: '👩 Patrycja' },
          { id: 'categories', label: '🏷️ Kategorie' },
        ].map((t) => (
          <button
            key={t.id}
            style={tab === t.id ? s.tabActive : s.tabBtn}
            onClick={() => {
              setTab(t.id);
              if (t.id === 'piotr' || t.id === 'patrycja') setPerson(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={s.main}>
        {tab === 'overview' && (
          <div>
            <div style={s.cardGrid}>
              <PersonCard
                name="Piotr"
                icon="👨"
                inc={inc.piotr}
                fix={fix.piotr}
                ext={ext.piotr}
                rem={rem.piotr}
              />
              <PersonCard
                name="Patrycja"
                icon="👩"
                inc={inc.patrycja}
                fix={fix.patrycja}
                ext={ext.patrycja}
                rem={rem.patrycja}
              />
            </div>

            {/* Expense split bar */}
            <div className="fade-up" style={{ ...s.splitCard, animationDelay: '0.15s' }}>
              <div style={s.splitTitle}>Podział wydatków</div>
              <div style={s.splitBar}>
                <div
                  style={{
                    ...s.splitSeg,
                    width: `${((fix.piotr + fix.patrycja) / (totalExp || 1)) * 100}%`,
                    background: 'var(--accent-red)',
                    borderRadius: '8px 0 0 8px',
                  }}
                />
                <div
                  style={{
                    ...s.splitSeg,
                    width: `${((ext.piotr + ext.patrycja) / (totalExp || 1)) * 100}%`,
                    background: 'var(--accent-amber)',
                    borderRadius: '0 8px 8px 0',
                  }}
                />
              </div>
              <div style={s.splitLegend}>
                <span>
                  <span style={{ ...s.legendDot, background: 'var(--accent-red)' }} />
                  Stałe {fmt(fix.piotr + fix.patrycja)}
                </span>
                <span>
                  <span style={{ ...s.legendDot, background: 'var(--accent-amber)' }} />
                  Dodatkowe {fmt(ext.piotr + ext.patrycja)}
                </span>
              </div>
            </div>
          </div>
        )}

        {(tab === 'piotr' || tab === 'patrycja') && (
          <div>
            <Section
              title="Przychody"
              icon="📥"
              items={data.incomes?.[tab] || []}
              onAdd={addItem('incomes', tab)}
              onEdit={editItem('incomes', tab)}
              onDelete={deleteItem('incomes', tab)}
              showCategory={false}
              color="var(--accent-teal)"
            />
            <Section
              title="Stałe koszty"
              icon="📌"
              items={data.fixedCosts?.[tab] || []}
              onAdd={addItem('fixedCosts', tab)}
              onEdit={editItem('fixedCosts', tab)}
              onDelete={deleteItem('fixedCosts', tab)}
              showCategory
              color="var(--accent-red)"
            />
            <Section
              title="Dodatkowe koszty"
              icon="🛍️"
              items={data.extraCosts?.[tab] || []}
              onAdd={addItem('extraCosts', tab)}
              onEdit={editItem('extraCosts', tab)}
              onDelete={deleteItem('extraCosts', tab)}
              showCategory
              color="var(--accent-amber)"
            />
          </div>
        )}

        {tab === 'categories' && (
          <CategoryChart fixedCosts={data.fixedCosts} extraCosts={data.extraCosts} />
        )}
      </main>
    </div>
  );
}

// ——— Auth Wrapper ———

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // Check redirect result on load (for mobile)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        if (!ALLOWED_EMAILS.includes(result.user.email)) {
          signOut(auth);
          setAuthError('Brak dostępu — to konto nie jest autoryzowane.');
        }
      }
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && !ALLOWED_EMAILS.includes(u.email)) {
        signOut(auth);
        setUser(null);
        setAuthError('Brak dostępu — to konto nie jest autoryzowane.');
      } else {
        setUser(u);
        setAuthError(null);
      }
      setAuthLoading(false);
      setLoginLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    setLoginLoading(true);
    try {
      // Try popup first (works on desktop)
      const result = await signInWithPopup(auth, googleProvider);
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        await signOut(auth);
        setAuthError('Brak dostępu — to konto nie jest autoryzowane.');
        setLoginLoading(false);
      }
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-browser') {
        // Fallback to redirect (better for mobile)
        signInWithRedirect(auth, googleProvider);
      } else if (err.code === 'auth/cancelled-popup-request') {
        setLoginLoading(false);
      } else {
        setAuthError('Błąd logowania. Spróbuj ponownie.');
        setLoginLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="app-shell" style={s.loadingWrap}>
        <div style={s.loadingDot} />
        <div style={s.loadingText}>Sprawdzam logowanie...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={authError} loading={loginLoading} />;
  }

  return <BudgetApp user={user} />;
}

// ——— Styles ———

const s = {
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--accent-teal)',
    animation: 'pulse 1.2s ease infinite',
  },
  loadingText: { color: 'var(--text-muted)', fontSize: 14 },

  // Header
  header: {
    background: 'linear-gradient(160deg, #0d0d24 0%, #141432 100%)',
    padding: '16px 20px 14px',
    borderBottom: '1px solid var(--border)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' },
  syncDot: { color: 'var(--accent-teal)', fontSize: 10, marginLeft: 2 },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: '2px',
  },
  monthBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 20,
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: 10,
  },
  monthText: {
    fontSize: 13,
    fontWeight: 700,
    minWidth: 110,
    textAlign: 'center',
    letterSpacing: '0.3px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '50%',
    width: 34,
    height: 34,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'block',
  },

  // Hero numbers
  heroNumbers: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginTop: 18,
    marginBottom: 14,
  },
  heroItem: { flex: 1, textAlign: 'center' },
  heroLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: 4,
  },
  heroVal: {
    fontSize: 18,
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '-0.5px',
  },
  heroDivider: {
    width: 1,
    height: 36,
    background: 'var(--border-light)',
  },

  // Progress
  progressTrack: {
    height: 6,
    borderRadius: 3,
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.6s ease, background 0.3s ease',
  },
  progressLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: 6,
  },

  // Tabs
  tabBar: {
    display: 'flex',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    overflowX: 'auto',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  tabBtn: {
    flex: 1,
    padding: '12px 6px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    flex: 1,
    padding: '12px 6px',
    background: 'none',
    border: 'none',
    color: 'var(--accent-teal)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--accent-teal)',
    transition: 'all 0.2s',
  },

  // Main content
  main: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 16px 100px',
  },

  // Cards grid
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    marginBottom: 12,
  },

  // Person card
  personCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    border: '1px solid var(--border)',
  },
  personHeader: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 12,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
  },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  statVal: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  divider: {
    height: 1,
    background: 'var(--border-light)',
    margin: '6px 0',
  },

  // Split card
  splitCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    border: '1px solid var(--border)',
  },
  splitTitle: { fontSize: 14, fontWeight: 700, marginBottom: 12 },
  splitBar: {
    display: 'flex',
    height: 20,
    borderRadius: 8,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    gap: 2,
  },
  splitSeg: { height: '100%', transition: 'width 0.5s ease' },
  splitLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  legendDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6,
  },

  // Section
  section: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    marginBottom: 12,
    border: '1px solid var(--border)',
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700 },
  sectionSum: {
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
  },
  sectionItems: {},

  // Item row
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 0',
    borderBottom: '1px solid var(--border)',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemName: {
    fontSize: 13,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    marginRight: 4,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px',
    borderRadius: 6,
    opacity: 0.5,
    transition: 'opacity 0.15s',
  },

  // Add button
  addBtn: {
    width: '100%',
    padding: 10,
    background: 'none',
    border: '1.5px dashed',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 8,
    transition: 'all 0.2s',
  },

  // Form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '10px 0',
  },
  input: {
    padding: '11px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border-light)',
    fontSize: 14,
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    transition: 'border-color 0.2s',
  },
  formBtns: { display: 'flex', gap: 8 },
  btnSave: {
    flex: 1,
    padding: 11,
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'var(--accent-teal)',
    color: '#000',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnCancel: {
    flex: 1,
    padding: 11,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border-light)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Category chart
  catCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    border: '1px solid var(--border)',
  },
  catCardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  catCardTotal: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 16,
  },
  catItem: { marginBottom: 14 },
  catTop: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 5,
  },
  catAmount: {
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  catPct: { fontWeight: 400, color: 'var(--text-muted)', fontSize: 11 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.6s ease',
  },
};
