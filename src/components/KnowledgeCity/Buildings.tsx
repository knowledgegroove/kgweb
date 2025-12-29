'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// Road Segment Component
export function Road({ position, rotation = [0, 0, 0], length = 20 }: { position: [number, number, number]; rotation?: [number, number, number]; length?: number }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Road Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[7, length]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </mesh>

            {/* Side Lines */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, 0.01, 0]}>
                <planeGeometry args={[0.15, length]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.01, 0]}>
                <planeGeometry args={[0.15, length]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Guard Rails */}
            <group position={[-3.6, 0.5, 0]}>
                <mesh>
                    <boxGeometry args={[0.2, 0.8, length]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
                    <meshStandardMaterial color="#666" />
                </mesh>
            </group>
            <group position={[3.6, 0.5, 0]}>
                <mesh>
                    <boxGeometry args={[0.2, 0.8, length]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* Road Markings - Center Line */}
            <MovingMarkings length={length} />
        </group>
    );
}

function MovingMarkings({ length }: { length: number }) {
    const markings = useRef<THREE.Group>(null);
    const scroll = useScroll();

    useFrame(() => {
        if (markings.current) {
            const offset = scroll.offset * 50;
            markings.current.children.forEach((child, i) => {
                const zPos = ((offset + i * 5) % length) - length / 2;
                child.position.z = -zPos;
            });
        }
    });

    return (
        <group ref={markings} position={[0, 0.02, 0]}>
            {[...Array(Math.floor(length / 5))].map((_, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.2, 2]} />
                    <meshBasicMaterial color="#fff" />
                </mesh>
            ))}
        </group>
    );
}

