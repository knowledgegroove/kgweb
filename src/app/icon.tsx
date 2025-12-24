import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Knowledge Groove Logo';
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

const b64 = "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";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={`data:image/png;base64,${b64}`}
                    alt="KG Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: 'translate(1px, 1px)', // Subtle South-East shift for better visual balance
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
