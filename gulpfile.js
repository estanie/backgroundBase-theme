const gulp = require('gulp');

// gulp plugins and utils
const filter = require('gulp-filter');
const gutil = require('gulp-util');
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const zip = require('gulp-zip');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-function');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const easyimport = require('postcss-easy-import');

const themeName = require('./package.json').name;

const swallowError = function SwallowError(error) {
	gutil.log(error.toString());
	gutil.beep();
	this.emit('end');
};

const nodemonServerInit = function() {
	livereload.listen(1234);
};

gulp.task('build', ['css', 'js'], function (/* cb */) {
	return nodemonServerInit();
});

gulp.task('generate', ['css', 'js']);

gulp.task('css', function() {
	const processors = [
		easyimport,
		customProperties,
		colorFunction(),
		autoprefixer({browsers: ['last 2 versions']}),
		cssnano()
	];

	// TODO(gayeon): add Sass file.
	return gulp.src('assets/scss/*.scss')
		.on('error', sass.logError)
		.pipe(sass())
		.pipe(sourcemaps.init())
		.pipe(postcss(processors))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('assets/built'))
		.pipe(livereload());
});

gulp.task('js', function() {
	var jsFilter = filter(['**/*.js'], {restore: true});

	return gulp.src('assets/js/*/js')
		.on('error', swallowError)
		.pipe(sourcemaps.init())
		.pipe(jsFilter)
		.pipe(uglify())
		.pipe(jsFilter.restore)
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('assets/built/'))
		.pipe(livereload());
});

gulp.task('watch', function() {
	gulp.watch('assets/scss/*.scss', ['css']);
	gulp.watch('assets/scss/**/*.scss', ['css']);
	gulp.watch('assets/js/*.js', ['js']);
});

gulp.task('zip', ['css', 'js'], function() {
	var targetDir = 'dist/';
	var filename = themeName + '.zip';

	return gulp.src([
		'**',
		'!node_modules',
		'!node_modules/**',
		'!dist',
		'!dist/**'
	])
		.pipe(zip(filename))
		.pipe(gulp.dest(targetDir));
});

gulp.task('default',['build'],function() {
	gulp.start('watch');
});