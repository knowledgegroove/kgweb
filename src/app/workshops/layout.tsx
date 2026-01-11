import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Workshop Center | Knowledge Groove",
    description: "Explore our past workshops and moments from the Knowledge Groove community.",
};

export default function WorkshopsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
