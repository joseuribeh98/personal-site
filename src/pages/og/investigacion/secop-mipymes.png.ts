import type { APIRoute } from 'astro';
import { researchSecopOg } from '../../../lib/og';

export const GET: APIRoute = async () => new Response(new Uint8Array(await researchSecopOg()), { headers: { 'Content-Type': 'image/png' } });
