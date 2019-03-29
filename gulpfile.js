// const gulp = require('gulp');
// less = require('gulp-less'),
// 	minifyCss = require('gulp-minify-css'),
// 	browserSync = require('browser-sync'),
// 	autoprefixer = require('gulp-autoprefixer'),
// 	sourcemaps = require('gulp-sourcemaps'),
// 	imagemin = require('gulp-tinypng'),
// 	uglify = require('gulp-uglify'),
// 	notify = require('gulp-notify'),
// 	spritesmith = require('gulp.spritesmith'),
// 	babel = require('gulp-babel'),
// 	browserify = require('gulp-browserify'),
// 	validator = require('gulp-html'),
// 	fileinclude = require('gulp-file-include');
"use strict";
const Gulp = require('gulp');
const GulpBabel = require('gulp-babel');
const GulpBrowserify = require('gulp-browserify');
const GulpChanged = require('gulp-changed');
const GulpDebug = require('gulp-debug');
const GulpExec = require('gulp-exec');
const GulpLess = require('gulp-less');
const GulpNotify = require('gulp-notify');
const GulpPlumber = require('gulp-plumber');
const GulpSourcemaps = require('gulp-sourcemaps');
const paths = {
	beautify_src: "./beautify/src",
	beautify_dist: "./beautify/dist",
	src: './src',
	dist: './dist',
	// build: './build',
};
const reporterOptions = {
	err: true, // default = true, false means don't write err
	stderr: true, // default = true, false means don't write stderr
	stdout: true // default = true, false means don't write stdout
};
/**
 *
 */
Gulp.task('default', function () {
	Gulp.watch(`${paths.beautify_src}/*.less`, Gulp.series([
		"_beautify_css",
	]));
});
/**
 *
 */
Gulp.task('_beautify_css', () => (
	Gulp.src(`${paths.beautify_src}/*.less`)
		// .pipe(GulpPlumber())
		// .pipe(GulpChanged(paths.beautify_dist))
		.pipe(GulpDebug())
		.pipe(GulpSourcemaps.init())
		.pipe(GulpLess())
		.on('error', GulpNotify.onError(err => ({
				title: '_beautify_css',
				message: err.message
			})
		))
		.pipe(Gulp.dest(`${paths.beautify_dist}`))
	// .pipe(browserSync.stream())
));
// Gulp.task("_fa-client-browserify", function () {
// 	return Gulp.src(`${paths.src}/*.js`)
// 		.pipe(GulpPlumber())
// 		.pipe(GulpChanged(paths.dist))
// 		.pipe(GulpDebug())
// 		.pipe(GulpBrowserify({
// 			debug: true,
// 		}))
// 		.pipe(Gulp.dest(`${paths.dist}`))
// 		/*command line*/
// 		.pipe(GulpExec.reporter(reporterOptions))
// });
/**
 *
 */
// gulp.task('javascript', () => (
// 	gulp.src(`${paths.src}scripts/scripts.js`)
// 		.pipe(plumber())
// 		.pipe(browserSync.stream())
// ));
