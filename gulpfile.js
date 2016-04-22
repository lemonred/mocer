'use strict';

var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var useref = require('gulp-useref');

gulp.task('default', ['bundle', 'watch']);

gulp.task('bundle:js', function () {
  return browserify('./assets/js/app.js')
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

gulp.task('bundle', ['bundle:js', 'bundle:css'], function () {
  return gulp.src('./template.html')
    .pipe(useref({
      searchPath: ['.']
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch('./assets/js/app.js', ['bundle']);
  gulp.watch('./assets/sass/*.scss', ['bundle']);
});
