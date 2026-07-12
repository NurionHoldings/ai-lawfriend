"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Material, Mesh, Object3D } from "three";

type CharacterModelVariant = "standard" | "handbow" | "victory";

type Props = {
  variant: CharacterModelVariant;
  className?: string;
  label?: string;
  compact?: boolean;
};

const MODEL_CONFIG = {
  standard: {
    src: "/assets/character/AILAWFRIEND_character_15.fbx",
    label: "AI법친 대표 3D 캐릭터",
    accent: "#8fb89e",
    targetHeight: 2.15,
    cameraZ: 5.2,
    rotationY: -0.18,
  },
  handbow: {
    src: "/assets/character/AILAWFRIEND_character_handbow.fbx",
    label: "AI법친 인사 3D 캐릭터",
    accent: "#34d399",
    targetHeight: 2.0,
    cameraZ: 5.4,
    rotationY: 0.14,
  },
  victory: {
    src: "/assets/character/AILAWFRIEND_vict.fbx",
    label: "AI법친 완료 3D 캐릭터",
    accent: "#c9a227",
    targetHeight: 2.05,
    cameraZ: 5.3,
    rotationY: -0.1,
  },
} satisfies Record<CharacterModelVariant, {
  src: string;
  label: string;
  accent: string;
  targetHeight: number;
  cameraZ: number;
  rotationY: number;
}>;

export function AibeopchinCharacterModel({
  variant,
  className = "",
  label,
  compact = false,
}: Readonly<Props>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const statusId = useId();
  const config = MODEL_CONFIG[variant];

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let cleanupScene: (() => void) | null = null;

    async function mountModel() {
      const canvas = canvasRef.current;
      const host = hostRef.current;
      if (!canvas || !host) return;

      try {
        const [THREE, loaderModule] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/FBXLoader.js"),
        ]);
        if (cancelled) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 1.2, config.cameraZ);
        camera.lookAt(0, 1.05, 0);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        scene.add(new THREE.AmbientLight(0xffffff, 1.65));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
        keyLight.position.set(3, 4, 5);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(config.accent, 1.45, 9);
        rimLight.position.set(-2.6, 2.5, 3);
        scene.add(rimLight);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.18, 0.018, 16, 96),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(config.accent),
            transparent: true,
            opacity: 0.36,
          }),
        );
        ring.position.set(0, 0.62, -0.1);
        ring.rotation.x = Math.PI / 2.8;
        scene.add(ring);

        const loader = new loaderModule.FBXLoader();
        const model = await loader.loadAsync(config.src);
        if (cancelled) return;

        model.rotation.y = config.rotationY;
        model.traverse((child: Object3D) => {
          const mesh = child as Mesh;
          if (!mesh.isMesh) return;
          mesh.frustumCulled = false;
          const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material: Material) => {
            if (!material) return;
            material.side = THREE.FrontSide;
            material.needsUpdate = true;
          });
        });

        const initialBox = new THREE.Box3().setFromObject(model);
        const initialSize = initialBox.getSize(new THREE.Vector3());
        const scale = initialSize.y > 0 ? config.targetHeight / initialSize.y : 1;
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= scaledBox.min.y;
        scene.add(model);

        const mixer = model.animations.length > 0 ? new THREE.AnimationMixer(model) : null;
        if (mixer) {
          mixer.clipAction(model.animations[0]).play();
        }

        const clock = new THREE.Clock();
        const resize = () => {
          const rect = host.getBoundingClientRect();
          const width = Math.max(Math.floor(rect.width), 1);
          const height = Math.max(Math.floor(rect.height), 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();
        setStatus("ready");

        const animate = () => {
          if (cancelled) return;
          const delta = clock.getDelta();
          const elapsed = clock.elapsedTime;
          mixer?.update(delta);
          model.rotation.y = config.rotationY + Math.sin(elapsed * 0.75) * 0.045;
          model.position.y += Math.sin(elapsed * 1.1) * 0.0009;
          ring.rotation.z += delta * 0.18;
          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        };
        animate();

        cleanupScene = () => {
          resizeObserver?.disconnect();
          window.cancelAnimationFrame(frameId);
          renderer.dispose();
          scene.traverse((object: Object3D) => {
            const mesh = object as Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry?.dispose();
            const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((material: Material) => material.dispose());
          });
        };
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    setStatus("loading");
    mountModel();

    return () => {
      cancelled = true;
      cleanupScene?.();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [config, variant]);

  return (
    <div
      ref={hostRef}
      className={`relative overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_50%_22%,rgba(220,252,231,0.24),transparent_34%),linear-gradient(145deg,rgba(15,76,56,0.72),rgba(8,25,20,0.92))] shadow-2xl shadow-aibeop-deep/20 ${compact ? "h-48 sm:h-56" : "h-64 sm:h-72 md:h-80"} ${className}`}
      role="img"
      aria-label={label ?? config.label}
      aria-describedby={statusId}
    >
      <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-white/10" />
      <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-aibeop-pale/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-12 bottom-4 h-32 w-32 rounded-full bg-aibeop-accent/25 blur-2xl" />
      <canvas ref={canvasRef} className="relative z-10 h-full w-full" />
      <p
        id={statusId}
        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/70 backdrop-blur"
      >
        {status === "loading" ? "3D 캐릭터 불러오는 중" : status === "ready" ? config.label : "3D 캐릭터 대체 표시"}
      </p>
      {status === "error" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-6xl" aria-hidden>
          ⚖
        </div>
      ) : null}
    </div>
  );
}
