var gulp = require('gulp');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var tap = require('gulp-tap');

var frontMatter = require('gulp-front-matter');
var markdown = require('gulp-markdown');
var layout = require('gulp-layout');
var codeMirror = require('codemirror-highlight');

var eslint = require('gulp-eslint');

var marked = require('marked');
var moment = require('moment');

var browserSync = require('browser-sync').create();

var partsFromPath = function partsFromPath(path) {
  var match = /content[\\\/](.*)[\\\/]index.md/.exec(path);

  if (match) {
    return match[1].split(/[\\\/]/);
  }

  return '';
};

var getURL = function getURL(file) {
  var path = file.split('content')[1];

  path = path.replace(/\.md$/, '.html');
  path = path.replace(/index\.html$/, '');
  path = path.replace(/\\/g, '/');

  return path;
};

marked.setOptions({
  smartypants: true
});

codeMirror.loadMode('css');
codeMirror.loadMode('php');
codeMirror.loadMode('xml');
codeMirror.loadMode('clike');
codeMirror.loadMode('javascript');
codeMirror.loadMode('ruby');
codeMirror.loadMode('python');

// Compile CSS
gulp.task('styles', function styles() {
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
gulp.task('html', function html() {
  var files = {};

  gulp.src('content/**/*.html')
    .pipe(gulp.dest('dist'));

  return gulp.src('content/**/*.md')
    .pipe(frontMatter({ remove: true }))
    .pipe(tap(function summarize(file) {
      var parts = partsFromPath(file.path);

      file.frontMatter.url = getURL(file.path);

      if (!parts) {
        return;
      } else if (parts.length === 1) {
        files[parts[0]] = file.frontMatter;

        file.frontMatter.category = file.frontMatter.category || parts[0];
      } else {
        if (!files[parts[0]].posts) {
          files[parts[0]].posts = [];
        }

        files[parts[0]].posts.push({
          name: parts[1],
          data: file.frontMatter
        });

        file.frontMatter.category = file.frontMatter.category || parts[0];
      }
    }))
    .pipe(markdown({
      smartypants: true,
      highlight: function highlightCode(code, lang, callback) {
        if (!lang) {
          callback(null, code);
        }

        callback(null, codeMirror.highlight(code, { mode: lang, tabSize: 2 }));
      }
    }))
    .pipe(layout(function prepareData(file) {
      var data = file.frontMatter;

      data.partials = {
        'default': 'default',
        'footer': 'footer',
        'head': 'head',
        'header': 'header',
        'post': 'post'
      };
      data.marked = marked;
      data.moment = moment;
      data.files = files;
      data.sitename = 'https://maskedcoder.github.io';

      return data;
    }))
    .pipe(gulp.dest('dist'));
});

// Lint JS
gulp.task('scripts', function scripts() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.stream());
});

// Copy root-level files (for icons and random stuff like that)
gulp.task('copy', function copy() {
  return gulp.src(['app/*', '!Thumbs.db'])
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function images() {
  return gulp.src(['content/images/**/*', '!Thumbs.db'])
    .pipe(gulp.dest('dist/images'));
});

// For reloading BrowserSync after image updates
gulp.task('images-watch', ['images'], function images(done) {
  browserSync.reload();
  done();
});

// For reloading BrowserSync after HTML updates
gulp.task('html-watch', ['html'], function html(done) {
  browserSync.reload();
  done();
});

// Start BrowserSync server
gulp.task('serve', ['default'], function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/*.js', ['scripts']);
  gulp.watch('app/templates/**/*', ['html-watch']);
  gulp.watch('content/**/*.md', ['html-watch']);
  gulp.watch('content/**/*.html', ['html-watch']);
  gulp.watch('content/images/**/*', ['images-watch']);
});

// By default, just build site
gulp.task('default', ['styles', 'images', 'html', 'scripts', 'copy']);
