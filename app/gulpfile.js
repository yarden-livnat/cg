/**
 * Created by yarden on 5/25/16.
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Compile and automatically prefix stylesheets
gulp.task('sass', function () {
  return gulp.src([
    'assets/styles/**/*.scss', '!assets/styles/**/_*.scss'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('watch', ['sass'], function () {
  gulp.watch('assets/styles/**/*.scss', ['sass'])
});

gulp.task('default', ['sass']);