// ============================================================
// BLOCK WORLD
// Minecraft-style voxel game
// ============================================================


// ------------------------------------------------------------
// BASIC THREE.JS SETUP
// ------------------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

scene.fog = new THREE.Fog(
    0x87ceeb,
    25,
    100
);


// Camera

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);


// Renderer

const renderer = new THREE.WebGLRenderer({
    antialias: false
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

const ambientLight = new THREE.HemisphereLight(
    0xbde9ff,
    0x6d5535,
    1.5
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    50,
    80,
    30
);

sun.castShadow = true;

scene.add(sun);


// ------------------------------------------------------------
// BLOCK SETTINGS
// ------------------------------------------------------------

const BLOCK_SIZE = 1;

const WORLD_SIZE = 40;

const WORLD_HEIGHT = 16;


// Block materials

const materials = {

    grass: new THREE.MeshLambertMaterial({
        color: 0x55aa35
    }),

    dirt: new THREE.MeshLambertMaterial({
        color: 0x795548
    }),

    stone: new THREE.MeshLambertMaterial({
        color: 0x888888
    }),

    wood: new THREE.MeshLambertMaterial({
        color: 0x8b5a2b
    }),

    leaves: new THREE.MeshLambertMaterial({
        color: 0x2e8b35
    }),

    sand: new THREE.MeshLambertMaterial({
        color: 0xd8c27a
    })
};


// Block geometry

const blockGeometry =
    new THREE.BoxGeometry(
        BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );


// World data

const world = new Map();

const meshes = new Map();


// ------------------------------------------------------------
// WORLD KEY
// ------------------------------------------------------------

function getKey(x, y, z) {

    return `${x},${y},${z}`;

}


// ------------------------------------------------------------
// GET BLOCK
// ------------------------------------------------------------

function getBlock(x, y, z) {

    return world.get(
        getKey(x, y, z)
    );

}


// ------------------------------------------------------------
// SET BLOCK DATA
// ------------------------------------------------------------

function setBlockData(
    x,
    y,
    z,
    type
) {

    world.set(
        getKey(x, y, z),
        type
    );

}


// ------------------------------------------------------------
// REMOVE BLOCK
// ------------------------------------------------------------

function removeBlockData(
    x,
    y,
    z
) {

    world.delete(
        getKey(x, y, z)
    );

}


// ------------------------------------------------------------
// CREATE BLOCK MESH
// ------------------------------------------------------------

function createBlock(
    x,
    y,
    z,
    type
) {

    const material =
        materials[type];

    if (!material) {
        return;
    }

    const mesh =
        new THREE.Mesh(
            blockGeometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.userData.block = true;

    mesh.userData.x = x;
    mesh.userData.y = y;
    mesh.userData.z = z;

    mesh.userData.type = type;

    scene.add(mesh);

    meshes.set(
        getKey(x, y, z),
        mesh
    );

}


// ------------------------------------------------------------
// ADD BLOCK
// ------------------------------------------------------------

function addBlock(
    x,
    y,
    z,
    type
) {

    const key =
        getKey(x, y, z);

    if (world.has(key)) {
        return;
    }

    setBlockData(
        x,
        y,
        z,
        type
    );

    createBlock(
        x,
        y,
        z,
        type
    );

}


// ------------------------------------------------------------
// DELETE BLOCK
// ------------------------------------------------------------

function removeBlock(
    x,
    y,
    z
) {

    const key =
        getKey(x, y, z);

    const mesh =
        meshes.get(key);

    if (mesh) {

        scene.remove(mesh);

        mesh.geometry.dispose();

    }

    meshes.delete(key);

    removeBlockData(
        x,
        y,
        z
    );

}


// ------------------------------------------------------------
// TERRAIN HEIGHT
// ------------------------------------------------------------

function terrainHeight(
    x,
    z
) {

    const h =
        4
        + Math.sin(x * 0.25) * 2
        + Math.cos(z * 0.22) * 2
        + Math.sin(
            (x + z) * 0.15
        ) * 2;

    return Math.max(
        1,
        Math.floor(h)
    );

}


// ------------------------------------------------------------
// GENERATE WORLD
// ------------------------------------------------------------

function generateWorld() {

    for (
        let x = -WORLD_SIZE;
        x <= WORLD_SIZE;
        x++
    ) {

        for (
            let z = -WORLD_SIZE;
            z <= WORLD_SIZE;
            z++
        ) {

            const height =
                terrainHeight(
                    x,
                    z
                );


            // Ground

            for (
                let y = 0;
                y <= height;
                y++
            ) {

                let type = "stone";

                if (
                    y === height
                ) {

                    type = "grass";

                } else if (
                    y >= height - 2
                ) {

                    type = "dirt";

                }

                addBlock(
                    x,
                    y,
                    z,
                    type
                );

            }


            // Trees

            if (
                Math.random() < 0.025 &&
                height > 3 &&
                Math.abs(x) > 3 &&
                Math.abs(z) > 3
            ) {

                createTree(
                    x,
                    height + 1,
                    z
                );

            }

        }

    }

}


// ------------------------------------------------------------
// CREATE TREE
// ------------------------------------------------------------

function createTree(
    x,
    y,
    z
) {

    // Trunk

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        addBlock(
            x,
            y + i,
            z,
            "wood"
        );

    }


    // Leaves

    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            for (
                let dy = 2;
                dy <= 4;
                dy++
            ) {

                if (
                    Math.abs(dx) +
                    Math.abs(dz) +
                    Math.abs(dy - 3)
                    < 4
                ) {

                    addBlock(
                        x + dx,
                        y + dy,
                        z + dz,
                        "leaves"
                    );

                }

            }

        }

    }

}


