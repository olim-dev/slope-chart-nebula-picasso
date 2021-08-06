import { embed } from '@nebula.js/stardust';
import qlikAppPromise from 'config/qlikApp';
import slope from './slope-sn';

export default new Promise((resolve) => {
  (async () => {
    const qlikApp = await qlikAppPromise;
    const nebula = embed(qlikApp, {
      types: [{
        name: 'slope',
        load: () => Promise.resolve(slope),
      }],
    });
    resolve(nebula);
  })();
});
