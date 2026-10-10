import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

/** Lazy route: the page chunk loads only when the route is visited. */
export const page = (load: () => Promise<{ default: ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
});

export interface RouteHandle {
  permission?: string;
}
