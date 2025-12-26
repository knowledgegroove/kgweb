'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const trackVisit = async () => {
            // 1. Get or generate visitor ID
            let visitorId = localStorage.getItem('kg_visitor_id');
            const isNewVisitor = !visitorId;

            if (isNewVisitor) {
                visitorId = crypto.randomUUID();
                localStorage.setItem('kg_visitor_id', visitorId);
                localStorage.setItem('kg_visit_count', '1');
            } else {
                const count = parseInt(localStorage.getItem('kg_visit_count') || '0');
                localStorage.setItem('kg_visit_count', (count + 1).toString());
            }

            const visitCount = parseInt(localStorage.getItem('kg_visit_count') || '1');

            // 2. Prepare payload
            const payload = {
                visitorId,
                path: pathname,
                isUnique: isNewVisitor,
                isRepeating: visitCount > 1,
                visitCount,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: navigator.language
            };

            // 3. Send to API
            try {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error('[Analytics] Failed to log visit:', error);
            }
        };

        trackVisit();
    }, [pathname]);

    return null; // This component doesn't render anything
}
