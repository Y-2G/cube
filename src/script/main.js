
const init = () => {
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
    scene.add(directionallight);
    scene.add(ambientLight);

    tick();

    function tick() {
      requestAnimationFrame(tick);
  
      // 箱を回転させる
      box.rotation.x += 0.01;
      box.rotation.y += 0.01;
  
      // レンダリング
      renderer.render(scene, camera);
    }
  
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
    // ジオメトリを作成する
    const width = 200;
    const height = 200;
    const depth = 200;
    const geometry = new THREE.BoxGeometry(width, height, depth);

    // マテリアルを作成する
    const color = 0x0000ff;
    const material = new THREE.MeshStandardMaterial({color: color});

    return new THREE.Mesh(geometry, material);
}

// ライトを作成する
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

// ライトを作成する
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
