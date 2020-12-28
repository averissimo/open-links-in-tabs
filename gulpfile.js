const gulp = require('gulp')
const del = require('del')
const zip  = require('gulp-zip')

const packageFiles = [
  'src/**/*',
  '_locales/**/*',
  'icons/*.png',
  'options.html',
  'LICENSE',
  'manifest.json',
  'README.md'
]

const manifest = require('./manifest.json')

const outFile = `open-links-in-tabs-${manifest.version}.zip`

function clean(cb) {
  del(['dist/' + outFile]);
  cb();
}

function package(cb) {
  gulp.src(packageFiles, { base: './' })
    .pipe(zip(outFile))
    .pipe(gulp.dest('dist'));
  cb();
}

function defaultTask(cb) {
  gulp.series(package);
}

exports.package = gulp.series(clean, package)
exports.clean = clean
exports.default = exports.package
