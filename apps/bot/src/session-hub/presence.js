import { ActivityType } from 'discord.js';

export function sessionPresence(state, now = Date.now()) {
  const stats = state.lastStats;
  const fresh = stats?.available && now - stats.at < 120000 && Number.isInteger(stats.players) && stats.players >= 0;
  return {
    status: 'online',
    activities: [{ name: 'Custom Status', type: ActivityType.Custom, state: fresh ? `${stats.players}/${stats.capacity} players in-game` : 'In-game player count unavailable' }]
  };
}
