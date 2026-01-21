import handler from '../../../../api/market/report.js';
import { adaptHandler } from '../../_edgeAdapter.js';

export async function onRequest(context) {
  return adaptHandler(handler, context);
}

