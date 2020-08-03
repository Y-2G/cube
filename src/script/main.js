import {MeshList} from './mesh-list.js';
import {MeshManager} from './mesh-manager.js';

let mode = 'controle';
let clickX = 0;
let clickY = 0;
let moveX = 0;
let moveY = 0;

const canvas = document.querySelector('#canvas');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const group = new THREE.Group();
const test = new THREE.Group();
const meshManager = new MeshManager();

mouse.x = -1;
mouse.y = -1;

const init = () => {
    document.querySelector('#button').addEventListener('click', () => {
        mode = mode === 'controle' ? 'view' : 'controle';
    });

    // レンダラーを作成する
    const renderer = createRenderer();

    // シーンを作成する
    const scene = createScene();

    // カメラを作成する
    const camera = createCamera();

    // 立方体を作成する
    const box = createBox();
    
    // ライトを作成する
    const directionallight = createDirectionalLight();
    const ambientLight = createAmbientLight();

    // シーンに追加する
    scene.add(box);
    scene.add(test);
    scene.add(directionallight);
    scene.add(ambientLight);

    // TODO: スマホ用イベントを追加する
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mouseup', mouseUp);
   
    tick();

    // 毎フレーム時に実行されるループイベント
    function tick() {
        requestAnimationFrame(tick);

        // マウスの位置に応じてオブジェクトを回転
        // イージングの公式を用いて滑らかにする
        if(mode === 'controle') {

            box.rotation.x = 0;
            box.rotation.y = 0;

            // レイキャストを作成する
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if(intersects.length > 0) {
                const list = meshManager.getMeshGroup(intersects[0].object);

                const targetGroup = [];
                let direction = '';
                let distance = { x: 0, y: 0 };

                if(Math.abs(moveX - clickX) > 50) {
                    direction = 'horizontal';
                    distance.x = moveX < clickX ? Math.PI / 2 : Math.PI / 2 * -1; 
                }

                if(Math.abs(moveY - clickY) > 50) {
                    direction = 'vertical';
                    distance.y = moveY < clickY ? Math.PI / 2 : Math.PI / 2 * -1; 
                }

                for(const item of list) {
                    if(item.name !== direction) continue;
                    item.list.forEach(e => targetGroup.push(e));
                    item.list.forEach(e => test.add(e));

                    if(direction === 'horizontal') {
                        test.rotation.x = box.rotation.x;
                        test.rotation.y = (moveX - clickX) * 0.02;
                    }

                    if(direction === 'vertical') {
                        test.rotation.x = (moveY - clickY) * 0.02;
                        test.rotation.y = box.rotation.y;
                    }
                }
                console.log(test)

                renderer.render(scene, camera);

                for(const item of targetGroup) {
                    if(direction === 'horizontal') {
                        item.rotation.x += Math.PI / 2;
                    }

                    if(direction === 'vertical') {
                        item.rotation.y += Math.PI / 2;;
                    }
                    group.add(item);
                }

                return;
            }
        } else {
            box.rotation.x = (moveY - clickY) * 0.02;
            box.rotation.y = (moveX - clickX) * 0.02;
        }
    
        // レンダリング
        renderer.render(scene, camera);
    }
}

const mouseDown = (event) => {
    moveX = 0;
    moveY = 0;
    clickX = event.pageX;
    clickY = event.pageY;

    canvas.addEventListener('mousemove', mouseMove, false);
}

const mouseMove = (event) => {
    if(mode === 'controle') {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    moveX = event.pageX;
    moveY = event.pageY;
}

const mouseUp = () => {
    mouse.x = -1;
    mouse.y = -1;

    canvas.removeEventListener('mousemove', mouseMove, false);
}

// レンダラーを作成する
const createRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#canvas")
    });

    // TODO: 分離する

    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);　// 設定しないとスマホでぼやける
    renderer.setSize(width, height);

    return renderer;
}

const createScene = () => {
    return new THREE.Scene();
}

