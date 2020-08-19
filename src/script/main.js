window.addEventListener('load', init);

function init() {
    const main = new Main();
    main.init();
}
class Test {
    constructor() {
        this.children = new Array
    }
}

class Main {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.group = new THREE.Group();
        this.vecrtor = { x: 0, y: 0, z: 0 }
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

        if(this.group.children.length === 0) {
            const target = intersects[0].object;
            this.group = new THREE.Group();
            this.scene.add(this.group);

            const point = intersects[0].point;
            console.log(point)

            for(const e of this.meshList) {
                const vec = new THREE.Vector3();
                const pos = e.getWorldPosition(vec)
                if(this.vecrtor.x !== 0) {

                    // 立方体の中心y座標 - 立方体の高さ / 2
                    const minY = (pos.y - 50);

                    // 立方体の中心y座標 + 立方体の高さ / 2
                    const maxY = (pos.y + 50);

                    // 立方体の中心y座標 - 立方体の高さ / 2
                    const minZ = (pos.z - 50);

                    // 立方体の中心y座標 + 立方体の高さ / 2
                    const maxZ = (pos.z + 50);

                    // クリック座標が立方体に含まれる時、グループに追加する
                    if(Math.abs(point.z) > 145) {
                        if(point.y > minY && point.y < maxY) {
                            this.test = 'x'
                            this.group.add(e);
                        }
                    } else {
                        if(Math.abs(point.x) > 145) {
                            if(point.y > minY && point.y < maxY) {
                                this.test = 'x'
                                this.group.add(e);
                            }
                        }
                        if(Math.abs(point.y) > 145) {
                            if(point.z > minZ && point.z < maxZ) {
                                this.test = 'xz'
                                this.group.add(e);
                            }
                        }
                    }

                    // const diff = e.matrix.elements[13] - target.matrix.elements[13];
                    // if(Math.abs(diff) < 5) {
                    //     this.group.add(e);
                    // }
                }

                if(this.vecrtor.y !== 0) {
                    // 立方体の中心y座標 - 立方体の高さ / 2
                    const minX = (pos.x - 50);

                    // 立方体の中心y座標 + 立方体の高さ / 2
                    const maxX = (pos.x + 50);

                    // 立方体の中心y座標 - 立方体の高さ / 2
                    const minZ = (pos.z - 50);

                    // 立方体の中心y座標 + 立方体の高さ / 2
                    const maxZ = (pos.z + 50);

                    // クリック座標が立方体に含まれる時、グループに追加する
                    // if(Math.abs(point.z) < 145) {
                    //     if(point.z > minZ && point.z < maxZ) {
                    //         this.test = 'yz'
                    //         this.group.add(e);
                    //     }
                    // } else {
                    //     if(point.x > minX && point.x < maxX) {
                    //         this.group.add(e);
                    //     }
                    // }

                    // クリック座標が立方体に含まれる時、グループに追加する
                    if(Math.abs(point.z) > 145) {
                        if(point.x > minX && point.x < maxX) {
                            this.test = 'y'
                            this.group.add(e);
                        }
                    } else {
                        if(Math.abs(point.y) > 145) {
                            if(point.x > minX && point.x < maxX) {
                                this.test = 'y'
                                this.group.add(e);
                            }
                        }
                        if(Math.abs(point.x) > 145) {
                            if(point.z > minZ && point.z < maxZ) {
                                this.test = 'yz'
                                this.group.add(e);
                            }
                        }
                    }

                    // const diff = e.matrix.elements[12] - target.matrix.elements[12];
                    // if(Math.abs(diff) < 5) {
                    //     this.group.add(e);
                    // }
                }
            }

            const direction = this.camera.position.z < 0 ? 1 : -1;
            if(this.test === 'x') {
                this.group.rotation.x = this.vecrtor.y * 0.02 * direction;
                this.group.rotation.y = this.vecrtor.x * 0.02 * direction;
            } else if(this.test === 'y') {
                this.group.rotation.x = this.vecrtor.y * 0.02 * direction;
                this.group.rotation.y = this.vecrtor.x * 0.02 * direction;
            } else if(this.test === 'xz') {
                this.group.rotation.z = this.vecrtor.x * 0.02 * direction;
            } else if(this.test === 'yz') {
                this.group.rotation.z = this.vecrtor.y * 0.02 * direction;
            }
        }

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

        if(Math.abs(moveX) > 30 && this.vecrtor.y === 0) {
            this.vecrtor = { x: moveX, y: 0, z: 0 }
            return;
        }

        if(Math.abs(moveY) > 30 && this.vecrtor.x === 0) {
            this.vecrtor = { x: 0, y: moveY, z: 0 }
            return;
        }
    }

    mouseUp() {
        document.removeEventListener('mousemove', this.mouseMoveCallback, false);

        this.click.start.x = 0;
        this.click.start.y = 0;
        this.click.current.x = 0;
        this.click.current.y = 0;

        if (this.test === 'x' &&  this.vecrtor.x !== 0) {
            let direction = this.vecrtor.x < 0 ? 1 : -1;
            direction *= this.camera.position.z < 0 ? -1 : 1;
            this.group.rotation.y = Math.PI / 2 * direction;
            console.log('test1')

        }

        if( this.test === 'y' && this.vecrtor.y !== 0) {
            let direction = this.vecrtor.y < 0 ? 1 : -1;
            direction *= this.camera.position.z < 0 ? -1 : 1;
            this.group.rotation.x = Math.PI / 2 * direction;
            console.log('test2')
        }

        if(this.test === 'xz' && this.vecrtor.x !== 0) {
            let direction = this.vecrtor.x < 0 ? 1 : -1;
            this.group.rotation.z = Math.PI / 2 * direction;
            console.log('test3')
        }

        if(this.test === 'yz' && this.vecrtor.y !== 0) {
            let direction = this.vecrtor.y < 0 ? 1 : -1;
            direction *= this.camera.position.z < 0 ? -1 : 1;
            this.group.rotation.z = Math.PI / 2 * direction;
            console.log('test4')

        }

        this.test = ''

        this.renderer.render(this.scene, this.camera);

        for(const e of this.meshList) {
            e.matrixAutoUpdate = false;
            e.matrix.fromArray(e.matrixWorld.elements);
            this.scene.add(e);
        }

        // console.log(this.camera.position)
        // console.log(this.targetGroup)

        this.scene.remove(this.group);
        this.vecrtor = { x: 0, y: 0, z: 0 }

        this.renderer.render(this.scene, this.camera);
    }
}
