import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * FloatingButterfliesBackground
 * Subtle, lightweight Three.js 3D background with stylized fluttering butterflies
 * and gently floating organic food items (spinach leaves, mini tomatoes, garlic cloves, herb pods)
 * in the same nature-inspired brand palette.
 * Colors: Forest (#183D2B), Primary green (#367653), Soft sage (#CDE2D0), Pale mint (#EAF3E9), Warm apricot (#F0B779).
 */
export default function FloatingButterfliesBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for butterfly background, using CSS fallback');
      return;
    }

    // Soft Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xF7F8F3, 0.65);
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    const themeColors = {
      forest: 0x183D2B,
      primaryGreen: 0x367653,
      sage: 0xCDE2D0,
      mint: 0xEAF3E9,
      apricot: 0xF0B779,
      softOlive: 0x4a7c59
    };

    // --- 1. BUTTERFLY BUILDER ---
    function createButterfly(colorHex) {
      const group = new THREE.Group();

      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.quadraticCurveTo(0.8, 1.2, 1.6, 1.4);
      wingShape.quadraticCurveTo(1.8, 0.6, 1.2, 0.0);
      wingShape.quadraticCurveTo(1.4, -0.6, 0.9, -1.0);
      wingShape.quadraticCurveTo(0.3, -0.6, 0, 0);

      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wingMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        roughness: 0.35,
        metalness: 0.1
      });

      // Right Wing
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.scale.set(0.6, 0.6, 0.6);
      group.add(rightWing);

      // Left Wing (Mirrored)
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.scale.set(-0.6, 0.6, 0.6);
      group.add(leftWing);

      // Central Body
      const bodyGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.7, 8);
      const bodyMat = new THREE.MeshBasicMaterial({ color: themeColors.forest, transparent: true, opacity: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI / 2;
      group.add(body);

      return { group, leftWing, rightWing, isButterfly: true };
    }

    // --- 2. FOOD ITEM BUILDERS (Leaves, Tomatoes, Garlic, Pods) ---

    // A. Organic Leaf / Spinach
    function createLeaf(colorHex = themeColors.primaryGreen) {
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, -0.8);
      leafShape.quadraticCurveTo(0.6, -0.2, 0.5, 0.4);
      leafShape.quadraticCurveTo(0.3, 0.9, 0, 1.2); // Leaf tip
      leafShape.quadraticCurveTo(-0.3, 0.9, -0.5, 0.4);
      leafShape.quadraticCurveTo(-0.6, -0.2, 0, -0.8);

      const leafGeo = new THREE.ShapeGeometry(leafShape);
      const leafMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        roughness: 0.4
      });

      const mesh = new THREE.Mesh(leafGeo, leafMat);
      mesh.scale.set(0.6, 0.6, 0.6);

      const group = new THREE.Group();
      group.add(mesh);
      return { group, isLeaf: true };
    }

    // B. Stylized Tomato / Citrus Fruit
    function createTomato() {
      const group = new THREE.Group();
      const bodyGeo = new THREE.SphereGeometry(0.45, 12, 12);
      bodyGeo.scale(1, 0.85, 1); // Slightly squished sphere
      const bodyMat = new THREE.MeshStandardMaterial({
        color: themeColors.apricot,
        roughness: 0.35,
        transparent: true,
        opacity: 0.7
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Little green calyx star on top
      const calyxGeo = new THREE.ConeGeometry(0.18, 0.08, 5);
      const calyxMat = new THREE.MeshStandardMaterial({ color: themeColors.forest, roughness: 0.5 });
      const calyx = new THREE.Mesh(calyxGeo, calyxMat);
      calyx.position.y = 0.4;
      group.add(calyx);

      return { group, isFood: true };
    }

    // C. Stylized Garlic Clove / Seed
    function createClove() {
      const group = new THREE.Group();
      const cloveGeo = new THREE.ConeGeometry(0.25, 0.7, 8);
      cloveGeo.scale(1, 1, 0.7);
      const cloveMat = new THREE.MeshStandardMaterial({
        color: themeColors.sage,
        roughness: 0.45,
        transparent: true,
        opacity: 0.68
      });
      const clove = new THREE.Mesh(cloveGeo, cloveMat);
      clove.rotation.x = Math.PI;
      group.add(clove);

      return { group, isFood: true };
    }

    // D. Herb Pea Pod
    function createPod() {
      const group = new THREE.Group();
      const podCurve = new THREE.CylinderGeometry(0.12, 0.08, 1.1, 8);
      podCurve.scale(1, 1, 0.6);
      const podMat = new THREE.MeshStandardMaterial({
        color: themeColors.softOlive,
        roughness: 0.4,
        transparent: true,
        opacity: 0.65
      });
      const pod = new THREE.Mesh(podCurve, podMat);
      pod.rotation.z = Math.PI / 4;
      group.add(pod);

      return { group, isFood: true };
    }

    const isMobile = width < 768;
    const butterflyCount = isMobile ? 5 : 9;
    const foodItemCount = isMobile ? 4 : 7;

    const allObjects = [];

    // Spawn Butterflies
    const bfColors = [themeColors.primaryGreen, themeColors.sage, themeColors.mint, themeColors.apricot, themeColors.softOlive];
    for (let i = 0; i < butterflyCount; i++) {
      const color = bfColors[i % bfColors.length];
      const bf = createButterfly(color);

      bf.group.position.x = (Math.random() - 0.5) * 24;
      bf.group.position.y = (Math.random() - 0.5) * 16;
      bf.group.position.z = -1 + (Math.random() - 0.5) * 6;

      bf.vx = (Math.random() - 0.5) * 0.012 + (i % 2 === 0 ? 0.007 : -0.007);
      bf.vy = (Math.random() - 0.5) * 0.008;
      bf.flapSpeed = 0.07 + Math.random() * 0.05;
      bf.flapOffset = Math.random() * Math.PI * 2;
      bf.rotSpeed = 0.003 + Math.random() * 0.005;

      const scale = 0.48 + Math.random() * 0.35;
      bf.group.scale.set(scale, scale, scale);

      scene.add(bf.group);
      allObjects.push(bf);
    }

    // Spawn Floating Food Items
    const foodConstructors = [createLeaf, createTomato, createClove, createPod];
    for (let j = 0; j < foodItemCount; j++) {
      const builder = foodConstructors[j % foodConstructors.length];
      const food = builder();

      food.group.position.x = (Math.random() - 0.5) * 22;
      food.group.position.y = (Math.random() - 0.5) * 15;
      food.group.position.z = -2 + (Math.random() - 0.5) * 5;

      // Gentle tumbling & drifting
      food.vx = (Math.random() - 0.5) * 0.006;
      food.vy = -0.003 - Math.random() * 0.004; // slow gentle downward float like floating leaves
      food.rotX = (Math.random() - 0.5) * 0.008;
      food.rotY = (Math.random() - 0.5) * 0.009;
      food.rotZ = (Math.random() - 0.5) * 0.007;

      const scale = 0.5 + Math.random() * 0.3;
      food.group.scale.set(scale, scale, scale);

      scene.add(food.group);
      allObjects.push(food);
    }

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsedTime = clock.getElapsedTime();

        allObjects.forEach((obj, idx) => {
          if (obj.isButterfly) {
            // Flap wings
            const flap = Math.sin(elapsedTime * (obj.flapSpeed * 60) + obj.flapOffset) * 0.72;
            obj.leftWing.rotation.y = flap;
            obj.rightWing.rotation.y = -flap;

            // Drift
            obj.group.position.x += obj.vx;
            obj.group.position.y += Math.sin(elapsedTime * 0.6 + idx) * 0.008;

            // Turn smoothly into direction
            obj.group.rotation.y = Math.sin(elapsedTime * 0.35 + idx) * 0.25 + (obj.vx > 0 ? 0.3 : -0.3);
            obj.group.rotation.z = Math.sin(elapsedTime * 0.4 + idx) * 0.12;

            // Screen boundary wrapping
            if (obj.group.position.x > 15) obj.group.position.x = -15;
            if (obj.group.position.x < -15) obj.group.position.x = 15;
            if (obj.group.position.y > 10) obj.group.position.y = -10;
            if (obj.group.position.y < -10) obj.group.position.y = 10;
          } else {
            // Floating Food Items
            obj.group.position.x += obj.vx + Math.sin(elapsedTime * 0.4 + idx) * 0.004;
            obj.group.position.y += obj.vy;

            obj.group.rotation.x += obj.rotX;
            obj.group.rotation.y += obj.rotY;
            obj.group.rotation.z += obj.rotZ;

            // Wrap around bottom to top smoothly
            if (obj.group.position.y < -11) {
              obj.group.position.y = 11;
              obj.group.position.x = (Math.random() - 0.5) * 22;
            }
            if (obj.group.position.x > 14) obj.group.position.x = -14;
            if (obj.group.position.x < -14) obj.group.position.x = 14;
          }
        });
      }

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-70 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
