import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Пробная композиция: проверка, что Remotion рендерит кириллицу и анимацию.
export const TestCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #021f21, #06504b)', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        fontFamily: '"SF Pro Display", system-ui, sans-serif', fontWeight: 800, fontSize: 110, color: '#f0fdfa',
        transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`, opacity: s,
      }}>
        Медицинская <span style={{ color: '#5eead4' }}>реабилитация</span>
      </div>
    </AbsoluteFill>
  );
};
