'use client';

export function FeatureGraphic() {
  return (
    <div
      style={{
        width: '1024px',
        height: '500px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        flexShrink: 0,
        // Gradient background: #0f172a → #6366F1
        background: 'linear-gradient(105deg, #0f172a 0%, #1e2060 45%, #6366F1 100%)',
      }}
    >
      {/* Radial glow near the indigo (right) side */}
      <div
        style={{
          position: 'absolute',
          right: '-60px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0.12) 50%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Scattered sparkle ✦ marks */}
      {[
        { top: '12%', left: '6%', size: 14, opacity: 0.18 },
        { top: '72%', left: '3%', size: 10, opacity: 0.12 },
        { top: '30%', left: '28%', size: 8, opacity: 0.14 },
        { top: '85%', left: '22%', size: 12, opacity: 0.16 },
        { top: '8%', left: '42%', size: 9, opacity: 0.13 },
        { top: '60%', left: '52%', size: 11, opacity: 0.15 },
        { top: '18%', left: '67%', size: 10, opacity: 0.14 },
        { top: '88%', left: '70%', size: 8, opacity: 0.11 },
        { top: '40%', left: '82%', size: 13, opacity: 0.17 },
        { top: '5%', left: '88%', size: 9, opacity: 0.12 },
        { top: '75%', left: '90%', size: 11, opacity: 0.13 },
      ].map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            color: '#ffffff',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          ✦
        </span>
      ))}

      {/* ── LEFT SIDE — text content ── */}
      <div
        style={{
          position: 'absolute',
          left: '72px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
          maxWidth: '480px',
        }}
      >
        {/* App name */}
        <h1
          style={{
            fontSize: '76px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: 1,
            margin: 0,
            padding: 0,
          }}
        >
          learnimo
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '22px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.82)',
            letterSpacing: '0.01em',
            margin: '14px 0 0 0',
            padding: 0,
            lineHeight: 1.3,
          }}
        >
          your knowledge journal
        </p>

        {/* Frosted-glass pills */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '28px',
          }}
        >
          {['Capture', 'Search', 'Organize'].map((label) => (
            <div
              key={label}
              style={{
                padding: '7px 20px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDE — mascot circle ── */}
      <div
        style={{
          position: 'absolute',
          right: '96px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '288px',
          height: '288px',
          borderRadius: '50%',
          background: '#D4E8F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 0 0 10px rgba(99,102,241,0.18), 0 0 60px rgba(99,102,241,0.3)',
          overflow: 'visible',
        }}
      >
        {/* Scholarly crow SVG mascot */}
        <svg
          width="200"
          height="220"
          viewBox="0 0 200 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginTop: '8px' }}
        >
          {/* Body */}
          <ellipse cx="100" cy="148" rx="52" ry="58" fill="#1a2340" />
          {/* Wing left */}
          <ellipse cx="58" cy="155" rx="28" ry="44" fill="#151d33" transform="rotate(-10 58 155)" />
          {/* Wing right */}
          <ellipse cx="142" cy="155" rx="28" ry="44" fill="#151d33" transform="rotate(10 142 155)" />
          {/* Neck */}
          <ellipse cx="100" cy="102" rx="26" ry="22" fill="#1a2340" />
          {/* Head */}
          <ellipse cx="100" cy="76" rx="38" ry="36" fill="#1a2340" />
          {/* Beak */}
          <path d="M78 82 L62 90 L78 96 Z" fill="#d97706" />
          {/* Eye white left */}
          <circle cx="86" cy="70" r="11" fill="white" />
          {/* Eye white right */}
          <circle cx="114" cy="70" r="11" fill="white" />
          {/* Pupil left */}
          <circle cx="84" cy="71" r="6" fill="#111827" />
          {/* Pupil right */}
          <circle cx="112" cy="71" r="6" fill="#111827" />
          {/* Eye shine left */}
          <circle cx="86" cy="68" r="2" fill="white" />
          <circle cx="115" cy="68" r="2" fill="white" />
          {/* Gold glasses frames */}
          {/* Left lens frame */}
          <circle cx="86" cy="70" r="12" fill="none" stroke="#D97706" strokeWidth="2.5" />
          {/* Right lens frame */}
          <circle cx="114" cy="70" r="12" fill="none" stroke="#D97706" strokeWidth="2.5" />
          {/* Glasses bridge */}
          <line x1="98" y1="70" x2="102" y2="70" stroke="#D97706" strokeWidth="2.5" />
          {/* Glasses left arm */}
          <line x1="74" y1="68" x2="64" y2="64" stroke="#D97706" strokeWidth="2" />
          {/* Glasses right arm */}
          <line x1="126" y1="68" x2="136" y2="64" stroke="#D97706" strokeWidth="2" />
          {/* Mortar board — cap */}
          <rect x="70" y="42" width="60" height="7" rx="2" fill="#111827" />
          {/* Cap top */}
          <rect x="85" y="30" width="30" height="14" rx="2" fill="#111827" />
          {/* Tassel */}
          <line x1="130" y1="42" x2="136" y2="55" stroke="#D97706" strokeWidth="2" />
          <circle cx="136" cy="57" r="3" fill="#D97706" />
          {/* Feet */}
          <ellipse cx="86" cy="205" rx="14" ry="5" fill="#1a2340" />
          <ellipse cx="114" cy="205" rx="14" ry="5" fill="#1a2340" />
          {/* Claws left */}
          <line x1="78" y1="207" x2="70" y2="213" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
          <line x1="84" y1="208" x2="80" y2="215" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
          <line x1="90" y1="207" x2="90" y2="215" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
          {/* Claws right */}
          <line x1="106" y1="207" x2="110" y2="215" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
          <line x1="112" y1="208" x2="116" y2="215" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="207" x2="128" y2="213" stroke="#1a2340" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Floating emoji icons around the circle */}
        {[
          { emoji: '📖', angle: -50, dist: 160, size: 28 },
          { emoji: '💡', angle: 35, dist: 160, size: 24 },
          { emoji: '✏️', angle: 140, dist: 155, size: 26 },
          { emoji: '🏷️', angle: 220, dist: 158, size: 24 },
        ].map(({ emoji, angle, dist, size }) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * dist;
          const y = Math.sin(rad) * dist;
          return (
            <span
              key={emoji}
              style={{
                position: 'absolute',
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${size}px`,
                opacity: 0.72,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>
    </div>
  );
}
