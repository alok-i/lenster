import type { IRequest } from 'itty-router';

import k3lFeed from '../helpers/providers/k3lFeed';
import lensterFeed from '../helpers/providers/lenster/lensterFeed';
import type { Env } from '../types';

export default async (request: IRequest, env: Env) => {
  const provider = request.query.provider as string;
  const strategy = request.query.strategy as string;
  const limit = (parseInt(request.query?.limit as string) || 50) as number;
  const offset = (parseInt(request.query?.offset as string) || 0) as number;

  console.log(
    `provider: ${provider}, strategy: ${strategy}, limit: ${limit}, offset: ${offset}`
  );

  if (!provider || !strategy) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Missing required parameters!'
      })
    );
  }

  try {
    let ids: string[] = [];
    switch (provider) {
      case 'k3l':
        ids = await k3lFeed(strategy, limit, offset);
        break;
      case 'lenster':
        ids = await lensterFeed(strategy, limit, offset, env);
        break;
      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid provider'
          })
        );
    }

    let response = new Response(JSON.stringify({ success: true, ids }));

    // Cache for 10 minutes
    response.headers.set('Cache-Control', 'max-age=600');

    return response;
  } catch (error) {
    throw error;
  }
};
