'use strict';

var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

gulp.task('default', ['bundle:js', 'bundle:css', 'watch']);

gulp.task('bundle:js', function () {
  browserify('./assets/js/app.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(fs.createWriteStream('./assets/js/mocer.app.js'));
});

gulp.task('bundle:css', function () {
  return gulp.src('./assets/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('watch', function () {
  gulp.watch('./assets/app.js', ['bundle:js']);
  gulp.watch('./assets/app.scss', ['bundle:css']);
});
