var env         = require('minimist')(process.argv.slice(2)),
	gulp        = require('gulp'),
	plumber     = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	stylus      = require('gulp-stylus'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	jeet        = require('jeet'),
	rupture     = require('rupture'),
	koutoSwiss  = require('kouto-swiss'),
	prefixer    = require('autoprefixer-stylus'),
	imagemin    = require('gulp-imagemin'),
	cp          = require('child_process');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

/**
 * 
 * @param {*} done 
 */
function jekyllSpawn(done) {
	cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'})
	.on('close', done);
}
/**
 * Build the Jekyll Site
 */
function jekyllBuild(done) {
	console.log('fuck')
	browserSync.notify(messages.jekyllBuild);
	jekyllSpawn(done);
}
gulp.task('jekyll-build', jekyllBuild);

/**
 * Rebuild Jekyll & do page reload
 */
function browserSyncReload(done) {
	browserSync.reload();
	done();
}
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', browserSyncReload));

/**
 * Wait for jekyll-build, then launch the Server
 */
function browserSyncTask(done) {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
	done();
}
gulp.task('browser-sync', gulp.series('jekyll-build', browserSyncTask));

/**
 * Stylus task
 */
function stylusTask(done) {
	gulp.src('src/styl/main.styl')
		.pipe(plumber())
		.pipe(stylus({
			use:[koutoSwiss(), prefixer(), jeet(), rupture()],
			compress: true
		}))
		.pipe(gulp.dest('_site/assets/css/'))
//		.pipe(browserSync.reload({stream:true}))
		.pipe(gulp.dest('assets/css'));
	done();
}
gulp.task('stylus', stylusTask);

/**
 * Javascript Task
 */
function js(done) {
	gulp.src((env.p) ? 'src/js/**/*.js' : ['src/js/**/*.js', '!src/js/analytics.js'])
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'));
	done();
}
gulp.task('js', js);


/**
 * Imagemin Task
 */
function imagemin(done) {
	gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'));
	done();
}
gulp.task('imagemin', imagemin);

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
	gulp.watch('src/styl/**/*.styl', stylusTask);
	gulp.watch('src/js/**/*.js', js);
	gulp.watch('src/img/**/*.{jpg,png,gif}', imagemin);
	gulp.watch(['**/*.html', '!_site/**/*', 'index.html', '_includes/*.html', '_layouts/*.html', '_posts/**/*'], jekyllSpawn);
	gulp.watch('_site/**/*', browserSyncReload);
	
});

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series('js', 'stylus', 'browser-sync', 'watch'));
