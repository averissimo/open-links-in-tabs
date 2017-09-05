gulp = require 'gulp'
del = require 'del'
zip  = require 'gulp-zip'

packageFiles = [
  'src/**/*',
  '_locales/**/*',
  'icons/*.png',
  'LICENSE',
  'manifest.json',
  'README'
]

manifest = require('./manifest.json')

outFile = "open-links-in-tabs-#{manifest.version}.zip"

gulp.task 'clean', ->
  del(['dist/' + outFile])

gulp.task 'package', ['clean'], ->
    gulp.src packageFiles, { base: './' }
      .pipe(zip(outFile))
      .pipe(gulp.dest('dist'))


gulp.task('default', ['package']);
