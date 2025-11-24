// Temporary React type shims to satisfy TypeScript in this environment
// Remove when @types/react is installed.

declare module 'react';
declare module 'react/jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
