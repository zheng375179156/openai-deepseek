import handler from '../../../../../api/stock/search.js';
import { adaptHandler } from '../../_edgeAdapter.js';

export async function onRequest(context) {
  return adaptHandler(handler, context);
}

