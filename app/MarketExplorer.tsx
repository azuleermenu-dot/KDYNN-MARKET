"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ArrowUpRight, RotateCcw, Search, Store } from "lucide-react";

type StallStatus = "Available" | "Occupied" | "Reserved";

type Stall = {
  id: string;
  category: string;
  status: StallStatus;
  row: number;
  position: number;
  detail: string;
};

const categoryCounts = [
  { name: "Fresh Produce", count: 12, detail: "Vegetables, fruits and herbs" },
  { name: "Meat & Poultry", count: 8, detail: "Meat and poultry vendors" },
  { name: "Seafood", count: 7, detail: "Fresh and dried seafood" },
  { name: "Rice & Groceries", count: 12, detail: "Rice and pantry essentials" },
  { name: "General Merchandise", count: 10, detail: "Daily goods and household items" },
  { name: "Food & Services", count: 6, detail: "Ready-to-eat food and local services" },
  { name: "Other Services", count: 5, detail: "Other market-related spaces" },
];

const availablePositions = new Set([2, 9, 15, 21, 28, 34, 45, 52]);
const reservedPositions = new Set([5, 19, 37, 55]);

const stalls: Stall[] = categoryCounts.flatMap((category) =>
  Array.from({ length: category.count }, (_, localIndex) => {
    const index = categoryCounts
      .slice(0, categoryCounts.findIndex((item) => item.name === category.name))
      .reduce((sum, item) => sum + item.count, 0) + localIndex;
    const status: StallStatus = availablePositions.has(index)
      ? "Available"
      : reservedPositions.has(index)
        ? "Reserved"
        : "Occupied";

    return {
      id: `P-${String(index + 1).padStart(3, "0")}`,
      category: category.name,
      status,
      row: Math.floor(index / 10) + 1,
      position: (index % 10) + 1,
      detail: category.detail,
    };
  })
);

const statusMeta: Record<StallStatus, { color: string; description: string }> = {
  Available: { color: "#39845b", description: "Shown as available in this sample layout" },
  Occupied: { color: "#b87955", description: "Shown as occupied in this sample layout" },
  Reserved: { color: "#d4a348", description: "Shown as reserved in this sample layout" },
};

type MarketSceneProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

