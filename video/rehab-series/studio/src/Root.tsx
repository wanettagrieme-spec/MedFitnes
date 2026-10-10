import { Composition } from 'remotion';
import { TestCard } from './TestCard';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TestCard" component={TestCard} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
