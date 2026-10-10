import { Composition } from 'remotion';
import { TestCard } from './TestCard';
import { Ep01, EP01_DURATION } from './episodes/Ep01';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep01" component={Ep01} durationInFrames={EP01_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="TestCard" component={TestCard} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
