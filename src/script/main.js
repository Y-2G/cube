import { OrbitControls } from './orbit-controls.js';

window.addEventListener('load', load);
window.addEventListener('resize', resize);

function load() {
    const main = new Main();
    main.init();
}

function resize() {
    const main = new Main();
    main.resize();
}

class Main {
    constructor() {
        this.renderer  = null;
        this.scene     = null;
        this.camera    = null;
        this.group     = null;
        this.requestId = null;
        this.controls  = null;
        this.mode      = 'control';
        this.meshList  = new Array();
        this.clickStart   = new THREE.Vector2();
        this.clickCurrent = new THREE.Vector2();
        this.mouseMoveCallback = this.mouseMove.bind(this);
    }

    init() {
        document.querySelector('#button').addEventListener('click', e => {
            this.mode = this.mode === 'control' ? 'camera' : 'control';
            
            // イベントを発火させる
            const checkbox = document.querySelector('#checkbox');
            const event = document.createEvent( "MouseEvents" );
            event.initEvent("click", false, true);
            checkbox.dispatchEvent(event); 

            e.preventDefault();
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
        this.camera.lookAt(0, 0, 0)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // 平行光源
        const light = new THREE.AmbientLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);

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
            this.scene.attach(mesh);
        }

        this.group = new THREE.Group();
        this.scene.attach(this.group);

        this.tick();

        document.addEventListener('mousedown', this.mouseDown.bind(this), false);
        document.addEventListener('mouseup', this.mouseUp.bind(this), false);

        document.addEventListener('touchstart', this.mouseDown.bind(this), false);
        document.addEventListener('touchend', this.mouseUp.bind(this), false);
    }

    resize() {
        this.init();
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
        document.addEventListener('mousemove', this.mouseMoveCallback, {passive: false});
        document.addEventListener('touchmove', this.mouseMoveCallback, {passive: false});

        if(!event.changedTouches) {
            this.clickStart.x = event.pageX;
            this.clickStart.y = event.pageY;
        } else {
            this.clickStart.x = event.changedTouches[0].pageX;
            this.clickStart.y = event.changedTouches[0].pageY;
        }
    }

    mouseMove(event) {
        event.preventDefault();

        if(!event.changedTouches) {
            this.clickCurrent.x = event.pageX;
            this.clickCurrent.y = event.pageY;
        } else {
            this.clickCurrent.x = event.changedTouches[0].pageX;
            this.clickCurrent.y = event.changedTouches[0].pageY;
        }
        
        this.createGroup();
    }

    mouseUp() {
        document.removeEventListener('mousemove', this.mouseMoveCallback, {passive: false});
        document.removeEventListener('touchmove', this.mouseMoveCallback, {passive: false});
        
        if(this.group.children.length === 9) {
            this.decideDirection();
            this.executeRotation();
        } else {
            this.resetRotation(); 
        }

        this.clickStart.x = 0;
        this.clickStart.y = 0;
        this.clickCurrent.x = 0;
        this.clickCurrent.y = 0;
    }

    createGroup() {
        const mouse = new THREE.Vector2();
        mouse.x =   (this.clickCurrent.x / window.innerWidth ) * 2 - 1;
        mouse.y = - (this.clickCurrent.y / window.innerHeight) * 2 + 1;

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
        const moveX = this.clickCurrent.x - this.clickStart.x;
        const moveY = this.clickCurrent.y - this.clickStart.y;
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
