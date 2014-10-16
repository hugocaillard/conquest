var map = require('map-stream');
var gulp = require('gulp');
var Duo = require('duo');
var livereload = require('gulp-livereload');

/*
 * Watch
*/
gulp.task('watch', function() {
  gulp.watch(__dirname+'/assets/src/js/**/*.js', ['js']);
  gulp.watch(__dirname+'/assets/src/css/**/*.css', ['css']);
});

/*
 * Scripts
*/
gulp.task('js', function() {
  gulp.src('assets/src/js/app.js')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});

/*
 * Styles
*/
gulp.task('css', function() {
  gulp.src('assets/src/css/style.css')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});

/*
 * Default
*/
gulp.task('default', ['js', 'css', 'watch']);

/*
 * Duo with source-map
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
