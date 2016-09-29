var gulp = require('gulp');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var frontMatter = require('gulp-front-matter');
var marked = require('gulp-markdown');
var layout = require('gulp-layout');
var pygments = require('pygmentize-bundled');

var eslint = require('gulp-eslint');

var browserSync = require('browser-sync').create();

// Compile CSS
gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe(sass({
      precision: 10
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.stream());
});

// Compile HTML
gulp.task('html', function() {
  return gulp.src('content/**/*.md')
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
      data = file.frontMatter;
      data.partials = {
        'default': 'default',
        'footer': 'footer',
        'head': 'head',
        'header': 'header',
        'post': 'post'
      };

      return data;
    }))
    .pipe(gulp.dest('dist'));
});

// Lint JS
gulp.task('scripts', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.stream());
});

// For reloading BrowserSync after HTML updates
gulp.task('html-watch', ['html'], function (done) {
  browserSync.reload();
  done();
});

// Start BrowserSync server
gulp.task('serve', ['default'], function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch("app/styles/*.scss", ['styles']);
  gulp.watch("app/scripts/*.js", ['scripts']);
  gulp.watch("app/templates/**/*.mustache", ['html-watch']);
  gulp.watch("content/**/*.md", ['html-watch']);
});

// By default, just build site
gulp.task('default', ['styles', 'html', 'scripts']);
