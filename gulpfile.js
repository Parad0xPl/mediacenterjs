var gulp = require('gulp'),
    mbf = require('main-bower-files'),
    bower = require('gulp-bower');

gulp.task('bower', function () {
  return bower();
});

gulp.task('mbf', ['bower'], function () {
  return gulp.src(mbf())
    .pipe(gulp.dest('public/lib'));
});

gulp.task('jslibs', function () {
  return gulp.src(mbf())
    .pipe(gulp.dest('public/lib'));
});

gulp.task('default', ['mbf'], function() {
});
