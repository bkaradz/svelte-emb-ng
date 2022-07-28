import { readable } from 'svelte/store'

const settingsAsideTags = [
  {
    id: 1,
    url: '/settings',
    name: 'Dashboard',
    icon: `<svg class="h-5 w-5 text-pickled-bluewood-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" ><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
							</svg>`,
  },
  {
    id: 2,
    url: '/settings/company',
    name: 'Profile',
    icon: `<svg class="h-5 w-5 text-pickled-bluewood-500" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
		</svg>`,
  },
  {
    id: 3,
    url: '/settings/users',
    name: 'Users',
    icon: `<svg class="h-5 w-5 text-pickled-bluewood-500" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>`,
  },
  {
    id: 4,
    url: '/settings/options',
    name: 'Options',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pickled-bluewood-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round"	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
		</svg>`,
  },
  {
    id: 5,
    url: '/settings/pricelists',
    name: 'Pricelists',
    icon: `<svg class="h-5 w-5 text-pickled-bluewood-500" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
		</svg>`,
  },
]

export const settingsAsideList = readable(settingsAsideTags)
