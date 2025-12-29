'use client';

import { useMemo, useRef } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple seeded random to keep render pure for React 19
const createRandom = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
};

export function Trees({ count = 150, area = 200 }: { count?: number, area?: number }) {
    const trees = useMemo(() => {
        const random = createRandom(12345); // Constant seed for stability
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (random() - 0.5) * area;
            const z = (random() - 0.5) * area - 50;
            // Avoid placing trees on the main road path (center) - narrower exclusion for narrower road
            if (Math.abs(x) < 5) continue;

            // Avoid placing trees near districts to prevent overlap
            // Podcast: [-9, -20]
            if (Math.abs(x - (-9)) < 8 && Math.abs(z - (-20)) < 8) continue;
            // FinTech: [9, -40]
            if (Math.abs(x - 9) < 8 && Math.abs(z - (-40)) < 8) continue;
            // Academy: [-9, -60]
            if (Math.abs(x - (-9)) < 8 && Math.abs(z - (-60)) < 8) continue;
            // Creator Tower: [0, -80]
            if (Math.abs(x - 0) < 8 && Math.abs(z - (-80)) < 8) continue;

            const scale = 1.5 + random() * 2; // Larger, more varied sizes
            const typeRandom = random();
            const treeType = typeRandom > 0.7 ? 'pine' : (typeRandom > 0.4 ? 'deciduous' : 'bushy');
            const height = 4 + random() * 6; // Varied heights

            // Varied greens
            const colorBase = random();
            let color;
            if (colorBase > 0.6) color = "#2d5a27"; // Deep green
            else if (colorBase > 0.3) color = "#4a7c35"; // Medium green
            else color = "#6b8c42"; // Lighter olive green

            // Ensure y is 0 to prevent flying trees
            temp.push({ position: [x, 0, z], scale, treeType, height, color });
        }
        return temp;
    }, [count, area]);

    const pines = trees.filter(t => t.treeType === 'pine');
    const deciduous = trees.filter(t => t.treeType === 'deciduous');
    const bushy = trees.filter(t => t.treeType === 'bushy');

    return (
        <group>
            {/* Pine Trees */}
            {pines.map((data, i) => (
                <group key={`pine-${i}`} position={data.position as [number, number, number]} scale={data.scale * 0.5}>
                    <mesh position={[0, data.height * 0.2, 0]}>
                        <cylinderGeometry args={[0.2, 0.4, data.height * 0.4, 8]} />
                        <meshStandardMaterial color="#3d2817" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, data.height * 0.5, 0]}>
                        <coneGeometry args={[1.2, data.height * 0.6, 8]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, data.height * 0.7, 0]}>
                        <coneGeometry args={[1, data.height * 0.5, 8]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, data.height * 0.85, 0]}>
                        <coneGeometry args={[0.8, data.height * 0.4, 8]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                </group>
            ))}

            {/* Deciduous Trees (Round/Cloudy) */}
            {deciduous.map((data, i) => (
                <group key={`deciduous-${i}`} position={data.position as [number, number, number]} scale={data.scale * 0.5}>
                    <mesh position={[0, data.height * 0.25, 0]}>
                        <cylinderGeometry args={[0.2, 0.5, data.height * 0.5, 8]} />
                        <meshStandardMaterial color="#4a3c31" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, data.height * 0.8, 0]}>
                        <dodecahedronGeometry args={[1.5, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                    <mesh position={[0.8, data.height * 0.7, 0.5]}>
                        <dodecahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                    <mesh position={[-0.8, data.height * 0.75, -0.5]}>
                        <dodecahedronGeometry args={[1.1, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.8} />
                    </mesh>
                </group>
            ))}

            {/* Bushy Trees (Low and Wide) */}
            {bushy.map((data, i) => (
                <group key={`bushy-${i}`} position={data.position as [number, number, number]} scale={data.scale * 0.5}>
                    <mesh position={[0, data.height * 0.2, 0]}>
                        <cylinderGeometry args={[0.3, 0.5, data.height * 0.4, 8]} />
                        <meshStandardMaterial color="#4a3c31" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, data.height * 0.6, 0]}>
                        <icosahedronGeometry args={[1.8, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.9} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

export function Mountains() {
    // Create trees for mountain slopes
    const mountainTrees = useMemo(() => {
        const random = createRandom(54321); // Different seed for variety
        const temp = [];
        for (let i = 0; i < 120; i++) {
            // Distribute trees on mountain slopes
            const side = random() > 0.5 ? -1 : 1;
            const x = side * (30 + random() * 50);
            const z = -80 - random() * 60;
            const y = random() * 15; // Trees at various elevations
            const scale = 0.8 + random() * 0.8;
            temp.push({ position: [x, y, z], scale });
        }
        return temp;
    }, []);

    return (
        <group position={[0, -1, -100]}>
            {/* Left Mountain Range */}
            <mesh position={[-55, 0, -20]} rotation={[0, 0.2, 0]}>
                <coneGeometry args={[28, 45, 8]} />
                <meshStandardMaterial color="#5a7d49" roughness={0.9} />
            </mesh>
            <mesh position={[-40, 0, -10]} rotation={[0, 0.1, 0]}>
                <coneGeometry args={[22, 38, 8]} />
                <meshStandardMaterial color="#4a6b3a" roughness={0.9} />
            </mesh>
            <mesh position={[-48, 0, -35]} rotation={[0, -0.1, 0]}>
                <coneGeometry args={[25, 42, 8]} />
                <meshStandardMaterial color="#5a7d49" roughness={0.9} />
            </mesh>

            {/* Right Mountain Range */}
            <mesh position={[55, 0, -15]} rotation={[0, -0.2, 0]}>
                <coneGeometry args={[26, 43, 8]} />
                <meshStandardMaterial color="#5a7d49" roughness={0.9} />
            </mesh>
            <mesh position={[42, 0, -8]} rotation={[0, -0.15, 0]}>
                <coneGeometry args={[20, 36, 8]} />
                <meshStandardMaterial color="#4a6b3a" roughness={0.9} />
            </mesh>
            <mesh position={[50, 0, -30]} rotation={[0, 0.1, 0]}>
                <coneGeometry args={[24, 40, 8]} />
                <meshStandardMaterial color="#5a7d49" roughness={0.9} />
            </mesh>

            {/* Distant Central Mountains */}
            <mesh position={[-15, 2, -50]} rotation={[0, 0.05, 0]}>
                <coneGeometry args={[35, 55, 8]} />
                <meshStandardMaterial color="#6b8e5a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3, -60]} rotation={[0, 0, 0]}>
                <coneGeometry args={[40, 60, 8]} />
                <meshStandardMaterial color="#7c9a6d" roughness={0.9} />
            </mesh>
            <mesh position={[18, 2, -55]} rotation={[0, -0.08, 0]}>
                <coneGeometry args={[32, 52, 8]} />
                <meshStandardMaterial color="#6b8e5a" roughness={0.9} />
            </mesh>

            {/* Trees on Mountain Slopes */}
            <Instances range={mountainTrees.length}>
                <cylinderGeometry args={[0.2, 0.3, 2, 6]} />
                <meshStandardMaterial color="#3d2817" roughness={0.95} />
                {mountainTrees.map((data, i) => (
                    <Instance
                        key={i}
                        position={data.position as [number, number, number]}
                        scale={[data.scale, data.scale, data.scale] as [number, number, number]}
                    />
                ))}
            </Instances>

            {/* Tree Foliage on Mountains */}
            <Instances range={mountainTrees.length}>
                <coneGeometry args={[1.2, 3, 6]} />
                <meshStandardMaterial color="#2d5016" roughness={0.85} />
                {mountainTrees.map((data, i) => (
                    <Instance
                        key={i}
                        position={[data.position[0], data.position[1] + 2, data.position[2]] as [number, number, number]}
                        scale={[data.scale, data.scale, data.scale] as [number, number, number]}
                    />
                ))}
            </Instances>
        </group>
    );
}


// Smaller, more realistic car component
function Car({ position, color }: { position: [number, number, number], color: string }) {
    return (
        <group position={position} scale={0.4}>
            {/* Car Body */}
            <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[1.8, 0.6, 4]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Car Roof */}
            <mesh position={[0, 0.8, -0.3]}>
                <boxGeometry args={[1.6, 0.6, 2]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Windshield */}
            <mesh position={[0, 0.8, 0.8]}>
                <boxGeometry args={[1.5, 0.5, 0.1]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Wheels */}
            <mesh position={[-0.9, -0.1, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.9, -0.1, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[-0.9, -0.1, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.9, -0.1, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
}

// Highway Cars - animated continuously based on time
export function HighwayCars() {
    const carsRef = useRef<THREE.Group>(null);

    const cars = useMemo(() => [
        // Left Lane (Oncoming)
        { lane: -1.8, offset: 0, color: '#ff4444', speed: 8 },
        { lane: -1.8, offset: -60, color: '#44ff44', speed: 9 },
        { lane: -1.8, offset: -120, color: '#ffaa44', speed: 7.5 },
        // Right Lane (Going away)
        { lane: 1.8, offset: -30, color: '#4444ff', speed: 7 },
        { lane: 1.8, offset: -90, color: '#ffff44', speed: 8.5 },
        { lane: 1.8, offset: -150, color: '#44ffff', speed: 8 },
    ], []);

    useFrame((state) => {
        if (carsRef.current) {
            carsRef.current.children.forEach((carGroup, i) => {
                const car = cars[i];
                // Move cars continuously based on time
                // Cars move backward (negative z direction)
                carGroup.position.z = ((car.offset - state.clock.elapsedTime * car.speed) % 200) + 20;

                // Reset to far position when they go too far forward
                if (carGroup.position.z > 20) {
                    carGroup.position.z = -180 + (carGroup.position.z - 20);
                }
            });
        }
    });

    return (
        <group ref={carsRef} position={[0, 0.2, 0]}>
            {cars.map((car, i) => (
                <group key={i} position={[car.lane, 0, car.offset]}>
                    <Car position={[0, 0, 0]} color={car.color} />
                </group>
            ))}
        </group>
    );
}
