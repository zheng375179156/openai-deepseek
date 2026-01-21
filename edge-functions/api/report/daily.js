import handler from '../../../../../api/report/daily.js';
import { adaptHandler } from '../../_edgeAdapter.js';

export async function onRequest(context) {
  return adaptHandler(handler, context);
}