// カメラを作成する
const createCamera = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const angle = 45;
    const aspect = width / height;
    const renderStartdist = 1;
    const renderStopdist = 10000;

    const camera = new THREE.PerspectiveCamera(angle, aspect, renderStartdist, renderStopdist);
    camera.position.set(0, 0, +1000);
    
    return camera;
}

// 立方体を作成する
const createBox = () => {
    const width = 100;
    const height = 100;
    const depth = 100;

    const list1 = new MeshList('vertical');
    const list2 = new MeshList('vertical');
    const list3 = new MeshList('vertical');
    const list4 = new MeshList('horizontal');
    const list5 = new MeshList('horizontal');
    const list6 = new MeshList('horizontal');
    meshManager.add(list1);
    meshManager.add(list2);
    meshManager.add(list3);
    meshManager.add(list4);
    meshManager.add(list5);
    meshManager.add(list6);

    // TODO: 簡潔にする
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            for(let k = 0; k < 3; k++) {
                // 立方体を作成
                const geometry = new THREE.BoxGeometry(width, height, depth);

                // const materials = [
                //     new THREE.MeshStandardMaterial({color: 0x00ff00}),
                //     new THREE.MeshStandardMaterial({color: 0x00ff00}),
                //     new THREE.MeshStandardMaterial({color: 0x0000ff}),
                //     new THREE.MeshStandardMaterial({color: 0x0000ff}),
                //     new THREE.MeshStandardMaterial({color: 0xff0000}),
                //     new THREE.MeshStandardMaterial({color: 0xff0000})
                // ];

                const loader = new THREE.TextureLoader();

                // マテリアルにテクスチャーを設定
                const material = [
                    new THREE.MeshStandardMaterial({map: loader.load('../img/white.jpg')}),
                    new THREE.MeshStandardMaterial({map: loader.load('../img/yellow.jpg')}),
                    new THREE.MeshStandardMaterial({map: loader.load('../img/red.jpg')}),
                    new THREE.MeshStandardMaterial({map: loader.load('../img/green.jpg')}),
                    new THREE.MeshStandardMaterial({map: loader.load('../img/blue.jpg')}),
                    new THREE.MeshStandardMaterial({map: loader.load('../img/orange.jpg')})
                ];
              
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);

                if(i === 0) {
                    mesh.position.z = width * - 1 ;
                } 

                if(i === 1){
                    mesh.position.z = 0;
                } 

                if(i === 2){
                    mesh.position.z = width;
                }

                if(j === 0) {
                    mesh.position.y = height * -1;
                    list4.add(mesh);
                }
                
                if(j === 1){
                    mesh.position.y = 0;
                    list5.add(mesh);
                }
                
                if(j === 2){
                    mesh.position.y = height;
                    list6.add(mesh);
                }

                if(k === 0) {
                    mesh.position.x = depth * - 1;
                    list1.add(mesh);
                } 

                if(k === 1){
                    mesh.position.x = 0;
                    list2.add(mesh);
                }
                
                if(k === 2){
                    mesh.position.x = depth;
                    list3.add(mesh);
                }
            }
        }
    }

    return group;
}

// 平行光源を作成する
const createDirectionalLight = () => {
    const color = 0xffffff;
    const light = new THREE.DirectionalLight(color);

    // TODO: 分離する

    // 光の強さを2倍にする
    light.intensity = 2;

    // ライトの位置を変更
    light.position.set(1, 1, 1);

    return light;
}

// 環境光源を作成する
const createAmbientLight = () => {
    const color = 0xffffff;
    const light = new THREE.AmbientLight(color);

    // TODO: 分離する

    // 光の強さを2倍にする
    light.intensity = 0.5;

    // ライトの位置を変更
    light.position.set(1, 1, 1);

    return light;
}

window.addEventListener("DOMContentLoaded", init);


// window.addEventListener('resize', onResize);
// function onResize() {
//   // サイズを取得
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   // レンダラーのサイズを調整する
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(width, height);

//   // カメラのアスペクト比を正す
//   camera.aspect = width / height;
//   camera.updateProjectionMatrix();
// }
