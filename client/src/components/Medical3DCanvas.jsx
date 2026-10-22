import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const Medical3DCanvas = ({ className = '', interactive = true, showBadges = true }) => {
    const mountRef = useRef(null);
    const [activeStat, setActiveStat] = useState('Govt Hospital Bridge');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // Scene, Camera, Renderer
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 18);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        container.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const cyanLight = new THREE.PointLight(0x06b6d4, 4, 30);
        cyanLight.position.set(8, 6, 8);
        scene.add(cyanLight);

        const emeraldLight = new THREE.PointLight(0x10b981, 3.5, 30);
        emeraldLight.position.set(-8, -6, 6);
        scene.add(emeraldLight);

        const violetLight = new THREE.PointLight(0x818cf8, 2.5, 25);
        violetLight.position.set(0, 10, -5);
        scene.add(violetLight);

        // Main 3D Pivot Group
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. DNA Double Helix
        const helixGroup = new THREE.Group();
        const strandCount = 28;
        const radius = 2.4;
        const heightSpan = 11;
        const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);

        const cyanMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.85,
            roughness: 0.2,
            metalness: 0.8
        });

        const emeraldMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.85,
            roughness: 0.2,
            metalness: 0.8
        });

        const rungMat = new THREE.MeshBasicMaterial({
            color: 0x5eead4,
            transparent: true,
            opacity: 0.45
        });

        for (let i = 0; i < strandCount; i++) {
            const t = (i / strandCount) * Math.PI * 4;
            const y = (i / strandCount - 0.5) * heightSpan;

            const x1 = Math.cos(t) * radius;
            const z1 = Math.sin(t) * radius;
            const node1 = new THREE.Mesh(sphereGeo, cyanMat);
            node1.position.set(x1, y, z1);
            helixGroup.add(node1);

            const x2 = Math.cos(t + Math.PI) * radius;
            const z2 = Math.sin(t + Math.PI) * radius;
            const node2 = new THREE.Mesh(sphereGeo, emeraldMat);
            node2.position.set(x2, y, z2);
            helixGroup.add(node2);

            // Cross-rung connection
            if (i % 2 === 0) {
                const distance = 2 * radius;
                const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
                const rung = new THREE.Mesh(rungGeo, rungMat);
                rung.position.set(0, y, 0);
                rung.rotation.z = Math.PI / 2;
                rung.rotation.y = -t;
                helixGroup.add(rung);
            }
        }
        helixGroup.rotation.z = 0.28;
        helixGroup.rotation.x = 0.15;
        mainGroup.add(helixGroup);

        // 2. Central Pulsing Hologram Core
        const coreGroup = new THREE.Group();
        const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
        const coreWireMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const coreWire = new THREE.Mesh(coreGeo, coreWireMat);
        coreGroup.add(coreWire);

        const innerCoreGeo = new THREE.SphereGeometry(0.9, 24, 24);
        const innerCoreMat = new THREE.MeshStandardMaterial({
            color: 0x0d9488,
            emissive: 0x14b8a6,
            emissiveIntensity: 0.9,
            roughness: 0.1,
            metalness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
        coreGroup.add(innerCore);

        mainGroup.add(coreGroup);

        // 3. Orbiting Data Rings & Hospital / Doctor Satellites
        const orbitGroup = new THREE.Group();

        // Ring 1
        const ring1Geo = new THREE.TorusGeometry(4.2, 0.03, 16, 100);
        const ring1Mat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.4
        });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 2.3;
        ring1.rotation.y = 0.3;
        orbitGroup.add(ring1);

        // Ring 2 (Cross orbit)
        const ring2Geo = new THREE.TorusGeometry(5.0, 0.025, 16, 100);
        const ring2Mat = new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            transparent: true,
            opacity: 0.35
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = -Math.PI / 2.8;
        ring2.rotation.y = -0.4;
        orbitGroup.add(ring2);

        // Satellite 1: Govt Hospital Node
        const sat1Geo = new THREE.SphereGeometry(0.32, 16, 16);
        const sat1Mat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x22d3ee,
            emissiveIntensity: 1
        });
        const satHospital = new THREE.Mesh(sat1Geo, sat1Mat);
        orbitGroup.add(satHospital);

        // Satellite 2: Voluntary Doctor Node
        const sat2Geo = new THREE.SphereGeometry(0.28, 16, 16);
        const sat2Mat = new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            emissive: 0xc084fc,
            emissiveIntensity: 1
        });
        const satDoctor = new THREE.Mesh(sat2Geo, sat2Mat);
        orbitGroup.add(satDoctor);

        // Satellite 3: Patient Queue Node
        const sat3Geo = new THREE.SphereGeometry(0.25, 16, 16);
        const sat3Mat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x34d399,
            emissiveIntensity: 1
        });
        const satPatient = new THREE.Mesh(sat3Geo, sat3Mat);
        orbitGroup.add(satPatient);

        mainGroup.add(orbitGroup);

        // 4. Floating Ambient Health Data Particles
        const particleCount = 350;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0x06b6d4),
            new THREE.Color(0x10b981),
            new THREE.Color(0x818cf8),
            new THREE.Color(0x5eead4)
        ];

        for (let i = 0; i < particleCount; i++) {
            const rad = 5 + Math.random() * 8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            particlePositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = rad * Math.cos(phi);

            const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            particleColors[i * 3] = chosenColor.r;
            particleColors[i * 3 + 1] = chosenColor.g;
            particleColors[i * 3 + 2] = chosenColor.b;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);

        // Mouse Tracking & Interactivity
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        let isDragging = false;
        let prevPointerX = 0;
        let prevPointerY = 0;
        let clickPulseTime = 0;

        const handlePointerMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            if (isDragging) {
                const deltaX = e.clientX - prevPointerX;
                const deltaY = e.clientY - prevPointerY;
                targetRotationY += deltaX * 0.008;
                targetRotationX += deltaY * 0.008;
                prevPointerX = e.clientX;
                prevPointerY = e.clientY;
            } else {
                mouseX = x * 2;
                mouseY = y * 2;
                targetRotationY = mouseX * 0.7;
                targetRotationX = -mouseY * 0.5;
            }
        };

        const handlePointerDown = (e) => {
            isDragging = true;
            prevPointerX = e.clientX;
            prevPointerY = e.clientY;
        };

        const handlePointerUp = () => {
            isDragging = false;
        };

        const handleClick = () => {
            clickPulseTime = 1.0;
        };

        if (interactive) {
            container.addEventListener('pointermove', handlePointerMove);
            container.addEventListener('pointerdown', handlePointerDown);
            window.addEventListener('pointerup', handlePointerUp);
            container.addEventListener('click', handleClick);
        }

        // Resize handler
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Smooth rotation damping (lerp)
            mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05 + 0.003;
            mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

            // DNA Rotation
            helixGroup.rotation.y += 0.008;

            // Orbit Satellites
            const sat1Angle = elapsedTime * 0.9;
            satHospital.position.set(
                Math.cos(sat1Angle) * 4.2,
                Math.sin(sat1Angle) * 0.8,
                Math.sin(sat1Angle) * 4.2
            );

            const sat2Angle = -elapsedTime * 0.7 + Math.PI;
            satDoctor.position.set(
                Math.sin(sat2Angle) * 5.0,
                Math.cos(sat2Angle) * 1.5,
                Math.cos(sat2Angle) * 5.0
            );

            const sat3Angle = elapsedTime * 1.2 + 2.0;
            satPatient.position.set(
                Math.cos(sat3Angle) * 3.4,
                Math.sin(sat3Angle) * 3.4 * 0.5,
                Math.sin(sat3Angle) * 3.4
            );

            // Cardiac Heartbeat Rhythm
            const heartbeat = 1 + 0.12 * Math.pow(Math.sin(elapsedTime * 3.2), 3) + 0.05 * Math.sin(elapsedTime * 6.4);
            const rippleBoost = clickPulseTime > 0 ? clickPulseTime * 0.4 : 0;
            if (clickPulseTime > 0) clickPulseTime -= 0.02;

            coreGroup.scale.set(
                (heartbeat + rippleBoost),
                (heartbeat + rippleBoost),
                (heartbeat + rippleBoost)
            );
            coreWire.rotation.y += 0.01;
            coreWire.rotation.x += 0.007;

            // Drift particles slowly
            particleSystem.rotation.y = elapsedTime * 0.02;
            particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.08;

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (interactive) {
                container.removeEventListener('pointermove', handlePointerMove);
                container.removeEventListener('pointerdown', handlePointerDown);
                window.removeEventListener('pointerup', handlePointerUp);
                container.removeEventListener('click', handleClick);
            }

            // Dispose geometries and materials
            sphereGeo.dispose();
            cyanMat.dispose();
            emeraldMat.dispose();
            rungMat.dispose();
            coreGeo.dispose();
            coreWireMat.dispose();
            innerCoreGeo.dispose();
            innerCoreMat.dispose();
            ring1Geo.dispose();
            ring1Mat.dispose();
            ring2Geo.dispose();
            ring2Mat.dispose();
            sat1Geo.dispose();
            sat1Mat.dispose();
            sat2Geo.dispose();
            sat2Mat.dispose();
            sat3Geo.dispose();
            sat3Mat.dispose();
            particleGeo.dispose();
            particleMat.dispose();

            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [interactive]);

    return (
        <div
            className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 3D Canvas Container */}
            <div
                ref={mountRef}
                className="w-full h-full min-h-[380px] sm:min-h-[460px] cursor-grab active:cursor-grabbing"
                title="Interactive 3D Medical Core — Drag or Move Mouse to Orbit"
            />

            {/* Futuristic UI HUD Overlays — Pearl Glass Styling */}
            {showBadges && (
                <>
                    {/* Top Status Capsule */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-teal-200/90 text-teal-800 text-xs font-bold shadow-md shadow-teal-900/5 animate-float">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        <span>3D Healthcare Network Active</span>
                    </div>

                    {/* Bottom Interactive Telemetry Card */}
                    <div className="absolute bottom-4 right-4 z-20 max-w-[240px] p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-teal-200/90 text-slate-800 shadow-xl shadow-teal-900/10 animate-float-reverse">
                        <div className="flex items-center justify-between text-[11px] text-teal-700 font-extrabold uppercase tracking-wider mb-1">
                            <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-teal-600" /> Capacity Orbit
                            </span>
                            <span className="text-emerald-600 font-mono font-bold">100% LIVE</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">
                            Govt OP Triage synced with Voluntary Doctors via digital contracts.
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Interactive: Move or click to pulse</span>
                        </div>
                    </div>

                    {/* Left Node Badge */}
                    <div className="hidden sm:flex absolute bottom-8 left-4 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-purple-200 text-purple-800 text-xs font-bold shadow-md shadow-purple-900/5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>KMC-Verified Roster</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default Medical3DCanvas;
