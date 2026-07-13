import type { GardenSaveV1 } from "../state/types";
import type { GardenApiClient, GardenSyncResult } from "./types";

/**
 * Starter conflict policy:
 * - Higher revision wins.
 * - If revisions are equal, newer updatedAt wins.
 *
 * Production should ideally use an opaque server version / ETag and return 409
 * on conflict instead of trusting device clocks.
 */
export async function syncGarden(
  api: GardenApiClient,
  localGarden: GardenSaveV1,
): Promise<GardenSyncResult> {
  const remote = await api.fetchGarden(localGarden.userId);

  if (!remote) {
    const pushed = await api.pushGarden(localGarden.userId, localGarden, null);
    return { action: "pushed", garden: pushed.garden };
  }

  const remoteIsNewer =
    remote.garden.revision > localGarden.revision ||
    (remote.garden.revision === localGarden.revision &&
      remote.garden.updatedAt > localGarden.updatedAt);

  if (remoteIsNewer) {
    return { action: "pulled", garden: remote.garden };
  }

  const localIsNewer =
    localGarden.revision > remote.garden.revision ||
    localGarden.updatedAt > remote.garden.updatedAt;

  if (localIsNewer) {
    const pushed = await api.pushGarden(
      localGarden.userId,
      localGarden,
      remote.serverRevision,
    );
    return { action: "pushed", garden: pushed.garden };
  }

  return { action: "unchanged", garden: localGarden };
}
