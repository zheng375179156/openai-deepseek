import handler from '../../../../../api/holdings/analyze.js';
import { adaptHandler } from '../../_edgeAdapter.js';

export async function onRequest(context) {
  return adaptHandler(handler, context);
}