function MarketScene({ selectedId, onSelect }: MarketSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const [sceneError, setSceneError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls | undefined;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | undefined;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setSceneError(true);
      return;
    }

    setSceneError(false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9e5db");
    scene.fog = new THREE.Fog("#e9e5db", 28, 52);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(18, 17, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "market-three-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional concept model of the market. Select a stall to view its sample availability.");
    host.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight("#ffffff", "#b7ad9d", 2.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight("#fff4dc", 2.3);
    sun.position.set(-10, 20, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    scene.add(sun);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: "#d6d0c3", roughness: 0.96 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(25.5, 0.36, 19), floorMaterial);
    base.position.y = -0.24;
    base.receiveShadow = true;
    scene.add(base);

    const aisleMaterial = new THREE.MeshStandardMaterial({ color: "#eee7d9", roughness: 1 });
    const aisle = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.025, 17.2), aisleMaterial);
    aisle.position.set(0, -0.045, 0);
    aisle.receiveShadow = true;
    scene.add(aisle);

    const crossAisle = new THREE.Mesh(new THREE.BoxGeometry(23.8, 0.026, 0.72), aisleMaterial);
    crossAisle.position.set(0, -0.044, 0);
    scene.add(crossAisle);

    const grid = new THREE.GridHelper(24, 24, "#b9b09f", "#d0c8b9");
    grid.position.y = -0.052;
    scene.add(grid);

    const woodMaterial = new THREE.MeshStandardMaterial({ color: "#9a7451", roughness: 0.82 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#e7dece", roughness: 0.9 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: "#554b3f", roughness: 0.75 });
    const availableMaterial = new THREE.MeshStandardMaterial({ color: statusMeta.Available.color, roughness: 0.72 });
    const occupiedMaterial = new THREE.MeshStandardMaterial({ color: statusMeta.Occupied.color, roughness: 0.72 });
    const reservedMaterial = new THREE.MeshStandardMaterial({ color: statusMeta.Reserved.color, roughness: 0.72 });
    const statusMaterials: Record<StallStatus, THREE.Material> = {
      Available: availableMaterial,
      Occupied: occupiedMaterial,
      Reserved: reservedMaterial,
    };

    const platformGeometry = new THREE.BoxGeometry(1.88, 0.14, 1.96);
    const backWallGeometry = new THREE.BoxGeometry(1.88, 1.5, 0.12);
    const counterGeometry = new THREE.BoxGeometry(1.52, 0.62, 0.42);
    const canopyGeometry = new THREE.BoxGeometry(1.98, 0.13, 2.02);
    const signGeometry = new THREE.BoxGeometry(0.8, 0.23, 0.055);
    const selectableMeshes: THREE.Object3D[] = [];
    const groupMap = new Map<string, THREE.Group>();

    stalls.forEach((stall, index) => {
      const column = index % 10;
      const row = Math.floor(index / 10);
      const x = column < 5 ? -10.4 + column * 2.1 : 2 + (column - 5) * 2.1;
      const z = -6 + row * 2.4;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.userData.stallId = stall.id;

      const platform = new THREE.Mesh(platformGeometry, wallMaterial);
      platform.position.y = 0.04;
      platform.receiveShadow = true;

      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.set(0, 0.88, -0.91);

      const counter = new THREE.Mesh(counterGeometry, woodMaterial);
      counter.position.set(0, 0.43, 0.57);
      counter.castShadow = true;

      const canopy = new THREE.Mesh(canopyGeometry, statusMaterials[stall.status]);
      canopy.position.set(0, 1.68, 0);
      canopy.castShadow = true;

      const frontSign = new THREE.Mesh(signGeometry, trimMaterial);
      frontSign.position.set(0, 1.22, 0.94);

      [platform, backWall, counter, canopy, frontSign].forEach((mesh) => {
        mesh.userData.stallId = stall.id;
        group.add(mesh);
        selectableMeshes.push(mesh);
      });

      scene.add(group);
      groupMap.set(stall.id, group);
    });
    groupsRef.current = groupMap;

    // Open-air frame: a simple visual reference, not a measured building shell.
    const pillarGeometry = new THREE.BoxGeometry(0.22, 3.05, 0.22);
    const beamGeometry = new THREE.BoxGeometry(23.4, 0.24, 0.22);
    const framePoints = [
      [-11.55, 8.25], [11.55, 8.25], [-11.55, -8.25], [11.55, -8.25],
    ];
    framePoints.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeometry, trimMaterial);
      pillar.position.set(x, 1.5, z);
      pillar.castShadow = true;
      scene.add(pillar);
    });
    const frontBeam = new THREE.Mesh(beamGeometry, trimMaterial);
    frontBeam.position.set(0, 3.05, 8.25);
    scene.add(frontBeam);
    const rearBeam = new THREE.Mesh(beamGeometry, trimMaterial);
    rearBeam.position.set(0, 3.05, -8.25);
    scene.add(rearBeam);

    const signCanvas = document.createElement("canvas");
    signCanvas.width = 512;
    signCanvas.height = 128;
    const context = signCanvas.getContext("2d");
    if (context) {
      context.fillStyle = "#283b30";
      context.fillRect(0, 0, 512, 128);
      context.fillStyle = "#f8f1df";
      context.font = "bold 38px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("KDYNN MARKET", 256, 64);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({ map: signTexture, side: THREE.DoubleSide })
    );
    sign.position.set(0, 2.45, 8.12);
    scene.add(sign);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.minDistance = 14;
    controls.maxDistance = 34;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI / 2.06;
    controls.target.set(0, 0.25, 0);
    controls.update();
    controlsRef.current = controls;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectableMeshes, false)[0];
      const id = hit?.object.userData.stallId;
      if (typeof id === "string") onSelect(id);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const animate = () => {
      controls?.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      controls?.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
      groupsRef.current.clear();

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((material) => materials.add(material));
          else materials.add(mesh.material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      signTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onSelect]);

  useEffect(() => {
    groupsRef.current.forEach((group) => group.scale.setScalar(1));
    const selectedGroup = groupsRef.current.get(selectedId);
    if (selectedGroup) selectedGroup.scale.setScalar(1.055);
  }, [selectedId]);

  function resetView() {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(18, 17, 22);
    controlsRef.current.target.set(0, 0.25, 0);
    controlsRef.current.update();
  }

  return (
    <div className="market-scene-shell">
      <div ref={hostRef} className="market-three-host" />
      {sceneError && (
        <div className="market-scene-fallback">
          <Store size={24} />
          <strong>3D view is unavailable on this device.</strong>
          <span>Use the stall finder below to browse the sample inventory.</span>
        </div>
      )}
      <div className="market-scene-hint">Drag to rotate · Pinch or scroll to zoom · Tap a stall to inspect</div>
      <button className="market-reset-view" type="button" onClick={resetView} aria-label="Reset 3D market view" disabled={sceneError} title={sceneError ? "3D view is unavailable on this device" : "Reset the 3D camera"}>
        <RotateCcw size={15} /> Reset view
      </button>
    </div>
  );
}

