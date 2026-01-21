import handler from '../../../api/analyze-stock.js';
import { adaptHandler } from '../_edgeAdapter.js';

export async function onRequest(context) {
  return adaptHandler(handler, context);
}

