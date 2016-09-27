var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

// Compile CSS
gulp.task('styles', function () {
  gulp.src('app/styles/main.scss')
    .pipe(sass({
      precision: 10
	  }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('default', ['styles']);