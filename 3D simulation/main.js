import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';
import GUI from 'lil-gui';

class TrafficSim {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.loaderEl = document.getElementById('loader');
        
        // Settings
        this.settings = {
            spawnRate: 2, // cars per 5 seconds
            carSpeed: 10,
            lightDuration: 5000,
            showPhysics: false,
            cameraMode: 'Follow',
            resetSimulation: () => this.reset()
        };

        this.initThree();
        this.initPhysics();
        this.initLights();
        this.initGUI();
        
        this.vehicles = [];
        this.trafficPhase = 'NS_GREEN'; // NS_GREEN, NS_YELLOW, EW_GREEN, EW_YELLOW
        this.lastPhaseChange = Date.now();
        
        this.stats = {
            active: 0,
            passed: 0,
            startTime: Date.now()
        };

        this.assetLoader = new GLTFLoader();
        this.models = {};
        this.loadAssets().then(() => {
            this.initEnvironment();
            this.loaderEl.classList.add('fade-out');
            this.animate();
            this.startSpawner();
        });

        window.addEventListener('resize', () => this.onResize());
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(20, 25, 20);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2.1;
    }

    initPhysics() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.defaultContactMaterial.friction = 0.1;

        // Ground Physics
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: new CANNON.Material('ground')
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        sun.shadow.mapSize.set(2048, 2048);
        this.scene.add(sun);
    }

    async loadAssets() {
        const assets = {
            building: 'https://raw.githubusercontent.com/pmndrs/market-assets/main/buildings/skyscraper.glb'
        };

        const load = (url) => new Promise((resolve, reject) => {
            this.assetLoader.load(url, resolve, undefined, (error) => {
                console.warn(`Failed to load ${url}`, error);
                resolve(null);
            });
        });

        this.models.building = await load(assets.building);
    }

    initEnvironment() {
        // Road Mesh
        const roadGroup = new THREE.Group();
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        // Horizontal roads
        for (let z of [-20, 20]) {
            const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(100, 10), roadMat);
            hRoad.rotation.x = -Math.PI / 2;
            hRoad.position.z = z;
            hRoad.receiveShadow = true;
            roadGroup.add(hRoad);
        }
        
        // Vertical roads
        for (let x of [-20, 20]) {
            const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 100), roadMat);
            vRoad.rotation.x = -Math.PI / 2;
            vRoad.position.x = x;
            vRoad.receiveShadow = true;
            roadGroup.add(vRoad);
        }
        
        // Markings
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lineGeo = new THREE.PlaneGeometry(0.5, 2);
        
        for (let rz of [-20, 20]) {
            for(let i = -45; i < 45; i += 5) {
                if(Math.abs(i - (-20)) < 8 || Math.abs(i - 20) < 8) continue;
                const l1 = new THREE.Mesh(lineGeo, lineMat);
                l1.position.set(i, 0.01, rz);
                l1.rotation.x = -Math.PI/2; l1.rotation.z = Math.PI/2;
                roadGroup.add(l1);
            }
        }
        
        for (let rx of [-20, 20]) {
            for(let i = -45; i < 45; i += 5) {
                if(Math.abs(i - (-20)) < 8 || Math.abs(i - 20) < 8) continue;
                const l2 = new THREE.Mesh(lineGeo, lineMat);
                l2.position.set(rx, 0.01, i);
                l2.rotation.x = -Math.PI/2;
                roadGroup.add(l2);
            }
        }
        this.scene.add(roadGroup);

        // Some Buildings
        for(let x of [-40, 0, 40]) {
            for(let z of [-40, 0, 40]) {
                if (Math.abs(x) === 20 || Math.abs(z) === 20) continue;
                const b = this.models.building ? this.models.building.scene.clone() : new THREE.Mesh(new THREE.BoxGeometry(8, 10 + Math.random() * 30, 8), new THREE.MeshStandardMaterial({color: 0x333333}));
                b.position.set(x + (Math.random()*4-2), 0, z + (Math.random()*4-2));
                if(this.models.building) {
                    b.scale.set(4, 4+Math.random()*5, 4);
                    b.position.y = 0;
                }
                this.scene.add(b);
            }
        }

        this.initTrafficLights();
    }

    initTrafficLights() {
        this.trafficLights = [];
        this.junctions = [
            {x: -20, z: -20},
            {x: 20, z: -20},
            {x: -20, z: 20},
            {x: 20, z: 20}
        ];
        
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const boxGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const bulbGeo = new THREE.SphereGeometry(0.3, 16, 16);

        const createSignal = (px, pz, rot) => {
            const group = new THREE.Group();
            group.position.set(px, 0, pz);
            group.rotation.y = rot;

            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = 2.5;
            group.add(pole);

            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.y = 4.5;
            box.position.z = 0.5;
            group.add(box);

            const redLight = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0x330000 }));
            redLight.position.set(0, 4.9, 0.9);
            group.add(redLight);

            const greenLight = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0x003300 }));
            greenLight.position.set(0, 4.1, 0.9);
            group.add(greenLight);

            this.scene.add(group);

            return { redLight, greenLight };
        };

        const offset = 6.5; // distance from center of junction
        this.junctions.forEach(j => {
            j.signals = {
                N: createSignal(j.x + offset, j.z - offset, Math.PI),
                E: createSignal(j.x + offset, j.z + offset, Math.PI/2),
                S: createSignal(j.x - offset, j.z + offset, 0),
                W: createSignal(j.x - offset, j.z - offset, -Math.PI/2)
            };
        });
    }

    initGUI() {
        const gui = new GUI();
        gui.add(this.settings, 'spawnRate', 0, 10).name('Spawn Intensity');
        gui.add(this.settings, 'carSpeed', 5, 30).name('Target Speed');
        gui.add(this.settings, 'lightDuration', 2000, 10000).name('Signal Period (ms)');
        gui.add(this.settings, 'showPhysics').name('Show Colliders');
        gui.add(this.settings, 'resetSimulation').name('Reset Scene');
    }

    startSpawner() {
        const spawn = () => {
            if(this.vehicles.length < 20) {
                this.createVehicle();
            }
            setTimeout(spawn, 5000 / Math.max(0.1, this.settings.spawnRate));
        };
        spawn();
    }

    createVehicle() {
        const directions = [
            // z = -20 horizontal
            { start: [50, 0, -22], dir: [-1, 0, 0], rot: Math.PI/2, axis: 'X' },
            { start: [-50, 0, -18], dir: [1, 0, 0], rot: -Math.PI/2, axis: 'X' },
            // z = 20 horizontal
            { start: [50, 0, 18], dir: [-1, 0, 0], rot: Math.PI/2, axis: 'X' },
            { start: [-50, 0, 22], dir: [1, 0, 0], rot: -Math.PI/2, axis: 'X' },
            // x = -20 vertical
            { start: [-18, 0, 50], dir: [0, 0, -1], rot: 0, axis: 'Z' },
            { start: [-22, 0, -50], dir: [0, 0, 1], rot: Math.PI, axis: 'Z' },
            // x = 20 vertical
            { start: [22, 0, 50], dir: [0, 0, -1], rot: 0, axis: 'Z' },
            { start: [18, 0, -50], dir: [0, 0, 1], rot: Math.PI, axis: 'Z' }
        ];

        const config = directions[Math.floor(Math.random() * directions.length)];
        const vehicle = new Vehicle(this, config);
        this.vehicles.push(vehicle);
        this.stats.active++;
    }

    updateTrafficLogic() {
        const now = Date.now();
        const elapsed = now - this.lastPhaseChange;

        if (elapsed > this.settings.lightDuration) {
            this.lastPhaseChange = now;
            const phases = ['NS_GREEN', 'EW_GREEN'];
            const idx = phases.indexOf(this.trafficPhase);
            this.trafficPhase = phases[(idx + 1) % phases.length];
            document.getElementById('traffic-phase').innerText = this.trafficPhase.replace('_', ' ');
        }

        // Sync visual signals with phase
        if (this.junctions) {
            this.junctions.forEach(j => {
                const s = j.signals;
                const dim = 0x111111;
                
                [s.N, s.E, s.S, s.W].forEach(sig => {
                    sig.redLight.material.color.setHex(dim);
                    sig.greenLight.material.color.setHex(dim);
                });

                const nsColor = this.trafficPhase === 'NS_GREEN' ? 0x00ff00 : 0xff0000;
                const ewColor = this.trafficPhase === 'EW_GREEN' ? 0x00ff00 : 0xff0000;

                if (nsColor === 0xff0000) { s.N.redLight.material.color.setHex(nsColor); s.S.redLight.material.color.setHex(nsColor); }
                else { s.N.greenLight.material.color.setHex(nsColor); s.S.greenLight.material.color.setHex(nsColor); }

                if (ewColor === 0xff0000) { s.E.redLight.material.color.setHex(ewColor); s.W.redLight.material.color.setHex(ewColor); }
                else { s.E.greenLight.material.color.setHex(ewColor); s.W.greenLight.material.color.setHex(ewColor); }
            });
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    reset() {
        this.vehicles.forEach(v => v.destroy());
        this.vehicles = [];
        this.stats.passed = 0;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const dt = 1/60;
        this.world.step(dt);
        this.updateTrafficLogic();

        for(let i = this.vehicles.length - 1; i >= 0; i--) {
            const v = this.vehicles[i];
            v.update(dt);
            
            if(v.isOut()) {
                v.destroy();
                this.vehicles.splice(i, 1);
                this.stats.passed++;
                this.stats.active--;
            }
        }

        document.getElementById('active-cars').innerText = this.stats.active;
        const mins = (Date.now() - this.stats.startTime) / 60000;
        document.getElementById('throughput').innerText = Math.round(this.stats.passed / (mins || 1)) + '/MIN';

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

class Vehicle {
    createCarMesh(color) {
        const group = new THREE.Group();
        
        const chassisGeo = new THREE.BoxGeometry(2, 0.6, 4);
        const chassisMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.3 });
        const chassis = new THREE.Mesh(chassisGeo, chassisMat);
        chassis.position.y = 0.5;
        chassis.castShadow = true;
        group.add(chassis);

        const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.8 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.y = 1.1;
        cabin.position.z = -0.2;
        cabin.castShadow = true;
        group.add(cabin);

        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        const wpx = 1;
        const wpz = 1.2;
        const wy = 0.4;
        
        const wheels = [
            [wpx, wy, wpz], [-wpx, wy, wpz],
            [wpx, wy, -wpz], [-wpx, wy, -wpz]
        ];

        wheels.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.castShadow = true;
            group.add(wheel);
        });

        return group;
    }

    constructor(sim, config) {
        this.sim = sim;
        this.config = config;
        
        // Physics Body
        this.body = new CANNON.Body({
            mass: 500,
            shape: new CANNON.Box(new CANNON.Vec3(1.2, 0.8, 2.2)),
            position: new CANNON.Vec3(...config.start)
        });
        this.body.quaternion.setFromEuler(0, config.rot, 0);
        this.sim.world.addBody(this.body);

        // Visuals
        const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.4);
        this.mesh = this.createCarMesh(color);
        this.sim.scene.add(this.mesh);
        
        this.targetSpeed = sim.settings.carSpeed;
    }

    update(dt) {
        const pos = this.body.position;
        let speed = this.sim.settings.carSpeed;
        
        let shouldStop = false;

        if (this.sim.junctions) {
            for (let j of this.sim.junctions) {
                const dx = pos.x - j.x;
                const dz = pos.z - j.z;
                const distToCenter = Math.sqrt(dx*dx + dz*dz);
                
                if (distToCenter > 6 && distToCenter < 12) {
                    const isNS = Math.abs(this.config.dir[2]) > 0;
                    const isEW = Math.abs(this.config.dir[0]) > 0;
                    
                    const isRed = (isNS && this.sim.trafficPhase !== 'NS_GREEN') || 
                                  (isEW && this.sim.trafficPhase !== 'EW_GREEN');

                    if (isRed) {
                        const dot = dx * this.config.dir[0] + dz * this.config.dir[2];
                        if (dot < 0) shouldStop = true;
                    }
                }
            }
        }
        
        // Basic anti-collision
        for (let other of this.sim.vehicles) {
            if (other === this) continue;
            if (other.config.axis !== this.config.axis) continue;
            
            const dpX = other.body.position.x - pos.x;
            const dpZ = other.body.position.z - pos.z;
            const dist = Math.sqrt(dpX*dpX + dpZ*dpZ);
            
            if (dist < 8) {
                const dot = dpX * this.config.dir[0] + dpZ * this.config.dir[2];
                if (dot > 0 && dot > dist * 0.8) {
                    shouldStop = true;
                }
            }
        }

        if (shouldStop) speed = 0;

        const currentV = this.body.velocity;
        this.body.velocity.set(
            this.config.dir[0] * speed,
            currentV.y,
            this.config.dir[2] * speed
        );

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    isOut() {
        const p = this.body.position;
        return Math.abs(p.x) > 60 || Math.abs(p.z) > 60;
    }

    destroy() {
        this.sim.world.removeBody(this.body);
        this.sim.scene.remove(this.mesh);
    }
}

new TrafficSim();
