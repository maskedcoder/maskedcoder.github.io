var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var frontMatter = require('gulp-front-matter');
var marked = require('gulp-markdown');
var layout = require('gulp-layout');
var pygments = require('pygmentize-bundled');

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

gulp.task('html', function() {
  gulp.src('content/**/*.md')
    .pipe(frontMatter())
    .pipe(marked({
      smartypants: true,
      highlight: function (code, lang, callback) {
        pygments({ lang: lang, format: 'html' }, code, function (err, result) {
          callback(err, result.toString());
        });
      }
    }))
    .pipe(layout(function (file) {
      return file.frontMatter;
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['styles', 'html']);