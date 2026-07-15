import React from 'react'

const GatewayLogo = ({ className }) => (
  <svg 
    width="30" 
    height="30" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Lintel top beams */}
    <path d="M2 5h20" strokeWidth="2" />
    <path d="M4 3h16" />
    {/* Outer Arch */}
    <path d="M5 22V8.5C5 5.18 7.68 2.5 11 2.5h2c3.32 0 6 2.68 6 6V22" strokeWidth="2" />
    {/* Inner Arch */}
    <path d="M8 22v-9.5c0-2.2 1.8-4 4-4s4 1.8 4 4V22" />
    {/* Rising Sun Motif */}
    <circle cx="12" cy="17" r="2.5" fill="var(--primary-color)" stroke="none" />
  </svg>
)

export default GatewayLogo