// Podcast District - Building with Light Microphone Design
export function PodcastDistrict({ position }: { position: [number, number, number] }) {
    const lightsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (lightsRef.current) {
            lightsRef.current.children.forEach((child, i) => {
                const light = child as THREE.PointLight;
                // Pulsing effect with offset for each light
                const pulse = Math.sin(state.clock.elapsedTime * 2 + i * 0.8) * 0.5 + 0.5;
                if (light.intensity !== undefined) {
                    light.intensity = pulse * 3;
                }
            });
        }
    });

    return (
        <group position={position}>
            <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
                {/* Main Building */}
                <mesh position={[0, 4, 0]}>
                    <boxGeometry args={[6, 8, 4]} />
                    <meshStandardMaterial color="#7c3aed" metalness={0.3} roughness={0.4} />
                </mesh>

                {/* Windows */}
                {[...Array(4)].map((_, floor) => (
                    <group key={floor}>
                        {[...Array(3)].map((_, col) => (
                            <mesh key={col} position={[col * 1.8 - 1.8, floor * 1.8 + 1, 2.01]}>
                                <planeGeometry args={[0.8, 1.2]} />
                                <meshBasicMaterial color="#ffeb3b" opacity={0.6} transparent />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Microphone Design Made with Lights on Front */}
                <group ref={lightsRef} position={[0, 4, 2.5]}>
                    {/* Mic Body - Vertical Line of Lights */}
                    {[...Array(5)].map((_, i) => (
                        <pointLight key={`body-${i}`} position={[0, i * 0.8 - 1.5, 0]} color="#a855f7" distance={3} />
                    ))}

                    {/* Mic Head - Circle of Lights */}
                    {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        return (
                            <pointLight
                                key={`head-${i}`}
                                position={[Math.cos(angle) * 0.8, 2 + Math.sin(angle) * 0.8, 0]}
                                color="#d946ef"
                                distance={2}
                            />
                        );
                    })}

                    {/* Base Lights */}
                    <pointLight position={[-0.3, -2, 0]} color="#a855f7" distance={2} />
                    <pointLight position={[0.3, -2, 0]} color="#a855f7" distance={2} />
                </group>
            </Float>

            {/* Large Visible Label */}
            <Text
                position={[0, 9, 0]}
                fontSize={1.0}
                color="#a855f7"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                Podcast
            </Text>
            <Text
                position={[0, 0.5, 0]}
                fontSize={0.4}
                color="#d8b4fe"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                The Knowledge Groove Podcast
            </Text>
        </group>
    );
}

// FinTech District - Wall Street Style
export function FinTechDistrict({ position }: { position: [number, number, number] }) {
    const dataRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (dataRef.current) {
            dataRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <group position={position}>
            <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.15}>
                {/* Front Row - Tallest Buildings */}
                <mesh position={[0, 10, 2]}>
                    <boxGeometry args={[2.5, 20, 2.5]} />
                    <meshStandardMaterial color="#00C4FF" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[-4, 9, 2]}>
                    <boxGeometry args={[2, 18, 2]} />
                    <meshStandardMaterial color="#0099cc" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[4, 8.5, 2]}>
                    <boxGeometry args={[2.2, 17, 2.2]} />
                    <meshStandardMaterial color="#0088bb" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Middle Row */}
                <mesh position={[-2.5, 7, 0]}>
                    <boxGeometry args={[1.8, 14, 1.8]} />
                    <meshStandardMaterial color="#0077aa" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[2.5, 7.5, 0]}>
                    <boxGeometry args={[1.9, 15, 1.9]} />
                    <meshStandardMaterial color="#006699" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[-4.2, 6, 0]}>
                    <boxGeometry args={[1.6, 12, 1.6]} />
                    <meshStandardMaterial color="#005588" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[6, 6.5, 0]}>
                    <boxGeometry args={[1.7, 13, 1.7]} />
                    <meshStandardMaterial color="#004477" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Back Row */}
                <mesh position={[-3.5, 5, -2]}>
                    <boxGeometry args={[1.5, 10, 1.5]} />
                    <meshStandardMaterial color="#003366" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 5.5, -2]}>
                    <boxGeometry args={[1.6, 11, 1.6]} />
                    <meshStandardMaterial color="#002255" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[3.5, 5, -2]}>
                    <boxGeometry args={[1.5, 10, 1.5]} />
                    <meshStandardMaterial color="#003366" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Windows on tallest building */}
                {[...Array(10)].map((_, i) => (
                    <mesh key={i} position={[0, 2 + i * 1.8, 3.26]}>
                        <planeGeometry args={[2, 1.5]} />
                        <meshBasicMaterial color="#ffeb3b" opacity={0.7} transparent />
                    </mesh>
                ))}
            </Float>

            {/* Rotating Data Visualization */}
            <group ref={dataRef} position={[0, 20, 2]}>
                <mesh>
                    <torusGeometry args={[2, 0.1, 16, 32]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2, 0.1, 16, 32]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </group>

            {/* Large Visible Label */}
            <Text
                position={[0, 21, 2]}
                fontSize={1.0}
                color="#00C4FF"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                AI + FinTech
            </Text>
            <Text
                position={[0, 0.5, 0]}
                fontSize={0.4}
                color="#7dd3fc"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                AI + FinTech Lab
            </Text>
        </group>
    );
}

