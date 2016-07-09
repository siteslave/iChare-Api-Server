var gulp = require('gulp'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', () => {
  gulp.watch('./src/js/**/*.js', ['babel']);
  gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['babel', 'sass', 'watch']);