// Generate

generateWorld();


// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------

const player = {

    x: 0,

    y: terrainHeight(0, 0) + 2,

    z: 0,

    velocityY: 0,

    height: 1.8,

    width: 0.6,

    speed: 6,

    jumpPower: 8,

    onGround: false

};


// Camera starts at player

camera.position.set(
    player.x,
    player.y,
    player.z
);


// ------------------------------------------------------------
// INPUT
// ------------------------------------------------------------

const keys = {};

let pointerLocked = false;

let yaw = 0;

let pitch = 0;


document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        // Number keys

        if (
            event.code === "Digit1"
        ) selectBlock("grass");

        if (
            event.code === "Digit2"
        ) selectBlock("dirt");

        if (
            event.code === "Digit3"
        ) selectBlock("stone");

        if (
            event.code === "Digit4"
        ) selectBlock("wood");

        if (
            event.code === "Digit5"
        ) selectBlock("leaves");


        // Jump

        if (
            event.code === "Space" &&
            player.onGround
        ) {

            player.velocityY =
                player.jumpPower;

            player.onGround = false;

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


// ------------------------------------------------------------
// MOUSE LOOK
// ------------------------------------------------------------

document.addEventListener(
    "mousemove",
    event => {

        if (!pointerLocked) {
            return;
        }

        const sensitivity = 0.0025;

        yaw -=
            event.movementX *
            sensitivity;

        pitch -=
            event.movementY *
            sensitivity;


        const limit =
            Math.PI / 2 - 0.05;

        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );

    }
);


// ------------------------------------------------------------
// START GAME
// ------------------------------------------------------------

const startScreen =
    document.getElementById(
        "startScreen"
    );

const startButton =
    document.getElementById(
        "startButton"
    );


startButton.addEventListener(
    "click",
    () => {

        renderer.domElement
            .requestPointerLock();

    }
);


document.addEventListener(
    "pointerlockchange",
    () => {

        pointerLocked =
            document.pointerLockElement ===
            renderer.domElement;

        if (pointerLocked) {

            startScreen.style.display =
                "none";

        } else {

            startScreen.style.display =
                "flex";

        }

    }
);


// ------------------------------------------------------------
// BLOCK SELECTION
// ------------------------------------------------------------

