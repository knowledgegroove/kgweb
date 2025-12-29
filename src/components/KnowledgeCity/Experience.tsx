import { useScroll, Sky, PerspectiveCamera, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { PodcastDistrict, FinTechDistrict, AcademyDistrict, CreatorTower, Road } from './Buildings';
import { Trees, Mountains, HighwayCars } from './Nature';

export default function Experience() {
    const scroll = useScroll();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const groupRef = useRef<THREE.Group>(null);

    const cloudGroupRef = useRef<THREE.Group>(null);

    // Define keyframes for camera path
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 2, 10),    // Start
            new THREE.Vector3(0, 5, -10),   // Podcast Approach
            new THREE.Vector3(0, 6, -30),   // FinTech Approach
            new THREE.Vector3(0, 6, -50),   // Academy Approach
            new THREE.Vector3(0, 12, -70),  // Creator Tower Approach
            new THREE.Vector3(0, 20, -90),  // End Overview
        ], false, 'catmullrom', 0.5);
    }, []);

    useFrame((state, delta) => {
        const offset = scroll.offset;
        const point = curve.getPoint(offset);
        const lookAtPoint = curve.getPoint(Math.min(offset + 0.1, 1));

        if (cameraRef.current) {
            cameraRef.current.position.lerp(point, delta * 24);
            cameraRef.current.lookAt(lookAtPoint);

            if (cloudGroupRef.current) {
                cloudGroupRef.current.position.z = cameraRef.current.position.z;
            }
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 10]} ref={cameraRef} fov={60} />

            {/* Sunset Environment */}
            <color attach="background" args={['#ffd7a8']} />

            <Sky
                sunPosition={[100, 5, 100]}
                inclination={0.52}
                azimuth={0.25}
                turbidity={8}
                rayleigh={2}
            />

            <group ref={cloudGroupRef}>
                <Cloud position={[-20, 15, -10]} speed={0.1} opacity={0.4} color="#ffb380" />
                <Cloud position={[25, 18, -25]} speed={0.15} opacity={0.3} color="#ffa060" />
                <Cloud position={[-15, 20, -45]} speed={0.12} opacity={0.35} color="#ff9050" />
                <Cloud position={[30, 16, -55]} speed={0.08} opacity={0.4} color="#ffb890" />
                <Cloud position={[-25, 22, -70]} speed={0.1} opacity={0.35} color="#ffb380" />
            </group>

            <ambientLight intensity={0.6} color="#ffe4b5" />
            <directionalLight
                position={[100, 30, 50]}
                intensity={1.8}
                color="#ffb366"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <hemisphereLight
                intensity={0.5}
                color="#ffd7a8"
                groundColor="#7fa86e"
            />

            <fog attach="fog" args={['#ffd7a8', 20, 100]} />

            <group ref={groupRef}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial
                        color="#5a9e3a"
                        roughness={0.9}
                        metalness={0.1}
                    />
                </mesh>

                <Trees count={300} area={250} />
                <Mountains />
                <HighwayCars />

                <Road position={[0, 0.1, 10]} length={30} />
                <Road position={[0, 0.1, -20]} length={40} />
                <Road position={[0, 0.1, -60]} length={40} />
                <Road position={[0, 0.1, -100]} length={40} />
                <Road position={[0, 0.1, -140]} length={40} />

                <PodcastDistrict position={[-9, 0, -20]} />
                <FinTechDistrict position={[9, 0, -40]} />
                <AcademyDistrict position={[-9, 0, -60]} />
                <CreatorTower position={[0, 0, -80]} />
            </group>
        </>
    );
}
