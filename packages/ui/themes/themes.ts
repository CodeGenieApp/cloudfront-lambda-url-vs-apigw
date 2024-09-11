import lightTheme from './light'
import darkTheme from './dark'

export const DEFAULT_THEME = 'dark'
export const THEMES = {
  light: lightTheme,
  dark: darkTheme,
}

export function getInitialTheme() {
  return typeof window === 'undefined' ? DEFAULT_THEME : window.localStorage.getItem('theme') || DEFAULT_THEME
}
