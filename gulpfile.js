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
 * DEFAULT
*/
gulp.task('js', function() {
  gulp.src('assets/src/js/app.js')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
  gulp.src('assets/src/js/admin/admin.js')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});
gulp.task('css', function() {
  gulp.src('assets/src/css/style.css')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
    .pipe(livereload());
});

/*
 * PROD
*/
gulp.task('js-prod', function() {
  gulp.src('assets/src/js/app.js')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
});
gulp.task('css-prod', function() {
  gulp.src('assets/src/css/style.css')
    .pipe(duo())
    .pipe(gulp.dest('assets/public'))
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
