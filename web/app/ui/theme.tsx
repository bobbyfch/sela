import { MantineProvider, createTheme, type MantineColorsTuple } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';

const quill: MantineColorsTuple = [
  '#f8f5ef', '#f0ebe2', '#e4ddd1', '#d4cbbd', '#c1b5a4',
  '#a99b88', '#8e806c', '#6e6251', '#51483c', '#342f29',
];

export const selaMantineTheme = createTheme({
  primaryColor: 'quill',
  colors: { quill },
  fontFamily: '"DM Sans Variable", "DM Sans", sans-serif',
  headings: { fontFamily: '"Newsreader Variable", "Newsreader", Georgia, serif', fontWeight: '500' },
  defaultRadius: 'lg',
  cursorType: 'default',
  focusRing: 'auto',
  respectReducedMotion: true,
});

export function SelaUiProvider({ children, dark, locale }: React.PropsWithChildren<{ dark: boolean; locale: 'id' | 'en' }>) {
  return <MantineProvider theme={selaMantineTheme} forceColorScheme={dark ? 'dark' : 'light'}>
    <DatesProvider settings={{ locale, firstDayOfWeek: 1, weekendDays: [0, 6] }}>
      <Notifications position="top-right" zIndex={300} limit={3} />
      {children}
    </DatesProvider>
  </MantineProvider>;
}