let selectedBlock = "grass";


function selectBlock(type) {

    selectedBlock = type;

    document
        .querySelectorAll(".slot")
        .forEach(slot => {

            slot.classList.remove(
                "selected"
            );

            if (
                slot.dataset.block ===
                type
            ) {

                slot.classList.add(
                    "selected"
                );

            }

        });

}


// ------------------------------------------------------------
// PREVENT RIGHT CLICK MENU
// ------------------------------------------------------------

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ------------------------------------------------------------
// RAYCASTING
// ------------------------------------------------------------

const raycaster =
    new THREE.Raycaster();


const center =
    new THREE.Vector2(
        0,
        0
    );


// Get block player is looking at

function getTargetBlock() {

    raycaster.setFromCamera(
        center,
        camera
    );

    const objects =
        Array.from(
            meshes.values()
        );

    const hits =
        raycaster.intersectObjects(
            objects
        );

    if (
        hits.length === 0
    ) {

        return null;

    }

    return hits[0];

}


// ------------------------------------------------------------
// MOUSE BLOCK ACTIONS
// ------------------------------------------------------------

document.addEventListener(
    "mousedown",
    event => {

        if (!pointerLocked) {
            return;
        }

        const hit =
            getTargetBlock();

        if (!hit) {
            return;
        }

        const mesh =
            hit.object;


        const x =
            mesh.userData.x;

        const y =
            mesh.userData.y;

        const z =
            mesh.userData.z;


        // LEFT CLICK = BREAK

        if (
            event.button === 0
        ) {

            // Don't remove bottom layer

            if (y <= 0) {
                return;
            }

            removeBlock(
                x,
                y,
                z
            );

        }


        // RIGHT CLICK = PLACE

        if (
            event.button === 2
        ) {

            const normal =
                hit.face.normal;


            const nx =
                x +
                Math.round(
                    normal.x
                );

            const ny =
                y +
                Math.round(
                    normal.y
                );

            const nz =
                z +
                Math.round(
                    normal.z
                );


            // Don't place inside player

            if (
                playerIntersectsBlock(
                    nx,
                    ny,
                    nz
                )
            ) {

                return;

            }


            if (
                !getBlock(
                    nx,
                    ny,
                    nz
                )
            ) {

                addBlock(
                    nx,
                    ny,
                    nz,
                    selectedBlock
                );

            }

        }

    }
);


// ------------------------------------------------------------
// PLAYER COLLISION
// ------------------------------------------------------------

function playerIntersectsBlock(
    x,
    y,
    z
) {

    const minX =
        player.x -
        player.width / 2;

    const maxX =
        player.x +
        player.width / 2;

    const minY =
        player.y;

    const maxY =
        player.y +
        player.height;

    const minZ =
        player.z -
        player.width / 2;

    const maxZ =
        player.z +
        player.width / 2;


    return (
        maxX > x - 0.5 &&
        minX < x + 0.5 &&
        maxY > y - 0.5 &&
        minY < y + 0.5 &&
        maxZ > z - 0.5 &&
        minZ < z + 0.5
    );

}


// ------------------------------------------------------------
// COLLISION CHECK
// ------------------------------------------------------------

function canMoveTo(
    x,
    y,
    z
) {

    const half =
        player.width / 2;

    const minX =
        x - half;

    const maxX =
        x + half;

    const minY =
        y;

    const maxY =
        y + player.height;

    const minZ =
        z - half;

    const maxZ =
        z + half;


    const startX =
        Math.floor(
            minX - 0.5
        );

    const endX =
        Math.floor(
            maxX + 0.5
        );

    const startY =
        Math.floor(
            minY - 0.5
        );

    const endY =
        Math.floor(
            maxY + 0.5
        );

    const startZ =
        Math.floor(
            minZ - 0.5
        );

    const endZ =
        Math.floor(
            maxZ + 0.5
        );


    for (
        let bx = startX;
        bx <= endX;
        bx++
    ) {

        for (
            let by = startY;
            by <= endY;
            by++
        ) {

            for (
                let bz = startZ;
                bz <= endZ;
                bz++
            ) {

                if (
                    getBlock(
                        bx,
                        by,
                        bz
                    )
                ) {

                    if (
                        maxX > bx - 0.5 &&
                        minX < bx + 0.5 &&
                        maxY > by - 0.5 &&
                        minY < by + 0.5 &&
                        maxZ > bz - 0.5 &&
                        minZ < bz + 0.5
                    ) {

                        return false;

                    }

                }

            }

        }

    }

    return true;

}


