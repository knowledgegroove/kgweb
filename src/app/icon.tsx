import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Knowledge Groove Logo';
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 20,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontWeight: 900,
                    fontFamily: 'sans-serif',
                }}
            >
                <span style={{ color: '#3b82f6', letterSpacing: '-1px' }}>K</span>
                <span style={{ color: '#334155', letterSpacing: '-1px' }}>G</span>
            </div>
        ),
        {
            ...size,
        }
    );
}
