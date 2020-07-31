const { src, dest, watch } = require("gulp");
const sass = require('gulp-sass');

// コンパイル対象のscssファイル
const conpileTarget = {
    scss: './src/scss/*.scss'
}

// コンパイル結果のパス
const publicPath = {
    css: './pub/css'
}

/**
 * Sassをコンパイルする
 */
const compileSass = () =>
    // style.scssファイルを取得
    src(`${conpileTarget.scss}`)
    // Sassのコンパイルを実行
    .pipe(
        // コンパイル後のCSSを展開
        sass({
            outputStyle: "expanded"
        })
    )
    // cssフォルダー以下に保存
    .pipe(dest(publicPath.css));

/**
 * Sassファイルを監視し、変更があったらSassを変換する
 */
const watchSassFiles = () => watch(conpileTarget.scss, compileSass);

// npx gulpというコマンドを実行した時、watchSassFilesが実行されるようにします
exports.default = watchSassFiles;