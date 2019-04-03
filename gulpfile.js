"use strict";
/** @type {*} */
const Gulp = require('gulp');
// const GulpBabel = require('gulp-babel');
// const GulpAutoprefixer = require('gulp-autoprefixer');
const GulpBrowserify = require('gulp-browserify');
const GulpChanged = require('gulp-changed');
// const GulpLessChanged = require('gulp-less-changed');
const GulpDebug = require('gulp-debug');
/** @type {*} */
// const GulpExec = require('gulp-exec');
const GulpLess = require('gulp-less');
/** @type {*} */
// const GulpNotify = require('gulp-notify');
const GulpPlumber = require('gulp-plumber');
/** @type {*} */
const GulpSourcemaps = require('gulp-sourcemaps');
// const LessPluginAutoprefix = require('less-plugin-autoprefix');
// let autoprefix = new LessPluginAutoprefix({browsers: ['last 2 versions']});
/**
 *
 * @type {{dist_js: string, src_js: string, dist_css: string, src_css: string}}
 */
let paths = {
	src_js: "./private/fa/js",
	dist_js: "./public/fa/js",
	src_css: './private/fa/css',
	dist_css: './public/fa/css',
	// build: './build',
};
// const reporterOptions = {
// 	err: true, // default = true, false means don't write err
// 	stderr: true, // default = true, false means don't write stderr
// 	stdout: true // default = true, false means don't write stdout
// };
/**
 *
 */
Gulp.task('default', function () {
	Gulp.watch(`${paths.src_css}/**/*.less`, Gulp["series"]([
		"_fa_css",
	]));
	Gulp.watch(`${paths.src_js}/**/*.js`, Gulp["series"]([
		"_fa_js",
	]));
});
/**/
Gulp.task('_fa_css', function () {
	return Gulp.src(`${paths.src_css}/**/*.less`)
		.pipe(GulpChanged(paths.dist_css, {extension: ".css"}))
		.pipe(GulpPlumber())
		// .pipe(GulpLessChanged())
		.pipe(GulpDebug())
		.pipe(GulpSourcemaps.init())
		.pipe(GulpLess({
			// plugins: [autoprefix]
		}))
		// .on('error', GulpNotify.onError(e => ({
		// 		title: '_fa_css',
		// 		message: e.message
		// 	})
		// ))
		.pipe(GulpSourcemaps.write())
		.pipe(Gulp.dest(paths.dist_css))
	// .pipe(browserSync.stream())
});
/**/
Gulp.task("_fa_js", function () {
	return Gulp.src(`${paths.src_js}/**/*.js`)
		.pipe(GulpChanged(paths.dist_js,{extension: ".js"}))
		.pipe(GulpPlumber())
		.pipe(GulpDebug())
		.pipe(GulpBrowserify({debug: true}))
		.pipe(Gulp.dest(paths.dist_js))
	// .pipe(GulpExec.reporter(reporterOptions))
});
