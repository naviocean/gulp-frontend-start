"use strict";
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    jshint     = require('gulp-jshint'),
    sass       = require('gulp-sass'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    less       = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),

    input  = {
      'html': 'sources/*.html',
      'sass': 'sources/scss/**/*.scss',
      'less': 'sources/less/**/*.less',
      'js': 'sources/js/**/*.js',
      'vendorjs': 'public/assets/js/vendor/**/*.js'
    },

    output = {
      'html': 'public',
      'css': 'public/assets/css',
      'js': 'public/assets/js'
    },
    tinylr; //task name of live-reload

/* run the watch task when gulp is called without arguments */
gulp.task('default', ['express','livereload','watch'], function() {

});

/* run javascript through jshint */
gulp.task('jshint', function() {
  return gulp.src(input.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

/* compile scss files */
gulp.task('build-scss', function() {
  return gulp.src(input.sass)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gutil.env.type === 'production' ? minifycss() : gutil.noop())
    .pipe(gutil.env.type === 'production' ? rename({suffix: '.min'}) : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.css)); // write min file
});

/* compile less files */
gulp.task('build-less', function() {
  return gulp.src(input.less)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(gutil.env.type === 'production' ? minifycss() : gutil.noop())
    .pipe(gutil.env.type === 'production' ? rename({suffix: '.min'}) : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.css));
  
});

/* concat javascript files, minify if --type production */
gulp.task('build-js', function() {
  return gulp.src(input.js)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    //only uglify if gulp is ran with '--type production'
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop()) 
    .pipe(gutil.env.type === 'production' ? rename({suffix: '.min'}) : gutil.noop()) 
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.js));
});

/* live-reload */
gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
  tinylr.listen(35729);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);

  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')({port: 35729}));
  app.use(express.static(output.html));
  app.listen(4000, '0.0.0.0');
});

/* Watch these files for changes and run the task on update */
gulp.task('watch', function() {
  gulp.watch(input.js, ['jshint', 'build-js']);
  gulp.watch(input.sass, ['build-scss']);
  gulp.watch(input.less, ['build-less']);
  gulp.watch(output.html+'/*.html',notifyLiveReload)
  gulp.watch(output.css+'/*.css',notifyLiveReload);
  gulp.watch(output.js+'/*.js',notifyLiveReload);
});
