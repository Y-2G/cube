window.addEventListener('load', init);
window.addEventListener('resize', init);

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
        this.group = new THREE.Group();
        this.mode = 'control';
        this.click = new Object();
        this.click.start = new THREE.Vector2();
        this.click.current  = new THREE.Vector2();
        this.meshList = new Array();
        this.mouseMoveCallback = this.mouseMove.bind(this);
        this.requestId = null;
    }

    init() {
        document.querySelector('#checkbox').addEventListener('click', () => {
            this.mode = this.mode === 'control' ? 'camera' : 'control';
        });

        // レンダラー
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas') });

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
        this.camera.position.set(500, 500, 1000);
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

        for(const e of this.meshList) {
            this.scene.attach(e);
        }

        this.scene.attach(this.group);
        this.scene.add(light);

        this.tick();

        document.addEventListener('mousedown', this.mouseDown.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));
    }

    tick() {
        requestAnimationFrame(this.tick.bind(this));

        if(this.mode === 'camera') {
            this.controls.enableRotate = true;
            this.renderer.render(this.scene, this.camera);

            return;
        }

        this.controls.enableRotate = false;

        this.renderer.render(this.scene, this.camera);
    }

    mouseDown(event) {
        document.addEventListener('mousemove', this.mouseMoveCallback, false);

        this.click.start.x = event.pageX;
        this.click.start.y = event.pageY;
    }

    mouseMove(event) {
        this.click.current.x = event.pageX;
        this.click.current.y = event.pageY;
        
        this.createGroup();
    }

    mouseUp() {
        document.removeEventListener('mousemove', this.mouseMoveCallback, false);

        if(this.group.children.length === 9) {
            this.decideDirection();
            this.executeRotation();
        } else {
            this.resetRotation(); 
        }

        this.click.start.x = 0;
        this.click.start.y = 0;
        this.click.current.x = 0;
        this.click.current.y = 0;
    }

    createGroup() {
        const mouse = new THREE.Vector2();
        mouse.x =   (this.click.current.x / window.innerWidth ) * 2 - 1;
        mouse.y = - (this.click.current.y / window.innerHeight) * 2 + 1;

        const ray = new THREE.Raycaster();

        ray.setFromCamera(mouse, this.camera);
        let intersects = ray.intersectObjects(this.scene.children, true);

        if(intersects.length === 0) return;

        const object = intersects[0].object;
        const point = intersects[0].point.clone();

        // クリックした面の法線ベクトルを取得する
        const face  = intersects[0].face.normal.clone();
        
        // オブジェクトに合わせて回転させる
        // これを行わないと法線ベクトルが常に初期の方向をむいてしまう
        face.applyQuaternion(object.quaternion);

        // クリックした点から逆方向に伸びる光線を作って交差を取得する
        ray.set(point, face.negate());
        intersects = ray.intersectObjects(this.scene.children, true);

        if(intersects.length === 0) return;

        for(const e of intersects) {
            if(this.group.children.includes(e.object) === true) continue;
            this.group.attach(e.object)
        }
    }

    decideDirection() {
        const base = this.group.children[0].position;
        
        const checkX = [];
        const checkY = [];
        const checkZ = [];

        for(const mesh of this.group.children) {
            checkX.push(Math.abs(base.x - mesh.position.x) < 5);
            checkY.push(Math.abs(base.y - mesh.position.y) < 5);
            checkZ.push(Math.abs(base.z - mesh.position.z) < 5);
        }

        if(checkX.includes(false) === false) {
            return this.direction = 'y';
        }

        if(checkY.includes(false) === false) {
            return this.direction = 'x';
        }

        if(checkZ.includes(false) === false) {
            return this.direction = 'z';
        }
    }

    executeRotation() {
        const moveX = this.click.current.x - this.click.start.x;
        const moveY = this.click.current.y - this.click.start.y;
        let adjust = 1;
        
        if(this.direction === 'x') {
            adjust = moveX > 0 ? 1 : -1;
            this.rotateX(Math.PI / 2, adjust)
        }

        if(this.direction === 'y') {
            adjust = moveY > 0 ? 1 : -1;
            adjust *= this.camera.position.z > 0 ? 1: -1
            this.rotateY(Math.PI / 2, adjust);
        }
        
        if(this.direction === 'z') {
            if(Math.abs(moveX) > 50) {
                adjust = moveX < 0 ? 1 : -1;
                adjust *= this.camera.position.y > 0 ? 1: -1;
            } 

            if(Math.abs(moveY) > 50) {
                adjust = moveY < 0 ? 1 : -1;
                adjust *= this.camera.position.x > 0 ? 1: -1;
            }
            
            this.rotateZ(Math.PI / 2, adjust);
        }
    }

    rotateX(angle, direction) {
        if( Math.abs(this.group.rotation.y) >= Math.abs(angle) ) {
            this.group.rotation.y = angle * direction;
            this.renderer.render(this.scene, this.camera);
            this.resetRotation(); 
            return cancelAnimationFrame(this.requestId);
        }

        this.group.rotation.y += 6 * 0.02 * direction;

        this.requestId = requestAnimationFrame(this.rotateX.bind(this, angle, direction));
    }

    rotateY(angle, direction) {
        if( Math.abs(this.group.rotation.x) >= Math.abs(angle) ) {
            this.group.rotation.x = angle * direction;
            this.renderer.render(this.scene, this.camera);
            this.resetRotation(); 
            return cancelAnimationFrame( this.requestId );
        }

        this.group.rotation.x += 6 * 0.02 * direction;

        this.requestId = requestAnimationFrame(this.rotateY.bind(this, angle, direction));
    }

    rotateZ(angle, direction) {
        if( Math.abs(this.group.rotation.z) >= Math.abs(angle) ) {
            this.group.rotation.z = angle * direction;
            this.renderer.render(this.scene, this.camera);
            this.resetRotation(); 
            return cancelAnimationFrame( this.requestId );
        }

        this.group.rotation.z += 6 * 0.02 * direction;

        this.requestId = requestAnimationFrame(this.rotateZ.bind(this, angle, direction));
    }

    resetRotation() {
        for(const e of this.meshList) {
            this.scene.attach(e);
        }
        this.group.rotation.set(0, 0, 0);
        this.direction = null;
    }
}
