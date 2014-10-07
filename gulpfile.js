var gulp = require('gulp');
var livereload = require('gulp-livereload');
var exec = require('child_process').exec;

gulp.task('build-js', function (cb) {
  exec('duo assets/src/app.js > assets/public/app.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
    livereload.changed('assets/public/app.js');
  });
});

gulp.task('build-css', function (cb) {
  exec('duo assets/src/css/style.css > assets/public/style.css', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
    livereload.changed('assets/public/style.css');
  });
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('assets/src/app.js', ['build-js']);
  gulp.watch('assets/src/css/style.css', ['build-css']);
});

gulp.task('default', ['watch', 'build-js', 'build-css']);
