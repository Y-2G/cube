window.addEventListener('load', init);

function init() {
    const main = new Main();
    main.init();
}

class Main {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.group = new THREE.Group();
        this.vecrtor = { x: 0, y: 0 }
        this.mode = 'control';
        this.canvas = document.querySelector('#canvas');
        this.click = new Object();
        this.click.start = new THREE.Vector2();
        this.click.current  = new THREE.Vector2();
        this.meshList = new Array();
        this.mouseMoveCallback = this.mouseMove.bind(this);
    }

    init() {
        document.querySelector('#button').addEventListener('click', () => {
            this.mode = this.mode === 'control' ? 'camera' : 'control';
        });

        // レンダラー
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

        const rendererWidth = window.innerWidth;
        const rendererHeight = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(rendererWidth, rendererHeight);

        // シーン
        this.scene = new THREE.Scene();

        // カメラ
        const angle = 45;
        const aspect = rendererWidth / rendererHeight;
        const renderStartdist = 1;
        const renderStopdist = 10000;
        this.camera = new THREE.PerspectiveCamera(angle, aspect, renderStartdist, renderStopdist);
        this.camera.position.set(0, 0, +1000);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // 平行光源
        const light = new THREE.AmbientLight(0xffffff);
        light.position.set(1, 1, 1);

        // オブジェクト
        const meshWidth  = 100;
        const meshHeight = 100;
        const meshDepth  = 100;

        for(let i = 0; i < 27; i++) {
            const geometry = new THREE.BoxGeometry(meshWidth, meshHeight, meshDepth);

            const loader = new THREE.TextureLoader();

            // マテリアルにテクスチャーを設定
            const material = [
                new THREE.MeshStandardMaterial({map: loader.load('../img/red.jpg')}),
                new THREE.MeshStandardMaterial({map: loader.load('../img/orange.jpg')}),
                new THREE.MeshStandardMaterial({map: loader.load('../img/yellow.jpg')}),
                new THREE.MeshStandardMaterial({map: loader.load('../img/white.jpg')}),
                new THREE.MeshStandardMaterial({map: loader.load('../img/blue.jpg')}),
                new THREE.MeshStandardMaterial({map: loader.load('../img/green.jpg')})
            ];

            const x = (- meshWidth) + (i % 3) * meshWidth;
            const y = (meshHeight)  - (Math.floor(i / 3) % 3) * meshHeight;
            const z = (- meshDepth) + (Math.floor(i / 9) % 3) * meshDepth;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = `mesh${i}`;
            mesh.position.set(x, y, z);
            
            this.meshList.push(mesh);
        }

        this.meshList.forEach(e => this.scene.add(e));
        this.scene.add(this.group);
        this.scene.add(light);

        document.addEventListener('mousedown', this.mouseDown.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));

        this.tick();
    }

    tick() {
        requestAnimationFrame(this.tick.bind(this));

        if(this.mode === 'camera') {
            this.controls.enableRotate = true;
            this.renderer.render(this.scene, this.camera);

            return;
        }

        this.controls.enableRotate = false;

        const mouse = new THREE.Vector2();
        mouse.x =   (this.click.start.x / window.innerWidth) * 2 - 1;
        mouse.y = - (this.click.start.y / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if(intersects.length < 1) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // ドラッグされた時オブジェクトをグループ化して回転する
        const moveX = this.click.start.x - this.click.current.x;
        const moveY = this.click.start.y - this.click.current.y;

        if(this.group.children.length === 0) {
            const target = intersects[0].object;
            this.group = new THREE.Group();
            this.scene.add(this.group);
            for(const e of this.meshList) {
                // 12: x軸 13: y軸
                if(this.vecrtor.x !== 0) {
                    this.camera.position.x 
                    const diff = e.matrix.elements[13] - target.matrix.elements[13];
                    if(Math.abs(diff) < 5) {
                        this.group.add(e);
                    }
                }

                if(this.vecrtor.y !== 0) {
                    const diff = e.matrix.elements[12] - target.matrix.elements[12];
                    if(Math.abs(diff) < 5) {
                        this.group.add(e);
                    }
                }
            }
        }

        const direction = this.camera.position.z < 0 ? 1 : -1;
        this.group.rotation.x = this.vecrtor.y * 0.02 * direction;
        this.group.rotation.y = this.vecrtor.x * 0.02 * direction;

        this.renderer.render(this.scene, this.camera);
    }


    mouseDown(event) {
        document.addEventListener('mousemove', this.mouseMoveCallback, false);

        this.click.start.x = event.pageX;
        this.click.start.y = event.pageY;
        this.click.current.x = event.pageX;
        this.click.current.y = event.pageY;
    }

    mouseMove(event) {
        this.click.current.x = event.pageX;
        this.click.current.y = event.pageY;

        const moveX = this.click.start.x - this.click.current.x;
        const moveY = this.click.start.y - this.click.current.y;

        if(Math.abs(moveX) > 50 && this.vecrtor.y === 0) {
            this.vecrtor = { x: moveX, y: 0 }
            return;
        } 
        
        if(Math.abs(moveY) > 50 && this.vecrtor.x === 0) {
            this.vecrtor = { x: 0, y: moveY }
            return;
        }
    }

    mouseUp() {
        document.removeEventListener('mousemove', this.mouseMoveCallback, false);

        this.click.start.x = 0;
        this.click.start.y = 0;
        this.click.current.x = 0;
        this.click.current.y = 0;

        if (this.vecrtor.x !== 0) {
            let direction = this.vecrtor.x < 0 ? 1 : -1;
            direction *= this.camera.position.z < 0 ? -1 : 1;
            this.group.rotation.y = Math.PI / 2 * direction;
        }

        if(this.vecrtor.y !== 0) {
            let direction = this.vecrtor.y < 0 ? 1 : -1;
            direction *= this.camera.position.z < 0 ? -1 : 1;
            this.group.rotation.x = Math.PI / 2 * direction;
        }

        this.renderer.render(this.scene, this.camera);

        for(const e of this.meshList) {
            e.matrixAutoUpdate = false;
            e.matrix.fromArray(e.matrixWorld.elements);
            this.scene.add(e);
        }

        this.scene.remove(this.group);
        this.vecrtor = { x: 0, y: 0 }

        this.renderer.render(this.scene, this.camera);
    }
}