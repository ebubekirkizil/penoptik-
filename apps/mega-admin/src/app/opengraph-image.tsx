import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SentientWire';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function og() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, rgba(5, 5, 5, 1) 70%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(to bottom right, #3b82f6, #7c3aed)',
            borderRadius: '40px',
            boxShadow: '0 0 80px rgba(59, 130, 246, 0.5)',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontSize: '90px',
              fontWeight: 900,
              color: 'white',
              fontFamily: 'sans-serif',
            }}
          >
            S
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '80px',
              fontWeight: 900,
              color: 'white',
              fontFamily: 'sans-serif',
              letterSpacing: '-2px',
            }}
          >
            Sentient
          </span>
          <span
            style={{
              fontSize: '80px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'sans-serif',
              letterSpacing: '-2px',
            }}
          >
            Wire
          </span>
        </div>
        <div
          style={{
            marginTop: '30px',
            fontSize: '32px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '8px',
          }}
        >
          The Operating System for Modern Enterprise
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
