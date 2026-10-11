import { Composition } from 'remotion';
import { TestCard } from './TestCard';
import { Ep01, EP01_DURATION } from './episodes/Ep01';
import { Ep01Vertical, EP01V_DURATION } from './episodes/Ep01Vertical';
import { Ep02, EP02_DURATION } from './episodes/Ep02';
import { Ep02Vertical, EP02V_DURATION } from './episodes/Ep02Vertical';
import { Ep03, EP03_DURATION } from './episodes/Ep03';
import { Ep03Vertical, EP03V_DURATION } from './episodes/Ep03Vertical';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep01" component={Ep01} durationInFrames={EP01_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Ep01Vertical" component={Ep01Vertical} durationInFrames={EP01V_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="Ep02" component={Ep02} durationInFrames={EP02_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Ep02Vertical" component={Ep02Vertical} durationInFrames={EP02V_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="Ep03" component={Ep03} durationInFrames={EP03_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Ep03Vertical" component={Ep03Vertical} durationInFrames={EP03V_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="TestCard" component={TestCard} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
