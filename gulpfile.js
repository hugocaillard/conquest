var map          = require('map-stream');
var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var uglify       = require('gulp-uglify');
var minifyCSS    = require('gulp-minify-css');
var Duo          = require('duo');
var livereload   = require('gulp-livereload');

/*
 * Watch
*/
gulp.task('watch', function() {
  gulp.watch(__dirname+'/assets/src/js/**/*.js', ['js']);
  gulp.watch(__dirname+'/assets/src/css/**/*.css', ['css']);
});

var jsFiles  = ['assets/src/js/app.js', 'assets/src/js/admin/admin.js', 'assets/src/js/mobile/mobile.js'];
var cssFiles = ['assets/src/css/style.css', 'assets/src/css/mobile.css'];

/*
 * DEFAULT
*/
gulp.task('js', function() {
  gulp.src(jsFiles)
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});
gulp.task('css', function() {
  gulp.src(cssFiles)
    .pipe(duo())
    .pipe(autoprefixer())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});

/*
 * PROD
*/
gulp.task('js-prod', function() {
  gulp.src(jsFiles)
    .pipe(duoProd())
    .pipe(uglify())
    .pipe(gulp.dest('assets/public'));
});
gulp.task('css-prod', function() {
  gulp.src(cssFiles)
    .pipe(duoProd())
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest('assets/public'));
});


/*
 * Default
*/
gulp.task('default', ['js', 'css', 'watch']);

/*
 * Prod (temporary)
*/
gulp.task('prod', ['js-prod', 'css-prod']);

/*
 * Duo
*/
function duo() {
  return map(function (file, fn) {
    Duo(process.cwd())
      .development(true)
      .entry(file.path)
      .run(function (err, src) {
        if (err) return fn(err);
        file.contents = new Buffer(src);
        fn(null, file);
      });
  });
};
function duoProd() {
  return map(function (file, fn) {
    Duo(process.cwd())
      .cache(false)
      .entry(file.path)
      .run(function (err, src) {
        if (err) return fn(err);
        file.contents = new Buffer(src);
        fn(null, file);
      });
  });
};
