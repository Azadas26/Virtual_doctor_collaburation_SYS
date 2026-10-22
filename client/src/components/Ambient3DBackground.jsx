import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Ambient3DBackground = ({ density = 'medium', colorTheme = 'teal' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const container = canvasRef.current;
        if (!container) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        container.appendChild(renderer.domElement);

        // Particle cloud with subtle geometric mesh
        const particleCount = density === 'high' ? 400 : 220;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const primaryCol = colorTheme === 'teal' ? new THREE.Color(0x0d9488) : new THREE.Color(0x4f46e5);
        const accentCol = new THREE.Color(0x0284c7);
        const darkCol = new THREE.Color(0x059669);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

            const t = Math.random();
            const col = t < 0.5 ? primaryCol : t < 0.85 ? accentCol : darkCol;
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.28,
            vertexColors: true,
            transparent: true,
            opacity: 0.45,
            blending: THREE.NormalBlending
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        // Floating subtle 3D Medical Crosses
        const crossGroup = new THREE.Group();
        const crossMat = new THREE.MeshBasicMaterial({
            color: 0x0d9488,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });

        for (let i = 0; i < 6; i++) {
            const crossItem = new THREE.Group();
            const bar1 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 0.4), crossMat);
            const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2, 0.4), crossMat);
            crossItem.add(bar1);
            crossItem.add(bar2);

            crossItem.position.set(
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 15
            );
            crossItem.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            crossGroup.add(crossItem);
        }
        scene.add(crossGroup);

        // Mouse motion
        let mouseX = 0;
        let mouseY = 0;
        const onMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove);

        const onResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        let reqId;
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            points.rotation.y = time * 0.03 + mouseX * 0.1;
            points.rotation.x = Math.sin(time * 0.05) * 0.05 - mouseY * 0.1;

            crossGroup.children.forEach((cross, idx) => {
                cross.rotation.x += 0.005 * (idx % 2 === 0 ? 1 : -1);
                cross.rotation.y += 0.006;
                cross.position.y += Math.sin(time + idx) * 0.01;
            });

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            geo.dispose();
            mat.dispose();
            crossMat.dispose();
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [density, colorTheme]);

    return (
        <div
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        />
    );
};

export default Ambient3DBackground;
