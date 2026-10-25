import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Role3DCanvas — renders a unique 3D animated scene per user role.
 * Props:
 *   role: 'MAIN_ADMIN' | 'HOSPITAL_ADMIN' | 'FIXED_DOCTOR' | 'TEMPORARY_DOCTOR' | 'PATIENT'
 */
const Role3DCanvas = ({ role = 'PATIENT', className = '' }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 480;
        const height = container.clientHeight || 480;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 18);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        const clock = new THREE.Clock();
        let animationFrameId;

        // ─── MAIN ADMIN — Purple Governance Shield Globe ───
        if (role === 'MAIN_ADMIN') {
            const pLight = new THREE.PointLight(0x7c3aed, 5, 35);
            pLight.position.set(6, 8, 8);
            scene.add(pLight);
            const pLight2 = new THREE.PointLight(0xc084fc, 4, 30);
            pLight2.position.set(-8, -6, 5);
            scene.add(pLight2);

            const globeWire = new THREE.Mesh(
                new THREE.SphereGeometry(5, 24, 24),
                new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.18 })
            );
            mainGroup.add(globeWire);

            const innerGlobe = new THREE.Mesh(
                new THREE.SphereGeometry(3.5, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0x4c1d95, emissive: 0x6d28d9, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.85, transparent: true, opacity: 0.75 })
            );
            mainGroup.add(innerGlobe);

            const shardMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.9 });
            [[5.5,0,0],[-5.5,0,0],[0,5.5,0],[0,-5.5,0],[0,0,5.5],[0,0,-5.5],[3.8,3.8,0],[-3.8,-3.8,0],[3.8,-3.8,0]].forEach(([x,y,z]) => {
                const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), shardMat);
                s.position.set(x, y, z);
                mainGroup.add(s);
            });

            for (let i = 0; i < 3; i++) {
                const r = new THREE.Mesh(
                    new THREE.TorusGeometry(4.5 + i * 1.2, 0.04, 16, 120),
                    new THREE.MeshBasicMaterial({ color: [0x7c3aed, 0xa855f7, 0xc084fc][i], transparent: true, opacity: 0.4 })
                );
                r.rotation.x = (i * Math.PI) / 3.5;
                r.rotation.y = (i * Math.PI) / 4;
                mainGroup.add(r);
            }

            const pPos = new Float32Array(300 * 3);
            for (let i = 0; i < 300; i++) {
                const r2 = 7 + Math.random() * 5;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                pPos[i*3] = r2*Math.sin(ph)*Math.cos(th);
                pPos[i*3+1] = r2*Math.sin(ph)*Math.sin(th);
                pPos[i*3+2] = r2*Math.cos(ph);
            }
            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xa855f7, size: 0.14, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
            scene.add(particles);

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                mainGroup.rotation.y = t * 0.18;
                mainGroup.rotation.x = Math.sin(t * 0.3) * 0.12;
                innerGlobe.rotation.y = -t * 0.3;
                particles.rotation.y = t * 0.03;
                renderer.render(scene, camera);
            };
            animate();
        }

        // ─── HOSPITAL ADMIN — Blue Capacity Orbit Ring System ───
        else if (role === 'HOSPITAL_ADMIN') {
            const bLight = new THREE.PointLight(0x0ea5e9, 5, 35);
            bLight.position.set(7, 7, 7);
            scene.add(bLight);
            const bLight2 = new THREE.PointLight(0x38bdf8, 4, 30);
            bLight2.position.set(-7, -5, 6);
            scene.add(bLight2);

            const core = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 2.8, 2.8),
                new THREE.MeshStandardMaterial({ color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.9 })
            );
            mainGroup.add(core);

            const coreWire = new THREE.Mesh(
                new THREE.BoxGeometry(3.1, 3.1, 3.1),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 })
            );
            mainGroup.add(coreWire);

            const rings = [];
            [[5.0, 0.05, 0x0ea5e9, Math.PI/2.2, 0.3],[6.5, 0.04, 0x38bdf8, Math.PI/3.5, -0.5],[8.0, 0.03, 0x7dd3fc, -Math.PI/4, 0.8]].forEach(([r, tube, color, rx, ry]) => {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(r, tube, 16, 120),
                    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
                );
                ring.rotation.x = rx;
                ring.rotation.y = ry;
                mainGroup.add(ring);
                rings.push(ring);
            });

            const orbMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 });
            const orbs = Array.from({ length: 6 }, () => {
                const o = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), orbMat);
                mainGroup.add(o);
                return o;
            });

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                mainGroup.rotation.y = t * 0.22;
                core.rotation.x = t * 0.3;
                core.rotation.z = t * 0.15;
                coreWire.rotation.y = -t * 0.4;
                rings.forEach((ring, i) => { ring.rotation.z = t * (0.1 + i * 0.05); });
                orbs.forEach((orb, i) => {
                    const angle = t * (0.6 + i * 0.15) + (i / orbs.length) * Math.PI * 2;
                    const radius = 5.0 + i * 0.5;
                    orb.position.set(Math.cos(angle) * radius, Math.sin(angle * 0.4) * 1.5, Math.sin(angle) * radius);
                });
                renderer.render(scene, camera);
            };
            animate();
        }

        // ─── FIXED DOCTOR — Teal DNA Helix + Beating Heart Core ───
        else if (role === 'FIXED_DOCTOR') {
            const tLight = new THREE.PointLight(0x0d9488, 5, 35);
            tLight.position.set(7, 6, 6);
            scene.add(tLight);
            const tLight2 = new THREE.PointLight(0x14b8a6, 4, 28);
            tLight2.position.set(-6, -6, 5);
            scene.add(tLight2);

            const helixGroup = new THREE.Group();
            const sGeo = new THREE.SphereGeometry(0.16, 16, 16);
            const matA = new THREE.MeshStandardMaterial({ color: 0x0d9488, emissive: 0x14b8a6, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.85 });
            const matB = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x34d399, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.85 });
            const rungMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.4 });

            for (let i = 0; i < 32; i++) {
                const t = (i / 32) * Math.PI * 4.5;
                const y = (i / 32 - 0.5) * 12;
                const n1 = new THREE.Mesh(sGeo, matA);
                n1.position.set(Math.cos(t) * 2.2, y, Math.sin(t) * 2.2);
                helixGroup.add(n1);
                const n2 = new THREE.Mesh(sGeo, matB);
                n2.position.set(Math.cos(t + Math.PI) * 2.2, y, Math.sin(t + Math.PI) * 2.2);
                helixGroup.add(n2);
                if (i % 2 === 0) {
                    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.4, 8), rungMat);
                    rung.position.set(0, y, 0);
                    rung.rotation.z = Math.PI / 2;
                    rung.rotation.y = -t;
                    helixGroup.add(rung);
                }
            }
            helixGroup.rotation.z = 0.2;
            mainGroup.add(helixGroup);

            const heartCore = new THREE.Mesh(
                new THREE.IcosahedronGeometry(1.5, 1),
                new THREE.MeshStandardMaterial({ color: 0x0d9488, emissive: 0x14b8a6, emissiveIntensity: 1.0, roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.85 })
            );
            mainGroup.add(heartCore);

            const coreWire = new THREE.Mesh(
                new THREE.IcosahedronGeometry(1.6, 1),
                new THREE.MeshBasicMaterial({ color: 0x2dd4bf, wireframe: true, transparent: true, opacity: 0.5 })
            );
            mainGroup.add(coreWire);

            const ecgRing = new THREE.Mesh(
                new THREE.TorusGeometry(4.5, 0.05, 16, 120),
                new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.6 })
            );
            ecgRing.rotation.x = Math.PI / 2;
            mainGroup.add(ecgRing);

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                mainGroup.rotation.y = t * 0.2;
                helixGroup.rotation.y = t * 0.8;
                const beat = 1 + 0.18 * Math.pow(Math.sin(t * 3.0), 3);
                heartCore.scale.setScalar(beat);
                coreWire.rotation.y = t * 0.6;
                coreWire.rotation.x = t * 0.4;
                ecgRing.rotation.z = t * 0.5;
                renderer.render(scene, camera);
            };
            animate();
        }

        // ─── TEMPORARY DOCTOR — Amber Volunteer Star Constellation ───
        else if (role === 'TEMPORARY_DOCTOR') {
            const aLight = new THREE.PointLight(0xf59e0b, 5, 35);
            aLight.position.set(7, 7, 6);
            scene.add(aLight);
            const aLight2 = new THREE.PointLight(0xfbbf24, 4, 28);
            aLight2.position.set(-6, -5, 5);
            scene.add(aLight2);

            const starCore = new THREE.Mesh(
                new THREE.IcosahedronGeometry(2.2, 0),
                new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xf59e0b, emissiveIntensity: 0.85, roughness: 0.05, metalness: 0.95 })
            );
            mainGroup.add(starCore);

            const starWire = new THREE.Mesh(
                new THREE.IcosahedronGeometry(2.5, 0),
                new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.4 })
            );
            mainGroup.add(starWire);

            const tetraMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.9 });
            const tetras = Array.from({ length: 8 }, () => {
                const t = new THREE.Mesh(new THREE.TetrahedronGeometry(0.4, 0), tetraMat);
                mainGroup.add(t);
                return t;
            });

            [[6,0,0],[-6,0,0],[0,6,0],[0,-6,0],[4.2,4.2,0],[-4.2,4.2,0],[4.2,-4.2,0],[-4.2,-4.2,0]].forEach(([x,y,z]) => {
                const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0xfcd34d, emissive: 0xfbbf24, emissiveIntensity: 1 }));
                dot.position.set(x, y, z);
                mainGroup.add(dot);
            });

            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(4.5 + i * 1.5, 0.04, 16, 120),
                    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 - i * 0.08 })
                );
                ring.rotation.x = (i * Math.PI) / 3;
                ring.rotation.z = (i * Math.PI) / 4;
                mainGroup.add(ring);
            }

            const pPos2 = new Float32Array(250 * 3);
            for (let i = 0; i < 250; i++) {
                const r2 = 7 + Math.random() * 5;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                pPos2[i*3] = r2*Math.sin(ph)*Math.cos(th);
                pPos2[i*3+1] = r2*Math.sin(ph)*Math.sin(th);
                pPos2[i*3+2] = r2*Math.cos(ph);
            }
            const pGeo2 = new THREE.BufferGeometry();
            pGeo2.setAttribute('position', new THREE.BufferAttribute(pPos2, 3));
            const particles2 = new THREE.Points(pGeo2, new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.15, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
            scene.add(particles2);

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                mainGroup.rotation.y = t * 0.25;
                mainGroup.rotation.x = Math.sin(t * 0.4) * 0.15;
                starCore.rotation.y = t * 0.6;
                starCore.rotation.x = t * 0.4;
                starWire.rotation.y = -t * 0.5;
                tetras.forEach((tetra, i) => {
                    const angle = t * (0.5 + i * 0.1) + (i / tetras.length) * Math.PI * 2;
                    tetra.position.set(Math.cos(angle) * (5 + i * 0.3), Math.sin(angle * 0.5) * 2, Math.sin(angle) * (5 + i * 0.3));
                    tetra.rotation.x = t * 1.5;
                    tetra.rotation.y = t * 2.0;
                });
                particles2.rotation.y = t * 0.04;
                renderer.render(scene, camera);
            };
            animate();
        }

        // ─── PATIENT — Emerald Heartbeat Pulse ECG Sphere ───
        else {
            const eLight = new THREE.PointLight(0x059669, 5, 35);
            eLight.position.set(7, 6, 7);
            scene.add(eLight);
            const eLight2 = new THREE.PointLight(0x10b981, 4, 30);
            eLight2.position.set(-7, -5, 6);
            scene.add(eLight2);

            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(3.0, 48, 48),
                new THREE.MeshStandardMaterial({ color: 0x047857, emissive: 0x059669, emissiveIntensity: 0.7, roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.8 })
            );
            mainGroup.add(orb);

            const wireOrb = new THREE.Mesh(
                new THREE.SphereGeometry(3.2, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.25 })
            );
            mainGroup.add(wireOrb);

            const pulseRings = Array.from({ length: 4 }, (_, i) => {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(4.5 + i * 1.2, 0.045 - i * 0.008, 16, 120),
                    new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 - i * 0.1 })
                );
                ring.rotation.x = Math.PI / 2;
                ring.rotation.z = (i * Math.PI) / 5;
                mainGroup.add(ring);
                return ring;
            });

            const indMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.2 });
            const indicators = Array.from({ length: 5 }, () => {
                const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), indMat);
                mainGroup.add(m);
                return m;
            });

            const crossMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x34d399, emissiveIntensity: 0.8 });
            const crossGroup = new THREE.Group();
            crossGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.5), crossMat));
            crossGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.5), crossMat));
            mainGroup.add(crossGroup);

            const pPos3 = new Float32Array(300 * 3);
            for (let i = 0; i < 300; i++) {
                const r2 = 6 + Math.random() * 6;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                pPos3[i*3] = r2*Math.sin(ph)*Math.cos(th);
                pPos3[i*3+1] = r2*Math.sin(ph)*Math.sin(th);
                pPos3[i*3+2] = r2*Math.cos(ph);
            }
            const pGeo3 = new THREE.BufferGeometry();
            pGeo3.setAttribute('position', new THREE.BufferAttribute(pPos3, 3));
            const particles3 = new THREE.Points(pGeo3, new THREE.PointsMaterial({ color: 0x34d399, size: 0.13, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }));
            scene.add(particles3);

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                mainGroup.rotation.y = t * 0.2;
                const beat = 1.0 + 0.15 * Math.pow(Math.sin(t * 3.2), 3) + 0.04 * Math.sin(t * 6.4);
                orb.scale.setScalar(beat);
                crossGroup.scale.setScalar(beat * 1.05);
                wireOrb.rotation.y = t * 0.4;
                wireOrb.rotation.z = t * 0.25;
                pulseRings.forEach((ring, i) => {
                    ring.rotation.y = t * (0.3 + i * 0.1);
                    ring.scale.setScalar(1 + 0.05 * Math.sin(t * 2 + i));
                });
                indicators.forEach((ind, i) => {
                    const angle = t * (0.7 + i * 0.12) + (i / indicators.length) * Math.PI * 2;
                    ind.position.set(Math.cos(angle) * 5.5, Math.sin(angle * 0.5) * 2.5, Math.sin(angle) * 5.5);
                });
                crossGroup.rotation.y = t * 0.5;
                crossGroup.rotation.x = t * 0.3;
                particles3.rotation.y = t * 0.025;
                renderer.render(scene, camera);
            };
            animate();
        }

        // Shared mouse parallax
        const handleMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 1.5;
            mainGroup.rotation.y += (x * 0.8 - mainGroup.rotation.y) * 0.04;
            mainGroup.rotation.x += (-y * 0.6 - mainGroup.rotation.x) * 0.04;
        };
        container.addEventListener('mousemove', handleMove);

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousemove', handleMove);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [role]);

    return (
        <div
            ref={mountRef}
            className={`w-full h-full min-h-[380px] cursor-crosshair ${className}`}
            title="Move mouse to orbit the 3D scene"
        />
    );
};

export default Role3DCanvas;
