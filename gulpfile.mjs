import pkg from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import gulpBrowserSync from 'browser-sync';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import {deleteAsync} from 'del';

const {src, dest, series, watch, parallel} = pkg;
const scss = gulpSass(sass);
const browserSync = gulpBrowserSync.create();


function browserUpdate() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  })
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: 'autoplace'
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}


// Start of optimization of images
function resizeImages() {
  // return src('app/images/**/*.*')
  return src('app/images/**/*.*', {base: 'app/images'})
  .pipe(imagemin([
    gifsicle({
      interlaced: true
    }),
    mozjpeg({
      quality: 75,
      progressive: true
    }),
    optipng({
      optimizationLevel: 5
    }),
    svgo({
      plugins: [{
          name: 'removeViewBox',
          active: true
        },
        {
          name: 'cleanupIDs',
          active: false
        }
      ]
    })
  ]))
  .pipe(dest('app/images'))
}

function convertToWebp() {
  return src('app/images/**/*.{png,jpeg,jpg}', {base: 'app/images'})
  .pipe(webp())
  .pipe(dest('app/images'))
}

async function deleteJpgAndGif() {
  await deleteAsync('app/images/**/*.{png,jpeg,jpg}')
}

function moveImages() {
  return src('app/images/**/*.*', {base: 'app/images'})
  .pipe(dest('dist/images'))
}
// End of optimization of images

function building() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

async function cleanDist() {
  await deleteAsync('dist');
}

function watcher() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload); 
}


export const clean = series(cleanDist);
export const img = series(resizeImages, convertToWebp, deleteJpgAndGif, moveImages);

export const build = series(cleanDist, moveImages, building);
export const start = parallel(styles, scripts, browserUpdate, watcher);