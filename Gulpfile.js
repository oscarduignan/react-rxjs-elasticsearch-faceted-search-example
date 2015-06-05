var gulp = require('gulp');
var jade = require('gulp-jade');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var webpackDevServer = require('webpack-dev-server');

gulp.task('jade', function() {
    watch('src/jade/**/*.jade', function (file) {
        // brute force - rebuild all on change - because I just needed
        // this to work quickly and I couldn't find a incremental solution 
        // that worked for me that took into account jade deps.

        gutil.log(gutil.colors.magenta("JADE:"), file.path);

        gulp.src('src/jade/*.jade').
            pipe(jade()).
            pipe(gulp.dest('dist'));
    });
});

gulp.task('browser-sync', function() {
    browserSync.init({
        open: true,
        files: [
            'dist/*.html'
        ],
        watchOptions: {
            ignoreInitial: true
        },
        server: {
            baseDir: 'dist'
        },
        ghostMode: false
    });
});

gulp.task('webpack-dev-server', function() {
    new webpackDevServer(webpack(webpackConfig), {
        hot: true,
        stats: {
            colors: true,
            errorDetails: true,
            module: false,
            chunks: false,
            cached: false,
            cachedAssets: false
        }
    }).listen(8080, 'localhost', function (err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/')
    });
});

gulp.task('default', ['browser-sync' ,'jade', 'webpack-dev-server']);