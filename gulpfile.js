"use strict";
/** @type {*} */
const Gulp = require("gulp");
const GulpBrowserify = require("gulp-browserify");
const GulpConcat = require("gulp-concat");
const GulpChanged = require("gulp-changed");
const GulpDebug = require("gulp-debug");
/** @type {*} */
// const GulpExec = require("gulp-exec");
const GulpLess = require("gulp-less");
/** @type {*} */
// const GulpNotify = require("gulp-notify");
const GulpPlumber = require("gulp-plumber");
/** @type {*} */
const GulpSourcemaps = require("gulp-sourcemaps");
// const LessPluginAutoprefix = require("less-plugin-autoprefix");
// let autoprefix = new LessPluginAutoprefix({browsers: ["last 2 versions"]});
/**
 *
 * @type {{fa_dist: string, fa_src: string, fa_build: string}}
 */
let paths = {
	fa_src: "../../node_modules/fa-nodejs/assets/src",
	fa_dist: "../../node_modules/fa-nodejs/assets/dist",
	fa_build: "../../node_modules/fa-nodejs/assets/build",
};
// const reporterOptions = {
// 	err: true, // default = true, false means don"t write err
// 	stderr: true, // default = true, false means don"t write stderr
// 	stdout: true // default = true, false means don"t write stdout
// };
/**/
Gulp.task("default", function () {
	Gulp.watch(`${paths.fa_src}/**/*.less`, Gulp["series"]([
		"_fa_css_less",
	]));
	Gulp.watch(`${paths.fa_dist}/**/*.css`, Gulp["series"]([
		"_fa_css_build",
	]));
	// Gulp.watch(`${paths.fa_src}/**/*.js`, Gulp["series"]([
	// 	"_fa_js_compile",
	// ]));
});
/**/
Gulp.task("_fa_css_less", function () {
	return Gulp.src(`${paths.fa_src}/**/*.less`)
		.pipe(GulpChanged(paths.fa_dist, {extension: ".css"}))
		.pipe(GulpPlumber())
		// .pipe(GulpLessChanged())
		.pipe(GulpDebug())
		// .pipe(GulpSourcemaps.init())
		.pipe(GulpLess({
			// plugins: [autoprefix]
		}))
		// .pipe(GulpSourcemaps.write())
		.pipe(Gulp.dest(paths.fa_dist))
	// .pipe(browserSync.stream())
});

/**/
Gulp.task("_fa_css_build", function () {
	return Gulp.src(`${paths.fa_dist}/**/*.css`)
		// .pipe(GulpChanged(paths.fa_dist, {extension: ".css"}))
		.pipe(GulpPlumber())
		.pipe(GulpDebug())
		.pipe(GulpSourcemaps.init())
		.pipe(GulpConcat("fa.css"))
		.pipe(GulpSourcemaps.write())
		.pipe(Gulp.dest(`${paths.fa_build}/css`))
	// .pipe(browserSync.stream())
});
/**/
Gulp.task("_fa_js_compile", function () {
	return Gulp.src(`${paths.fa_src}/**/*.js`)
		.pipe(GulpChanged(paths.fa_dist, {extension: ".js"}))
		.pipe(GulpPlumber())
		.pipe(GulpDebug())
		.pipe(GulpBrowserify({debug: true}))
		.pipe(Gulp.dest(paths.fa_dist))
	// .pipe(GulpExec.reporter(reporterOptions))
});