export default function MarketExplorer() {
  const [selectedId, setSelectedId] = useState("P-003");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState<"All" | StallStatus>("All");

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const selectedStall = stalls.find((stall) => stall.id === selectedId) ?? stalls[0];

  const filteredStalls = useMemo(() => stalls.filter((stall) => {
    const matchesQuery = `${stall.id} ${stall.category} ${stall.detail}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesCategory = category === "All categories" || stall.category === category;
    const matchesStatus = statusFilter === "All" || stall.status === statusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  }), [query, category, statusFilter]);

  useEffect(() => {
    const selectionIsVisible = filteredStalls.some((stall) => stall.id === selectedId);
    if (!selectionIsVisible && filteredStalls.length > 0) {
      setSelectedId(filteredStalls[0].id);
    }
  }, [filteredStalls, selectedId]);

  const availableCount = stalls.filter((stall) => stall.status === "Available").length;
  const occupiedCount = stalls.filter((stall) => stall.status === "Occupied").length;
  const reservedCount = stalls.filter((stall) => stall.status === "Reserved").length;

  const inquirySubject = encodeURIComponent(`KDYNN Market inquiry — ${selectedStall.id}`);
  const inquiryBody = encodeURIComponent([
    "Hello KDYNN Market team,",
    "",
    `I would like to ask about ${selectedStall.id}.`,
    `Category: ${selectedStall.category}`,
    `Sample status shown: ${selectedStall.status}`,
    "",
    "Please confirm the actual stall details and current availability.",
  ].join("\n"));
  const inquiryHref = `mailto:azuleermenu@gmail.com?subject=${inquirySubject}&body=${inquiryBody}`;

  return (
    <section className="market-explorer" id="pwesto">
      <div className="section-kicker">02 / EXPLORE THE MARKET</div>
      <div className="market-explorer-heading">
        <div>
          <h2>Find your <em>pwesto.</em></h2>
          <p>Explore a 3D market concept, browse stall categories and check the sample availability before you visit.</p>
        </div>
        <div className="market-total"><strong>60</strong><span>provisional spaces</span></div>
      </div>

      <div className="market-data-note">
        <strong>Concept model · Not a surveyed floor plan</strong>
        <span>The 60 stall positions and their availability are illustrative placeholders. Actual stall locations and vacancies must be confirmed by market management.</span>
      </div>

      <div className="market-explorer-layout">
        <div className="market-view-column">
          <div className="market-view-heading">
            <div><span className="market-view-kicker">INTERACTIVE MARKET MAP</span><strong>Explore in 3D</strong></div>
            <span className="market-view-badge">Demo layout</span>
          </div>
          <MarketScene selectedId={selectedId} onSelect={handleSelect} />
          <div className="market-legend" aria-label="Sample stall status legend">
            <span><i className="available" /> Available <b>{availableCount}</b></span>
            <span><i className="occupied" /> Occupied <b>{occupiedCount}</b></span>
            <span><i className="reserved" /> Reserved <b>{reservedCount}</b></span>
          </div>
        </div>

        <aside className="market-finder">
          <div className="market-finder-title">
            <div><span className="market-view-kicker">STALL FINDER</span><h3>What are you looking for?</h3></div>
            <Store size={20} />
          </div>

          <label className="market-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stall ID or category" aria-label="Search stalls" />
          </label>

          <label className="market-filter-label">Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All categories</option>
              {categoryCounts.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>

          <div className="market-status-filters" aria-label="Filter by stall status">
            {(["All", "Available", "Occupied", "Reserved"] as const).map((status) => (
              <button key={status} type="button" className={statusFilter === status ? "active" : ""} onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status}>
                {status}
              </button>
            ))}
          </div>

          <div className="market-stall-list-head"><span>STALL POSITIONS</span><b>{filteredStalls.length} results</b></div>
          <div className="market-stall-list">
            {filteredStalls.map((stall) => (
              <button key={stall.id} type="button" className={selectedId === stall.id ? "market-stall-chip selected" : "market-stall-chip"} onClick={() => handleSelect(stall.id)} aria-pressed={selectedId === stall.id}>
                <i className={stall.status.toLowerCase()} />
                <span>{stall.id}</span>
              </button>
            ))}
            {filteredStalls.length === 0 && <p className="market-no-results">No stalls match those filters. Try another category or status.</p>}
          </div>
        </aside>
      </div>

      <div className="market-selected-detail" aria-live="polite">
        <div className="market-selected-icon"><Store size={21} /></div>
        <div className="market-selected-copy">
          <div className="market-selected-topline"><span>{selectedStall.id}</span><b className={`status-${selectedStall.status.toLowerCase()}`}>{selectedStall.status}</b></div>
          <h3>{selectedStall.category}</h3>
          <p>{selectedStall.detail} · Concept row {selectedStall.row}, position {selectedStall.position}</p>
        </div>
        <a className="market-inquiry-button" href={inquiryHref}>
          {selectedStall.status === "Available" ? "Inquire about this pwesto" : selectedStall.status === "Reserved" ? "Check this pwesto" : "Ask about this section"}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <p className="market-live-note">Availability is sample data, not live rental inventory. Please ask the market office to confirm before making a trip or payment.</p>
    </section>
  );
}
