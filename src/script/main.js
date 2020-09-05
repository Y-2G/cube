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
        this.group = new THREE.Group();
        this.vecrtor = { x: 0, y: 0, z: 0 };
        this.mode = 'control';
        this.canvas = document.querySelector('#canvas');
        this.click = new Object();
        this.click.start = new THREE.Vector2();
        this.click.current  = new THREE.Vector2();
        this.meshList = new Array();
        this.mouseMoveCallback = this.mouseMove.bind(this);
    }

    init() {
        document.querySelector('#checkbox').addEventListener('click', () => {
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
        this.camera.position.set(800, 500, +1000);
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
        this.click.current.x = event.pageX;
        this.click.current.y = event.pageY;
    }

    mouseMove(event) {
        this.click.current.x = event.pageX;
        this.click.current.y = event.pageY;
        
        const moveX = this.click.current.x - this.click.start.x;
        const moveY = this.click.current.y - this.click.start.y;
        
        this.vecrtor.x = moveX;
        this.vecrtor.y = moveY;

        this.createGroup();
    }

    mouseUp() {
        document.removeEventListener('mousemove', this.mouseMoveCallback, false);

        this.click.start.x = 0;
        this.click.start.y = 0;
        this.click.current.x = 0;
        this.click.current.y = 0;

        if(this.group.children.length !== 9) {
            for(const e of this.meshList) {
                this.scene.attach(e);
            }

            return;
        }

        this.decideRotationDirection();
        this.executeRotate();
    }

    createGroup() {
        const mouse = new THREE.Vector2();
        mouse.x =   (this.click.current.x / window.innerWidth ) * 2 - 1;
        mouse.y = - (this.click.current.y / window.innerHeight) * 2 + 1;

        const ray1 = new THREE.Raycaster();
        ray1.setFromCamera(mouse, this.camera);
        const intersects1 = ray1.intersectObjects(this.scene.children, true);

        if(intersects1.length === 0) return;

        const object = intersects1[0].object;
        const point = intersects1[0].point.clone();

        // クリックした面の法線ベクトルを取得する
        const face  = intersects1[0].face.normal.clone();
        
        // オブジェクトに合わせて回転させる
        face.applyQuaternion(object.quaternion);

        const ray = new THREE.Raycaster();
        ray.set(point, face.negate());
        const intersects = ray.intersectObjects(this.scene.children, true);

        if(intersects.length === 0) return;

        for(const e of intersects) {
            if(this.group.children.includes(e.object) === true) continue;
            this.group.attach(e.object)
        }
    }

    decideRotationDirection() {
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
            return this.rotationDirection = 'y';
        }

        if(checkY.includes(false) === false) {
            return this.rotationDirection = 'x';
        }

        if(checkZ.includes(false) === false) {
            return this.rotationDirection = 'z';
        }
    }

    executeRotate() {
        const vector = new THREE.Vector3(this.vecrtor.x, this.vecrtor.y, 0);
        
        if(this.rotationDirection === 'x') {
            let direction = vector.x > 0 ? 1 : -1;
            this.rotateX(Math.PI / 2, direction)
        }

        if(this.rotationDirection === 'y') {
            let direction = vector.y > 0 ? 1 : -1;
            direction *= this.camera.position.z > 0 ? 1: -1
            this.rotateY(Math.PI / 2, direction);
        }
        
        if(this.rotationDirection === 'z') {
            let direction;
            
            if(Math.abs(vector.x) > 50) {
                direction = vector.x < 0 ? 1 : -1;
                direction *= this.camera.position.y > 0 ? 1: -1;
            } 

            if(Math.abs(vector.y) > 50) {
                direction = vector.y < 0 ? 1 : -1;
                direction *= this.camera.position.x > 0 ? 1: -1;
            }
            
            this.rotateZ(Math.PI / 2, direction);
        }
    }

    rotateX(angle, direction) {
        if( Math.abs(this.group.rotation.y) >= Math.abs(angle) ) {
            this.group.rotation.y = angle * direction;
            this.renderer.render(this.scene, this.camera);
            
            this.rotateFinish(); 
            
            return cancelAnimationFrame(this.id);
        }

        this.group.rotation.y += 6 * 0.02 * direction;

        this.id = requestAnimationFrame(this.rotateX.bind(this, angle, direction));
    }

    rotateY(angle, direction) {
        if( Math.abs(this.group.rotation.x) >= Math.abs(angle) ) {
            this.group.rotation.x = angle * direction;
            this.renderer.render(this.scene, this.camera);

            this.rotateFinish(); 
            return cancelAnimationFrame( this.id );
        }

        this.group.rotation.x += 6 * 0.02 * direction;

        this.id = requestAnimationFrame(this.rotateY.bind(this, angle, direction));
    }

    rotateZ(angle, direction) {
        if( Math.abs(this.group.rotation.z) >= Math.abs(angle) ) {
            this.group.rotation.z = angle * direction;
            this.renderer.render(this.scene, this.camera);
            
            this.rotateFinish(); 

            return cancelAnimationFrame( this.id );
        }

        this.group.rotation.z += 6 * 0.02 * direction;

        this.id = requestAnimationFrame(this.rotateZ.bind(this, angle, direction));
    }

    rotateFinish() {
        for(const e of this.meshList) {
            this.scene.attach(e);
        }
        this.group.rotation.set(0, 0, 0);
        this.rotationDirection = null;
    }

}
