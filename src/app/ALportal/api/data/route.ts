import { getViewer, loadPortalData } from "../../_lib/portal";

// Polled by the portal every few seconds so new sessions and sign-ups show up live.
export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const data = await loadPortalData(viewer);
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
