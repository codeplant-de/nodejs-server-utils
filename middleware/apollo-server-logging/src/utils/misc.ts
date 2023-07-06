/**
 * shortens a timestamp to max 4 decimals
 * @param hTimestamp
 */
export const formatTimestamp = (hTimestamp: number): number => Math.round(hTimestamp * 1e4) / 1e4