// ------------------------------------------------------------
// PLAYER MOVEMENT
// ------------------------------------------------------------

function updatePlayer(
    delta
) {

    let forward = 0;
    let strafe = 0;


    if (keys["KeyW"]) {
        forward += 1;
    }

    if (keys["KeyS"]) {
        forward -= 1;
    }

    if (keys["KeyD"]) {
        strafe += 1;
    }

    if (keys["KeyA"]) {
        strafe -= 1;
    }


    const length =
        Math.sqrt(
            forward * forward +
            strafe * strafe
        );


    if (length > 0) {

        forward /= length;
        strafe /= length;

    }


    // Direction based on camera yaw

    const sin =
        Math.sin(yaw);

    const cos =
        Math.cos(yaw);


    const moveX =
        (
            strafe * cos -
            forward * sin
        ) *
        player.speed *
        delta;


    const moveZ =
        (
            strafe * sin +
            forward * cos
        ) *
        player.speed *
        delta;


    // X collision

    if (
        canMoveTo(
            player.x + moveX,
            player.y,
            player.z
        )
    ) {

        player.x += moveX;

    }


    // Z collision

    if (
        canMoveTo(
            player.x,
            player.y,
            player.z + moveZ
        )
    ) {

        player.z += moveZ;

    }


    // Gravity

    player.velocityY -=
        20 * delta;


    let newY =
        player.y +
        player.velocityY *
        delta;


    // Vertical collision

    if (
        canMoveTo(
            player.x,
            newY,
            player.z
        )
    ) {

        player.y = newY;

        player.onGround = false;

    } else {

        if (
            player.velocityY < 0
        ) {

            player.onGround = true;

        }

        player.velocityY = 0;

    }


    // Respawn if falling

    if (
        player.y < -10
    ) {

        player.x = 0;

        player.z = 0;

        player.y =
            terrainHeight(
                0,
                0
            ) + 3;

        player.velocityY = 0;

    }

}


// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function updateCamera() {

    camera.position.set(
        player.x,
        player.y +
        player.height -
        0.2,
        player.z
    );


    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;

}


// ------------------------------------------------------------
// FPS
// ------------------------------------------------------------

let frames = 0;

let lastFPSUpdate =
    performance.now();

const fpsElement =
    document.getElementById(
        "fps"
    );


function updateFPS() {

    frames++;

    const now =
        performance.now();

    if (
        now -
        lastFPSUpdate >
        1000
    ) {

        fpsElement.textContent =
            `FPS: ${frames}`;

        frames = 0;

        lastFPSUpdate =
            now;

    }

}


// ------------------------------------------------------------
// POSITION HUD
// ------------------------------------------------------------

const positionElement =
    document.getElementById(
        "position"
    );


function updatePositionHUD() {

    positionElement.textContent =
        `X: ${Math.floor(player.x)} ` +
        `Y: ${Math.floor(player.y)} ` +
        `Z: ${Math.floor(player.z)}`;

}


// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ------------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------------

let previousTime =
    performance.now();


function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const currentTime =
        performance.now();


    let delta =
        (currentTime -
        previousTime) /
        1000;


    previousTime =
        currentTime;


    // Prevent giant physics step

    delta =
        Math.min(
            delta,
            0.05
        );


    updatePlayer(
        delta
    );

    updateCamera();

    updateFPS();

    updatePositionHUD();


    renderer.render(
        scene,
        camera
    );

}


gameLoop();