// Academy District - Classroom with Students
export function AcademyDistrict({ position }: { position: [number, number, number] }) {
    const handsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (handsRef.current) {
            handsRef.current.children.forEach((hand, i) => {
                // Hands raise and lower at different times
                const wave = Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.3 + 0.3;
                hand.position.y = 1.5 + wave;
            });
        }
    });

    return (
        <group position={position}>
            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                {/* Classroom Building */}
                <mesh position={[0, 2, 0]}>
                    <boxGeometry args={[8, 4, 6]} />
                    <meshStandardMaterial color="#ec4899" roughness={0.3} />
                </mesh>

                {/* Roof */}
                <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <coneGeometry args={[5, 2, 4]} />
                    <meshStandardMaterial color="#be185d" roughness={0.4} />
                </mesh>

                {/* Blackboard */}
                <mesh position={[0, 2.5, -2.9]}>
                    <planeGeometry args={[3, 1.5]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>

                {/* Desks (rows of students) */}
                {[...Array(3)].map((_, row) => (
                    <group key={row} position={[0, 0, row * 1.5 - 1]}>
                        {[...Array(4)].map((_, col) => (
                            <group key={col} position={[col * 1.8 - 2.7, 0.5, 0]}>
                                {/* Desk */}
                                <mesh>
                                    <boxGeometry args={[0.8, 0.1, 0.6]} />
                                    <meshStandardMaterial color="#8b4513" />
                                </mesh>
                                {/* Student (simple figure) */}
                                <mesh position={[0, 0.5, 0]}>
                                    <sphereGeometry args={[0.2, 8, 8]} />
                                    <meshStandardMaterial color="#ffd700" />
                                </mesh>
                            </group>
                        ))}
                    </group>
                ))}
            </Float>

            {/* Animated Raised Hands */}
            <group ref={handsRef}>
                {[[-2, 0, 0], [0, 0, 0.5], [1.5, 0, -0.5]].map((pos, i) => (
                    <mesh key={i} position={pos as [number, number, number]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#ffb6c1" emissive="#ff69b4" emissiveIntensity={0.5} />
                    </mesh>
                ))}
            </group>

            {/* Large Visible Label */}
            <Text
                position={[0, 5.5, 0]}
                fontSize={1.0}
                color="#ec4899"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                Academy
            </Text>
            <Text
                position={[0, 0.3, 0]}
                fontSize={0.4}
                color="#fbcfe8"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                Knowledge Groove Academy
            </Text>
        </group>
    );
}

// Creator Tower - Modern Professional Building
export function CreatorTower({ position }: { position: [number, number, number] }) {
    const lightsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (lightsRef.current) {
            lightsRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <group position={position}>
            <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
                {/* Main Glass Tower */}
                <mesh position={[0, 8, 0]}>
                    <boxGeometry args={[5, 16, 5]} />
                    <meshStandardMaterial
                        color="#fbbf24"
                        metalness={0.9}
                        roughness={0.1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Glass Panels/Windows */}
                {[...Array(8)].map((_, floor) => (
                    <group key={floor}>
                        {/* Front windows */}
                        <mesh position={[0, floor * 2 + 1, 2.51]}>
                            <planeGeometry args={[4, 1.8]} />
                            <meshBasicMaterial color="#fff8dc" opacity={0.8} transparent />
                        </mesh>
                        {/* Side windows */}
                        <mesh position={[-2.51, floor * 2 + 1, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <planeGeometry args={[4, 1.8]} />
                            <meshBasicMaterial color="#fff8dc" opacity={0.7} transparent />
                        </mesh>
                        <mesh position={[2.51, floor * 2 + 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                            <planeGeometry args={[4, 1.8]} />
                            <meshBasicMaterial color="#fff8dc" opacity={0.7} transparent />
                        </mesh>
                    </group>
                ))}

                {/* Top Crown/Spire */}
                <mesh position={[0, 17, 0]}>
                    <coneGeometry args={[3, 3, 4]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Rotating Light Ring at Top */}
                <group ref={lightsRef} position={[0, 16, 0]}>
                    <mesh>
                        <torusGeometry args={[3, 0.15, 16, 32]} />
                        <meshBasicMaterial color="#fbbf24" />
                    </mesh>
                    <pointLight position={[3, 0, 0]} color="#fbbf24" intensity={2} distance={10} />
                    <pointLight position={[-3, 0, 0]} color="#f59e0b" intensity={2} distance={10} />
                </group>

                {/* Base Platform */}
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[4, 4.5, 0.4, 32]} />
                    <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.3} />
                </mesh>
            </Float>

            {/* Large Visible Label */}
            <Text
                position={[0, 18, 0]}
                fontSize={1.0}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                I&apos;m Ishaan
            </Text>
            <Text
                position={[0, 0.8, 0]}
                fontSize={0.5}
                color="#fde68a"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="#000000"
            >
                Creator & Innovator
            </Text>
        </group>
    );
}
