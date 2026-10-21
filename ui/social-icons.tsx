import React from 'react';
import {socialIconPaths, type SocialBrand} from '../app/library/social-icons.ts';

export function SocialIcon({brand}: {brand: SocialBrand}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className="social-brand-icon"
    >
      <path d={socialIconPaths[brand]} />
    </svg>
  );
}
