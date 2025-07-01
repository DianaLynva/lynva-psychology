import pkg from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import gulpBrowserSync from 'browser-sync';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import path from 'path';
import {deleteAsync} from 'del';
import ttf2woff2 from 'ttf2woff2';

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
  return src('app/images/**/*.{png,jpeg,jpg,gif,svg,ico}', {base: 'app/images'})
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

function moveImages() {
  return src('app/images/**/*.{gif,webp,svg,ico}', {base: 'app/images'})
  .pipe(dest('dist/images'))
}

async function deleteRelatedImg(imgPath) {
  const ext = path.extname(imgPath);
  const baseName = path.basename(imgPath, ext);
  const dir = path.dirname(imgPath);

  const filesToRemove = [
    path.join(dir, baseName + '.webp')
  ];

  await deleteAsync(filesToRemove, {force: true});
}
// End of optimization of images

// Start of fonts optimization
function optimizeFonts() {
  return src('app/fonts/**/*.ttf', {base: 'app/fonts'})
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}
// End of fonts optimization

function building() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/fonts/**/*.woff2'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

async function cleanDist() {
  await deleteAsync('dist');
}

function watcher() {
  const imagesWatcher = watch(['app/images/**/*.{png,jpeg,jpg,gif,svg,ico}']);
  
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/fonts/**/*.ttf'], optimizeFonts);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);

  imagesWatcher.on('change', series(resizeImages, convertToWebp));
  imagesWatcher.on('add', series(resizeImages, convertToWebp));
  imagesWatcher.on('unlink', async (imgPath) => {
    await deleteRelatedImg(imgPath);
  });
}

export const clean = series(cleanDist);
export const build = series(cleanDist, moveImages, building);
export const start = parallel(styles, scripts, browserUpdate, watcher);