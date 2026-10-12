import {Config} from '@remotion/cli/config';
Config.setCodec('h264');
Config.setCrf(19);
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('angle');
