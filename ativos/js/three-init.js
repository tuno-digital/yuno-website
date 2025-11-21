/* ===========================================================
   YUNO 9.0 — three-init.js
   Sistema 3D Futurista • Arena Auditada
   -----------------------------------------------------------
   Este ficheiro inicializa a cena 3D da Yuno
   e carrega o modelo neon (avatar 3D).
   =========================================================== */

console.log("YUNO 3D Engine • Inicializado");

// PROTEÇÃO — impede erro se página não for 3D
if (!document.getElementById("yuno-3d-canvas")) {
    console.warn("three-init.js: Nenhum canvas 3D encontrado. A terminar…");
    return;
}

(async () => {

    /* -------------------------------------- */
    /* IMPORTA THREE.JS (CDN ou local vendors) */
    /* -------------------------------------- */
    try {
        await import("/ativos/vendors/three.min.js");
    } catch (err) {
        console.error("Erro ao carregar THREE.JS", err);
        return;
    }

    const canvas = document.getElementById("yuno-3d-canvas");

    // Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020b18);

    // Câmara
    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(0, 1.5, 3);

    // Renderizador
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    /* -------------------------------------- */
    /* LUZES NEON FUTURISTAS                  */
    /* -------------------------------------- */
    const neonLight = new THREE.PointLight(0x00eaff, 2, 20);
    neonLight.position.set(0, 2, 2);
    scene.add(neonLight);

    const softFill = new THREE.AmbientLight(0x1a1f2e, 0.4);
    scene.add(softFill);

    /* -------------------------------------- */
    /* LOADING TEXT                           */
    /* -------------------------------------- */
    const loadingEl = document.getElementById("loading-3d");
    if (loadingEl) loadingEl.style.display = "block";

    /* -------------------------------------- */
    /* CARREGAR MODELO GLB                    */
    /* -------------------------------------- */
    let mixer = null;

    try {
        // loader externo para GLB
        const { GLTFLoader } = await import(
            "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js"
        );

        const loader = new GLTFLoader();

        loader.load(
            "/ativos/models/avatar-3d.glb",
            (gltf) => {
                const model = gltf.scene;
                model.position.set(0, -1.2, 0);
                model.rotation.y = Math.PI;

                scene.add(model);

                if (loadingEl) loadingEl.style.display = "none";

                // Suporta animações se existirem
                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                console.log("Avatar 3D carregado com sucesso!");
            },
            undefined,
            (err) => {
                console.error("Erro a carregar avatar 3D:", err);
                if (loadingEl) loadingEl.innerText = "Erro ao carregar modelo.";
            }
        );
    } catch (e) {
        console.error("Falha ao carregar Loader GLB:", e);
        if (loadingEl) loadingEl.innerText = "Erro no módulo GLB.";
    }

    /* -------------------------------------- */
    /* ANIMAÇÃO                               */
    /* -------------------------------------- */
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        if (mixer) mixer.update(clock.getDelta());

        renderer.render(scene, camera);
    }

    animate();

    /* -------------------------------------- */
    /* RESPONSIVIDADE                         */
    /* -------------------------------------- */
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();