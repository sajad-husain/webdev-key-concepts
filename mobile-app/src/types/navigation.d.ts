// Type-safe navigation triggers for file-based routing
export type AppRoute = 
  | '/'
  | '/decks'
  | '/deck/(string)'
  | '/routines'
  | '/goals'
  | '/stats/(string)'
  | '/settings';

export type AppTab = 'decks' | 'routines' | 'goals' | 'stats' | 'settings';

export function isRouteName(name: string): name is AppRoute {
  return ['/', '/decks', '/deck/', '/routines', '/goals', '/stats/', '/settings'].includes(name);
}