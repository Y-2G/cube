!function(n){var e={};function t(i){if(e[i])return e[i].exports;var s=e[i]={i:i,l:!1,exports:{}};return n[i].call(s.exports,s,s.exports,t),s.l=!0,s.exports}t.m=n,t.c=e,t.d=function(n,e,i){t.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:i})},t.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},t.t=function(n,e){if(1&e&&(n=t(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var i=Object.create(null);if(t.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var s in n)t.d(i,s,function(e){return n[e]}.bind(null,s));return i},t.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(e,"a",e),e},t.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},t.p="",t(t.s="./src/script/main.js")}({"./src/script/main.js":
/*!****************************!*\
  !*** ./src/script/main.js ***!
  \****************************/
/*! no static exports found */function(module,exports){eval("window.addEventListener('load', init);\nwindow.addEventListener('resize', init);\n\nfunction init() {\n    const main = new Main();\n    main.init();\n}\n\nclass Main {\n    constructor() {\n        this.renderer = null;\n        this.scene = null;\n        this.camera = null;\n        this.controls = null;\n        this.group = new THREE.Group();\n        this.mode = 'control';\n        this.click = new Object();\n        this.click.start = new THREE.Vector2();\n        this.click.current  = new THREE.Vector2();\n        this.meshList = new Array();\n        this.mouseMoveCallback = this.mouseMove.bind(this);\n        this.requestId = null;\n    }\n\n    init() {\n        document.querySelector('#checkbox').addEventListener('click', () => {\n            this.mode = this.mode === 'control' ? 'camera' : 'control';\n        });\n\n        // レンダラー\n        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas') });\n\n        const rendererWidth = window.innerWidth;\n        const rendererHeight = window.innerHeight;\n        this.renderer.setPixelRatio(window.devicePixelRatio);\n        this.renderer.setSize(rendererWidth, rendererHeight);\n\n        // シーン\n        this.scene = new THREE.Scene();\n\n        // カメラ\n        const angle = 45;\n        const aspect = rendererWidth / rendererHeight;\n        const renderStartdist = 1;\n        const renderStopdist = 10000;\n        this.camera = new THREE.PerspectiveCamera(angle, aspect, renderStartdist, renderStopdist);\n        this.camera.position.set(500, 500, 1000);\n        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);\n\n        // 平行光源\n        const light = new THREE.AmbientLight(0xffffff);\n        light.position.set(1, 1, 1);\n\n        // オブジェクト\n        const meshWidth  = 100;\n        const meshHeight = 100;\n        const meshDepth  = 100;\n\n        for(let i = 0; i < 27; i++) {\n            const geometry = new THREE.BoxGeometry(meshWidth, meshHeight, meshDepth);\n\n            const loader = new THREE.TextureLoader();\n\n            // マテリアルにテクスチャーを設定\n            const material = [\n                new THREE.MeshStandardMaterial({map: loader.load('../img/red.jpg')}),\n                new THREE.MeshStandardMaterial({map: loader.load('../img/orange.jpg')}),\n                new THREE.MeshStandardMaterial({map: loader.load('../img/yellow.jpg')}),\n                new THREE.MeshStandardMaterial({map: loader.load('../img/white.jpg')}),\n                new THREE.MeshStandardMaterial({map: loader.load('../img/blue.jpg')}),\n                new THREE.MeshStandardMaterial({map: loader.load('../img/green.jpg')})\n            ];\n\n            const x = (- meshWidth) + (i % 3) * meshWidth;\n            const y = (meshHeight)  - (Math.floor(i / 3) % 3) * meshHeight;\n            const z = (- meshDepth) + (Math.floor(i / 9) % 3) * meshDepth;\n\n            const mesh = new THREE.Mesh(geometry, material);\n            mesh.name = `mesh${i}`;\n            mesh.position.set(x, y, z);\n\n            this.meshList.push(mesh);\n        }\n\n        for(const e of this.meshList) {\n            this.scene.attach(e);\n        }\n\n        this.scene.attach(this.group);\n        this.scene.add(light);\n\n        this.tick();\n\n        document.addEventListener('mousedown', this.mouseDown.bind(this));\n        document.addEventListener('mouseup', this.mouseUp.bind(this));\n    }\n\n    tick() {\n        requestAnimationFrame(this.tick.bind(this));\n\n        if(this.mode === 'camera') {\n            this.controls.enableRotate = true;\n            this.renderer.render(this.scene, this.camera);\n\n            return;\n        }\n\n        this.controls.enableRotate = false;\n\n        this.renderer.render(this.scene, this.camera);\n    }\n\n    mouseDown(event) {\n        document.addEventListener('mousemove', this.mouseMoveCallback, false);\n\n        this.click.start.x = event.pageX;\n        this.click.start.y = event.pageY;\n    }\n\n    mouseMove(event) {\n        this.click.current.x = event.pageX;\n        this.click.current.y = event.pageY;\n        \n        this.createGroup();\n    }\n\n    mouseUp() {\n        document.removeEventListener('mousemove', this.mouseMoveCallback, false);\n\n        if(this.group.children.length === 9) {\n            this.decideDirection();\n            this.executeRotation();\n        } else {\n            this.resetRotation(); \n        }\n\n        this.click.start.x = 0;\n        this.click.start.y = 0;\n        this.click.current.x = 0;\n        this.click.current.y = 0;\n    }\n\n    createGroup() {\n        const mouse = new THREE.Vector2();\n        mouse.x =   (this.click.current.x / window.innerWidth ) * 2 - 1;\n        mouse.y = - (this.click.current.y / window.innerHeight) * 2 + 1;\n\n        const ray = new THREE.Raycaster();\n\n        ray.setFromCamera(mouse, this.camera);\n        let intersects = ray.intersectObjects(this.scene.children, true);\n\n        if(intersects.length === 0) return;\n\n        const object = intersects[0].object;\n        const point = intersects[0].point.clone();\n\n        // クリックした面の法線ベクトルを取得する\n        const face  = intersects[0].face.normal.clone();\n        \n        // オブジェクトに合わせて回転させる\n        // これを行わないと法線ベクトルが常に初期の方向をむいてしまう\n        face.applyQuaternion(object.quaternion);\n\n        // クリックした点から逆方向に伸びる光線を作って交差を取得する\n        ray.set(point, face.negate());\n        intersects = ray.intersectObjects(this.scene.children, true);\n\n        if(intersects.length === 0) return;\n\n        for(const e of intersects) {\n            if(this.group.children.includes(e.object) === true) continue;\n            this.group.attach(e.object)\n        }\n    }\n\n    decideDirection() {\n        const base = this.group.children[0].position;\n        \n        const checkX = [];\n        const checkY = [];\n        const checkZ = [];\n\n        for(const mesh of this.group.children) {\n            checkX.push(Math.abs(base.x - mesh.position.x) < 5);\n            checkY.push(Math.abs(base.y - mesh.position.y) < 5);\n            checkZ.push(Math.abs(base.z - mesh.position.z) < 5);\n        }\n\n        if(checkX.includes(false) === false) {\n            return this.direction = 'y';\n        }\n\n        if(checkY.includes(false) === false) {\n            return this.direction = 'x';\n        }\n\n        if(checkZ.includes(false) === false) {\n            return this.direction = 'z';\n        }\n    }\n\n    executeRotation() {\n        const moveX = this.click.current.x - this.click.start.x;\n        const moveY = this.click.current.y - this.click.start.y;\n        let adjust = 1;\n        \n        if(this.direction === 'x') {\n            adjust = moveX > 0 ? 1 : -1;\n            this.rotateX(Math.PI / 2, adjust)\n        }\n\n        if(this.direction === 'y') {\n            adjust = moveY > 0 ? 1 : -1;\n            adjust *= this.camera.position.z > 0 ? 1: -1\n            this.rotateY(Math.PI / 2, adjust);\n        }\n        \n        if(this.direction === 'z') {\n            if(Math.abs(moveX) > 50) {\n                adjust = moveX < 0 ? 1 : -1;\n                adjust *= this.camera.position.y > 0 ? 1: -1;\n            } \n\n            if(Math.abs(moveY) > 50) {\n                adjust = moveY < 0 ? 1 : -1;\n                adjust *= this.camera.position.x > 0 ? 1: -1;\n            }\n            \n            this.rotateZ(Math.PI / 2, adjust);\n        }\n    }\n\n    rotateX(angle, direction) {\n        if( Math.abs(this.group.rotation.y) >= Math.abs(angle) ) {\n            this.group.rotation.y = angle * direction;\n            this.renderer.render(this.scene, this.camera);\n            this.resetRotation(); \n            return cancelAnimationFrame(this.requestId);\n        }\n\n        this.group.rotation.y += 6 * 0.02 * direction;\n\n        this.requestId = requestAnimationFrame(this.rotateX.bind(this, angle, direction));\n    }\n\n    rotateY(angle, direction) {\n        if( Math.abs(this.group.rotation.x) >= Math.abs(angle) ) {\n            this.group.rotation.x = angle * direction;\n            this.renderer.render(this.scene, this.camera);\n            this.resetRotation(); \n            return cancelAnimationFrame( this.requestId );\n        }\n\n        this.group.rotation.x += 6 * 0.02 * direction;\n\n        this.requestId = requestAnimationFrame(this.rotateY.bind(this, angle, direction));\n    }\n\n    rotateZ(angle, direction) {\n        if( Math.abs(this.group.rotation.z) >= Math.abs(angle) ) {\n            this.group.rotation.z = angle * direction;\n            this.renderer.render(this.scene, this.camera);\n            this.resetRotation(); \n            return cancelAnimationFrame( this.requestId );\n        }\n\n        this.group.rotation.z += 6 * 0.02 * direction;\n\n        this.requestId = requestAnimationFrame(this.rotateZ.bind(this, angle, direction));\n    }\n\n    resetRotation() {\n        for(const e of this.meshList) {\n            this.scene.attach(e);\n        }\n        this.group.rotation.set(0, 0, 0);\n        this.direction = null;\n    }\n}\n\n\n//# sourceURL=webpack:///./src/script/main.js?")}});