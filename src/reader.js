import { FILTERS, FILTER_LABELS, applyAppearance } from './appearance.js';
import { MODES, readingPreferences, storePreferences, captureTextPosition, restoreTextPosition, applyTypography } from './preferences.js';
export function createReader(global, engine) {
    'use strict';

    var active = null;

    function read(key, fallback) {
        try {
            var value = global.localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    }

    function save(key, value) {
        try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private browsing */ }
    }

    var iconPaths = {
        keyboard: ['M3 6h18v12H3Z','M6 10h1m3 0h1m3 0h1m3 0h1M6 14h2m2 0h7'],
        palette: ['M20 12a8 8 0 1 0-8 8h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h7Z','M7 10h.1M10 6h.1M15 7h.1'],
        fullscreen: ['M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5'],
        tools: ['M4 6h16M4 12h16M4 18h16', 'M8 3v6m8 0v6m-8 0v6'],
        rotate: ['M4 8a8 8 0 0 1 14-3l2 2', 'M20 3v4h-4', 'M20 16a8 8 0 0 1-14 3l-2-2', 'M4 21v-4h4'],
        bookmarks: ['M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z', 'M9 8h6'],
        sound: ['M11 5 6 9H3v6h3l5 4V5Z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13'],
        muted: ['M11 5 6 9H3v6h3l5 4V5Z', 'm16 9 5 6', 'm21 9-5 6'],
        download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
        close: ['m6 6 12 12', 'M18 6 6 18'],
        open: ['M5 12h14', 'm12 5 7 7-7 7'],
        bookmark: ['M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z'],
        bookmarkOff: ['M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z', 'M9 12h6'],
        page: ['M6 3.75h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3.75Z', 'M14 4v4h4', 'M9 13h6', 'M9 16h6']
    };

    function makeIcon(name) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.classList.add('library-reader-icon');
        (iconPaths[name] || []).forEach(function (d) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            svg.appendChild(path);
        });
        return svg;
    }

    function button(label, className, iconName, visibleText) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = className || 'library-reader-button';
        el.setAttribute('aria-label', label);
        el.title = label;
        if (iconName) el.appendChild(makeIcon(iconName));
        if (visibleText) {
            var text = document.createElement('span');
            text.textContent = visibleText;
            el.appendChild(text);
        } else if (!iconName) {
            el.textContent = label;
        }
        return el;
    }

    function close(immediate) {
        if (!active) return;
        var state = active;
        active = null;
        state.rejectMode?.(new DOMException('Reader closed','AbortError'));
        state.resizeObserver?.disconnect();
        document.removeEventListener('keydown', state.onKey);
        if (state.thumbObserver) state.thumbObserver.disconnect();
        state.thumbQueue = [];
        if (state.thumbTasks) state.thumbTasks.forEach(function (task) { task.cancel(); });
        if(state.book?.getText){save(state.locationKey,captureTextPosition(state.book.container));}
        state.tools?.destroy();
        if(state.orientationLocked)global.screen.orientation?.unlock?.();
        if(document.fullscreenElement === state.shell)document.exitFullscreen?.().catch(()=>{});
        if (state.book) state.book.destroy();
        if (state.options.onClose) state.options.onClose();
        if (state.soundFile) {
            state.soundFile.pause();
            state.soundFile.currentTime = 0;
        }
        if (immediate || (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            state.overlay.remove();
        } else {
            state.overlay.classList.add('is-closing');
            state.overlay.setAttribute('aria-hidden', 'true');
            var removeOverlay = function () {
                if (state.overlay.parentNode) state.overlay.remove();
            };
            state.overlay.addEventListener('transitionend', function onTransition(event) {
                if (event.target !== state.overlay || event.propertyName !== 'opacity') return;
                state.overlay.removeEventListener('transitionend', onTransition);
                removeOverlay();
            });
            global.setTimeout(removeOverlay, 240);
        }
        if (!state.inline) document.body.style.overflow = state.previousOverflow;
        if (!state.inline && state.trigger && document.contains(state.trigger)) state.trigger.focus();
    }

    function open(options) {
        var words = {"Pembaca e-book: ":"E-book reader: ","Tampilkan penanda dan pratinjau halaman":"Show bookmarks and page previews","Aktifkan suara halaman":"Enable page sound","Matikan suara halaman":"Disable page sound","Unduh ":"Download ","Tutup pembaca":"Close reader","Penanda halaman":"Bookmarks","Pratinjau halaman":"Page previews","Posisi halaman":"Reading position","Halaman ":"Page ","Lanjut atau buka halaman":"Next or go to page","Tandai halaman ini":"Bookmark this page","Belum ada halaman yang ditandai.":"No bookmarks yet.","Buka halaman ":"Go to page ","Hapus penanda halaman ini":"Remove this bookmark","Gunakan nomor halaman untuk dokumen yang sangat panjang.":"Use page numbers for very long documents.","Pratinjau halaman ":"Preview page ","Buka PDF":"Open PDF","Berkas PDF tidak dapat dimuat. Periksa koneksi atau coba lagi.":"The PDF could not be loaded. Check your connection or retry.","Efek buku tidak tersedia di browser ini. Anda dapat mencoba membuka PDF langsung.":"The book effect is unavailable. You can try opening the original PDF."};
        function t(label) { return options.language === "en" ? words[label] || label : label; }
        if (!engine || !options || (!options.url && !options.data)) {
            return Promise.reject(new Error('Pembaca tidak tersedia'));
        }
        close(true);

        var key = (options.storagePrefix || 'flippy:') + String(options.id || options.url || 'bytes');
        var state = {
            locationKey:key+':location',
            marksKey:key+':marks',
            notesKey:key+':notes',
            preferencesKey:key+':preferences',
            options: options,
            inline: options.presentation === 'inline',
            trigger: options.trigger || document.activeElement,
            previousOverflow: document.body.style.overflow,
            book: null,
            pages: 0,
            current: 1,
            marks: read(key + ':marks', []),
            sound: options.soundEnabled === undefined ? read((options.storagePrefix || 'flippy:') + 'sound', !(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)) : !!options.soundEnabled,
            soundFile: null,
            thumbObserver: null,
            thumbQueue: [],
            thumbRenders: 0,
            thumbRecent: [],
            thumbTasks: new Set()
        };
        if (!Array.isArray(state.marks)) state.marks = [];

        var overlay = document.createElement('div');
        overlay.className = 'library-reader-overlay is-entering';
        if (state.inline) overlay.classList.add('sela-inline');
        overlay.dataset.flippyTheme = options.theme || 'auto';
        overlay.dataset.paper = options.paperTexture&&!options.lowPower ? 'true' : 'false';
        var filters = FILTERS;
        applyAppearance(overlay,options);
        if (options.zIndex) overlay.style.zIndex = String(options.zIndex);
        overlay.setAttribute('role', state.inline ? 'region' : 'dialog');
        if (!state.inline) overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', t("Pembaca e-book: ") + (options.title || 'E-book'));
        var shell = document.createElement('div');
        shell.className = 'library-reader-shell';
        overlay.appendChild(shell);

        var header = document.createElement('header');
        header.className = 'library-reader-header';
        var title = document.createElement('h2');
        title.className = 'library-reader-title';
        title.textContent = options.title || 'E-book';
        header.appendChild(title);
        var actions = document.createElement('div');
        actions.className = 'library-reader-actions';
        var helpButton = document.createElement('button');
        helpButton.type = 'button'; helpButton.className = 'library-reader-button';
        helpButton.appendChild(makeIcon('keyboard')); helpButton.setAttribute('aria-label', options.language==='en'?'Keyboard shortcuts':'Pintasan keyboard');helpButton.title=helpButton.getAttribute('aria-label');
        var help = document.createElement('div'); help.className = 'flippy-shortcuts'; help.hidden = true;
        help.textContent = '← → / PgUp PgDn: navigate · Home / End: first / last · + / −: zoom · 0: reset zoom · F: fullscreen · B: bookmark · M: sound · ?: shortcuts · Esc: close. Ctrl/Cmd + F: book search. Ctrl + wheel / trackpad pinch: zoom. EPUB numbers refer to chapters.';
        helpButton.setAttribute('aria-expanded','false');
        function toggleHelp() { help.hidden = !help.hidden; helpButton.setAttribute('aria-expanded', String(!help.hidden)); }
        helpButton.addEventListener('click', toggleHelp);
        actions.appendChild(helpButton);
        var toolsButton=button(options.language==='en'?'Reading tools':'Alat baca',null,'tools');
        toolsButton.disabled=true;toolsButton.setAttribute('aria-expanded','false');
        actions.appendChild(toolsButton);
        var rotateButton=button(options.language==='en'?'Rotate screen':'Putar layar',null,'rotate');
        if(!global.screen?.orientation?.lock)rotateButton.disabled=true;
        actions.appendChild(rotateButton);
        state.shell=shell;
        var notice=document.createElement('p');notice.className='sela-notice';notice.setAttribute('role','status');shell.appendChild(notice);
        rotateButton.addEventListener('click',async function(){
            try {
                if(!document.fullscreenElement)await shell.requestFullscreen();
                if(active!==state)return;
                await global.screen.orientation.lock(global.matchMedia('(orientation: portrait)').matches?'landscape':'portrait');
                if(active!==state){global.screen.orientation.unlock();return;}state.orientationLocked=true;
            }catch(e){notice.textContent=options.language==='en'?'Screen rotation is unavailable here. Rotate your device manually; the layout adapts automatically.':'Rotasi layar tidak tersedia di sini. Putar perangkat secara manual; tata letak menyesuaikan otomatis.';}
        });

        var filter = document.createElement('select');
        filter.className = 'flippy-filter';
        filter.setAttribute('aria-label', 'Reading filter / Filter baca');
        Object.keys(filters).forEach(function (key) {
            var option = document.createElement('option');
            option.value = key; option.textContent = FILTER_LABELS[key][options.language==='en'?0:1];
            filter.appendChild(option);
        });
        filter.value = options.filter || 'none';
        filter.addEventListener('change', function () {
            state.setPreferences({filter:filter.value});
        });
        var filterControl=document.createElement('label');filterControl.className='sela-filter-control library-reader-button';filterControl.title=options.language==='en'?'Reading filter':'Filter baca';filterControl.appendChild(makeIcon('palette'));filterControl.appendChild(filter);actions.appendChild(filterControl);
        var fullscreenButton=button(options.language==='en'?'Fullscreen':'Layar penuh',null,'fullscreen');
        fullscreenButton.addEventListener('click',function(){state.book?.toggleFullscreen();});actions.appendChild(fullscreenButton);
        var marksButton = button(t("Tampilkan penanda dan pratinjau halaman"), null, 'bookmarks');
        marksButton.setAttribute('aria-expanded', 'false');
        var soundButton = button(t("Aktifkan suara halaman"), null, 'muted');
        var download = document.createElement('a');
        download.className = 'library-reader-button';
        var documentFormat = options.format || 'pdf';
        download.setAttribute('aria-label', t("Unduh ") + documentFormat.toUpperCase());
        download.title = t("Unduh ") + documentFormat.toUpperCase();
        download.appendChild(makeIcon('download'));
        download.href = options.url || '#';
        if (!options.url) download.hidden = true;
        download.setAttribute('download', ((options.title || 'ebook').replace(/\.(pdf|epub|cbz|djvu|djv|txt|md|html|fb2)$/i, '').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'ebook') + '.' + documentFormat);
        var closeButton = button(t("Tutup pembaca"), 'library-reader-button library-reader-close', 'close');
        actions.appendChild(marksButton);
        actions.appendChild(soundButton);
        actions.appendChild(download);
        actions.appendChild(closeButton);
        header.appendChild(actions);
        shell.appendChild(header);
        shell.appendChild(help);

        var content = document.createElement('div');
        content.className = 'library-reader-content';
        var stage = document.createElement('div');
        stage.className = 'library-reader-stage';
        var bookHost = document.createElement('div');
        bookHost.className = 'library-reader-book';
        stage.appendChild(bookHost);
        content.appendChild(stage);
        var sidebar = document.createElement('aside');
        sidebar.className = 'library-reader-sidebar';
        sidebar.hidden = true;
        var sidebarTitle = document.createElement('h3');
        sidebarTitle.textContent = t("Penanda halaman");
        var marksList = document.createElement('div');
        marksList.className = 'library-reader-marks';
        var thumbsTitle = document.createElement('h3');
        thumbsTitle.textContent = t("Pratinjau halaman");
        var thumbsList = document.createElement('div');
        thumbsList.className = 'library-reader-thumbs';
        sidebar.appendChild(sidebarTitle);
        sidebar.appendChild(marksList);
        sidebar.appendChild(thumbsTitle);
        sidebar.appendChild(thumbsList);
        content.appendChild(sidebar);
        shell.appendChild(content);
        var toolsHost=document.createElement('aside');toolsHost.className='sela-tools';toolsHost.hidden=true;content.appendChild(toolsHost);
        state.setAppearance=function(values){Object.assign(options,readingPreferences(values));filter.value=options.filter||'none';applyAppearance(overlay,options);state.savePreferences?.();};
        state.history=[];
        state.remember=function(){if(!state.book)return;state.history.push({page:state.book.currentPage(),location:state.book.getText?captureTextPosition(bookHost):null});if(state.history.length>30)state.history.shift();};
        state.navigate=function(page){state.remember();state.book.goTo(page);};
        state.back=function(){var previous=state.history.pop();if(previous){state.book.goTo(previous.page);restoreTextPosition(bookHost,previous.location);}};
        state.savePreferences=function(){var values=readingPreferences(options);if(options.persistPreferences)storePreferences(key+':preferences',values);options.onPreferences?.(values);overlay.dispatchEvent(new Event('sela:preferences'));};
        state.setPreferences=function(values){Object.assign(options,readingPreferences(values));state.setAppearance(values);if(state.book?.getText)applyTypography(bookHost,options);overlay.dataset.paper=String(!!options.paperTexture&&!options.lowPower);if(state.book?.opts){state.book.opts.maxScale=options.lowPower?1:(options.normalQuality?.maxScale||1.75);state.book.opts.maxCanvasPixels=options.lowPower?1000000:(options.normalQuality?.maxCanvasPixels||2500000);state.book.opts.duration=options.lowPower||global.matchMedia('(prefers-reduced-motion: reduce)').matches?0:(options.normalQuality?.duration??560);}state.savePreferences();};
        state.setFit=function(value){options.fit=value;state.book?.setFit?.(value);state.savePreferences();};
        state.setMode=function(mode){
            if(!MODES.includes(mode))return Promise.reject(new TypeError('Unknown reading mode'));
            if(state.switching)return Promise.reject(new Error(options.language==='en'?'Wait for the mode change.':'Tunggu perubahan mode selesai.'));
            if(state.book.getText){if(!['single','scroll'].includes(mode))return Promise.reject(new Error(options.language==='en'?'Text books support single chapter or continuous scroll.':'Buku teks mendukung satu bab atau gulir berkelanjutan.'));state.book.setReadingMode?.(mode);options.mode=mode;state.savePreferences();return Promise.resolve();}
            if(mode===options.mode)return Promise.resolve();
            var page=state.book.currentPage(),pdf=state.book.pdf,task=state.book.loadingTask;
            if(!pdf)return Promise.reject(new Error('Document is not ready'));
            toolsGeneration++;state.tools?.destroy();state.tools=null;toolsPromise=null;toolsHost.hidden=true;toolsButton.setAttribute('aria-expanded','false');
            if(state.thumbObserver)state.thumbObserver.disconnect();state.thumbTasks.forEach(function(t){t.cancel();});state.thumbQueue=[];state.thumbsBuilt=false;thumbsList.replaceChildren();
            state.book.destroy(true);options.mode=mode;state.switching=true;
            var originalLib=options.pdfjsLib;
            return new Promise(function(resolve,reject){
                state.resolveMode=function(){state.switching=false;state.resolveMode=null;state.rejectMode=null;state.savePreferences();resolve();};
                state.rejectMode=reject;
                try{state.book=options.createEngine(mode).create(bookHost,{...options,startPage:page,pdfjsLib:{getDocument:function(){return {promise:Promise.resolve(pdf),destroy:()=>task.destroy()};}},readingDirection:mode==='manga'?'rtl':'ltr',displayMode:mode==='single'?'single':'auto'});}
                catch(error){state.switching=false;options.pdfjsLib=originalLib;task?.destroy();reject(error);}
            });
        };
        var toolsPromise,toolsGeneration=0;
        function loadTools(){
            var generation=toolsGeneration;
            if(!toolsPromise)toolsPromise=import(/* webpackIgnore: true */ /* @vite-ignore */ options.toolsUrl).then(function(module){
                if(active!==state||generation!==toolsGeneration)throw new DOMException('Reader changed','AbortError');
                state.getText=function(page){return module.pageText(state.book,page);};
                state.tools=module.mountTools(state,toolsHost);return state.tools;
            }).catch(function(error){toolsPromise=null;if(active===state)notice.textContent=error.message;throw error;});
            return toolsPromise;
        }
        state.getText=function(page){return loadTools().then(function(){return state.getText(page);});};
        state.showTools=function(){sidebar.hidden=true;marksButton.setAttribute('aria-expanded','false');toolsHost.hidden=false;toolsButton.setAttribute('aria-expanded','true');return loadTools();};
        state.hideTools=function(){toolsHost.hidden=true;toolsButton.setAttribute('aria-expanded','false');toolsButton.focus();};
        toolsButton.addEventListener('click',function(){if(toolsHost.hidden)state.showTools().catch(function(){});else{toolsHost.hidden=true;toolsButton.setAttribute('aria-expanded','false');}});

        var footer = document.createElement('footer');
        footer.className = 'library-reader-footer';
        var progress = document.createElement('input');
        progress.type = 'range';
        progress.min = '1';
        progress.max = '1';
        progress.value = '1';
        progress.disabled = true;
        progress.setAttribute('aria-label', t("Posisi halaman"));
        var pageForm = document.createElement('form');
        pageForm.className = 'library-reader-page-form';
        var label = document.createElement('label');
        label.textContent = options.format === "epub" ? (options.language === "en" ? "Chapter " : "Bab ") : t("Halaman ");
        var pageInput = document.createElement('input');
        pageInput.type = 'number';
        pageInput.min = '1';
        pageInput.value = '1';
        pageInput.inputMode = 'numeric';
        pageInput.setAttribute('aria-label', options.language === 'en' ? 'Page or chapter number' : 'Nomor halaman atau bab');
        label.appendChild(pageInput);
        var total = document.createElement('span');
        total.textContent = ' / …';
        var goButton = button(t("Lanjut atau buka halaman"), null, 'open');
        goButton.type = 'submit';
        pageForm.appendChild(label);
        pageForm.appendChild(total);
        pageForm.appendChild(goButton);
        var bookmarkButton = button(t("Tandai halaman ini"), null, 'bookmark');
        bookmarkButton.setAttribute('aria-pressed', 'false');
        footer.appendChild(progress);
        footer.appendChild(pageForm);
        footer.appendChild(bookmarkButton);
        var backButton=button(options.language==='en'?'Back to previous position':'Kembali ke posisi sebelumnya',null,'open');backButton.classList.add('sela-back');backButton.addEventListener('click',state.back);footer.appendChild(backButton);
        var positionLabel=document.createElement('output');positionLabel.className='sela-position-label';footer.appendChild(positionLabel);
        var credit=document.createElement('a');credit.className='sela-credit';credit.href='https://github.com/bobbyfch/sela';credit.target='_blank';credit.rel='noopener';credit.textContent='Sela';credit.title='Sela by Bobby Fajar Christian';footer.appendChild(credit);
        shell.appendChild(footer);

        function updateMarks() {
            marksList.replaceChildren();
            var marks = state.marks.filter(function (n) { return Number.isInteger(n) && n >= 1 && (!state.pages || n <= state.pages); }).sort(function (a, b) { return a - b; });
            if (!marks.length) {
                var empty = document.createElement('p');
                empty.textContent = t("Belum ada halaman yang ditandai.");
                marksList.appendChild(empty);
            }
            marks.forEach(function (page) {
                var item = button(t("Buka halaman ") + page, 'library-reader-bookmark-item', 'page', String(page));
                item.addEventListener('click', function () {
                    if (state.book) state.navigate(page);
                    sidebar.hidden = true;
                    marksButton.setAttribute('aria-expanded', 'false');
                });
                marksList.appendChild(item);
            });
            var marked = marks.indexOf(state.current) !== -1;
            bookmarkButton.setAttribute('aria-pressed', marked ? 'true' : 'false');
            var label = marked ? t("Hapus penanda halaman ini") : t("Tandai halaman ini");
            bookmarkButton.setAttribute('aria-label', label);
            bookmarkButton.title = label;
            bookmarkButton.replaceChildren(makeIcon(marked ? 'bookmarkOff' : 'bookmark'));
        }

        state.updateMarks=updateMarks;
        function updatePage(page) {
            state.current = Math.max(1, Math.min(state.pages || 1, Number(page) || 1));
            pageInput.value = String(state.current);
            progress.value = String(state.current);
            positionLabel.textContent=state.pageLabels?.[state.current-1] || '';
            save(key + ':page', state.current);
            updateMarks();
            if (state.currentThumb) state.currentThumb.removeAttribute('aria-current');
            state.currentThumb = thumbsList.querySelector('[data-page="' + state.current + '"]');
            if (state.currentThumb) state.currentThumb.setAttribute('aria-current', 'page');
        }

        function pumpThumbs() {
            while (active === state && state.book && state.book.pdf && state.thumbRenders < 2 && state.thumbQueue.length) {
                (function (job) {
                    state.thumbRenders++;
                    state.book.pdf.getPage(job.page).then(function (pdfPage) {
                        if (active !== state) return;
                        var size = pdfPage.getViewport({ scale: 1 });
                        var viewport = pdfPage.getViewport({ scale: 90 / size.width });
                        job.canvas.width = Math.ceil(viewport.width);
                        job.canvas.height = Math.ceil(viewport.height);
                        var task = pdfPage.render({ canvasContext: job.canvas.getContext('2d'), viewport: viewport });
                        state.thumbTasks.add(task);
                        return task.promise.finally(function () { state.thumbTasks.delete(task); });
                    }).then(function () {
                        if (active !== state) return;
                        job.canvas.dataset.ready = '1';
                        state.thumbRecent.push(job.canvas);
                        if (state.thumbRecent.length > 40) {
                            var old = state.thumbRecent.shift();
                            old.width = 1;
                            old.height = 1;
                            delete old.dataset.ready;
                        }
                    }).catch(function () { /* pratinjau tidak menghalangi baca PDF */ }).then(function () {
                        state.thumbRenders--;
                        job.canvas.dataset.queued = '';
                        pumpThumbs();
                    });
                })(state.thumbQueue.shift());
            }
        }

        function queueThumb(canvas) {
            if (!state.book || !state.book.pdf || canvas.dataset.ready || canvas.dataset.queued) return;
            canvas.dataset.queued = '1';
            state.thumbQueue.push({ page: Number(canvas.parentNode.dataset.page), canvas: canvas });
            pumpThumbs();
        }

        function buildThumbs() {
            if (state.thumbsBuilt || !state.pages) return;
            state.thumbsBuilt = true;
            if (state.book.getText) {
                for(var n=1;n<=state.pages;n++) (function(number){
                    var item=button('Chapter '+number,'library-reader-mark');
                    item.addEventListener('click',function(){state.book.goTo(number);});thumbsList.appendChild(item);
                })(n);
                return;
            }
            if (state.pages > 1000) {
                var notice = document.createElement('p');
                notice.textContent = t("Gunakan nomor halaman untuk dokumen yang sangat panjang.");
                thumbsList.appendChild(notice);
                return;
            }
            var fragment = document.createDocumentFragment();
            for (var page = 1; page <= state.pages; page++) {
                (function (number) {
                    var item = button('', 'library-reader-thumb');
                    item.dataset.page = String(number);
                    item.setAttribute('aria-label', t("Pratinjau halaman ") + number);
                    item.title = t("Halaman ") + number;
                    var canvas = document.createElement('canvas');
                    canvas.setAttribute('aria-hidden', 'true');
                    var caption = document.createElement('span');
                    caption.textContent = String(number);
                    item.appendChild(canvas);
                    item.appendChild(caption);
                    item.addEventListener('click', function () {
                        state.navigate(number);
                        sidebar.hidden = true;
                        marksButton.setAttribute('aria-expanded', 'false');
                    });
                    fragment.appendChild(item);
                })(page);
            }
            thumbsList.appendChild(fragment);
            if ('IntersectionObserver' in global) {
                state.thumbObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) queueThumb(entry.target);
                    });
                }, { root: sidebar, rootMargin: '100px' });
                thumbsList.querySelectorAll('canvas').forEach(function (canvas) {
                    state.thumbObserver.observe(canvas);
                });
            } else {
                thumbsList.querySelectorAll('canvas').forEach(function (canvas, index) {
                    if (index < 12) queueThumb(canvas);
                });
            }
            updatePage(state.current);
        }

        function updateSound() {
            var label = state.sound ? t("Matikan suara halaman") : t("Aktifkan suara halaman");
            soundButton.setAttribute('aria-label', label);
            soundButton.title = label;
            soundButton.replaceChildren(makeIcon(state.sound ? 'sound' : 'muted'));
            soundButton.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
        }

        function fallback(error) {
            state.rejectMode?.(error || new Error('Could not change reading mode'));
            state.rejectMode=null;state.resolveMode=null;state.switching=false;
            if (state.thumbObserver) state.thumbObserver.disconnect();
            state.thumbQueue = [];
            if (state.book) state.book.destroy();
            state.book = null;
            if (options.onError) options.onError(error || new Error('Could not load PDF'));
            marksButton.disabled = true;
            soundButton.disabled = true;
            footer.hidden = true;
            bookHost.replaceChildren();
            var message = document.createElement('div');
            message.className = 'library-reader-fallback';
            var text = document.createElement('p');
            var unavailable = error && /missing pdf|unexpected server response|invalid pdf|failed to fetch|http response/i.test(String(error.message || error));
            text.textContent = options.format !== 'pdf' ? (options.language === 'en' ? 'This document could not be opened. Check its format or try another file.' : 'Dokumen tidak dapat dibuka. Periksa format atau coba file lain.') : unavailable
                ? t("Berkas PDF tidak dapat dimuat. Periksa koneksi atau coba lagi.")
                : t("Efek buku tidak tersedia di browser ini. Anda dapat mencoba membuka PDF langsung.");
            var link = document.createElement('a');
            link.href = options.url || '#';
            if (!options.url) link.hidden = true;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = options.format === "pdf" ? t("Buka PDF") : (options.language === "en" ? "Download original" : "Unduh dokumen asli");
            message.appendChild(text);
            message.appendChild(link);
            bookHost.appendChild(message);
        }

        state.onKey = function (event) {
            if (state.inline && !overlay.contains(event.target)) return;
            if(event.altKey&&event.key==='ArrowLeft'&&state.book){event.preventDefault();state.back();return;}
            if(!event.defaultPrevented&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='f'&&state.book){event.preventDefault();state.showTools().then(function(){state.tools.selectTab('search');toolsHost.querySelector('input[type=search]').focus();}).catch(function(){});return;}
            if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key === 'Escape') { event.preventDefault(); if(!help.hidden)toggleHelp();else if(!toolsHost.hidden){toolsHost.hidden=true;toolsButton.setAttribute('aria-expanded','false');toolsButton.focus();}else close(); return; }
            if (!/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) && !event.target.isContentEditable && state.book) {
                var book=state.book, rtl=options.mode==='manga'||options.readingDirection==='rtl';
                var key=event.key;
                if(key==='?' ){event.preventDefault();toggleHelp();return;}
                var actions={ArrowLeft:()=>rtl?book.next():book.prev(),ArrowRight:()=>rtl?book.prev():book.next(),PageDown:()=>book.next(),PageUp:()=>book.prev(),Home:()=>book.goTo(1),End:()=>book.goTo(state.pages),'+':()=>book.zoomIn(),'=':()=>book.zoomIn(),'-':()=>book.zoomOut(),'0':()=>book.setZoom(1),f:()=>book.toggleFullscreen(),F:()=>book.toggleFullscreen(),b:()=>bookmarkButton.click(),B:()=>bookmarkButton.click(),m:()=>soundButton.click(),M:()=>soundButton.click()};
                if(actions[key]){event.preventDefault();actions[key]();return;}
            }
            if (event.key !== 'Tab' || state.inline) return;
            var focusable = Array.prototype.filter.call(overlay.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), summary'), function (node) {
                return !node.closest('[hidden]') && node.getClientRects().length > 0;
            });
            if (!focusable.length) return;
            var first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };

        closeButton.addEventListener('click', function () { close(); });
        overlay.addEventListener('click', function (event) { if (!state.inline && event.target === overlay) close(); });
        marksButton.addEventListener('click', function () {
            toolsHost.hidden=true;toolsButton.setAttribute('aria-expanded','false');
            sidebar.hidden = !sidebar.hidden;
            marksButton.setAttribute('aria-expanded', sidebar.hidden ? 'false' : 'true');
            if (!sidebar.hidden) buildThumbs();
        });
        soundButton.addEventListener('click', function () {
            state.sound = !state.sound;
            save((options.storagePrefix || 'flippy:') + 'sound', state.sound);
            updateSound();
        });
        bookmarkButton.addEventListener('click', function () {
            var index = state.marks.indexOf(state.current);
            if (index === -1) state.marks.push(state.current);
            else state.marks.splice(index, 1);
            save(key + ':marks', state.marks);
            updateMarks();
        });
        pageForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var page = Number(pageInput.value);
            if (!state.book || !Number.isInteger(page) || page < 1 || page > state.pages) {
                pageInput.value = String(state.current);
                return;
            }

            // The arrow doubles as Next when the input still shows the current
            // page. Otherwise it opens the page the user entered.
            if (page === state.book.currentPage()) state.book.next();
            else state.navigate(page);
        });
        progress.addEventListener('change', function () {
            if (state.book) state.navigate(Number(progress.value));
        });
        progress.addEventListener('input',function(){positionLabel.textContent=progress.title=(state.pageLabels?.[Number(progress.value)-1]||progress.value)+' / '+state.pages;progress.setAttribute('aria-valuetext',progress.title);});
        bookHost.addEventListener('flipbook:ready', function (event) {
            if (active !== state) return;
            state.pages = event.detail.pages;
            if(state.inline)state.book.toggleFullscreen=function(){var result=document.fullscreenElement===shell?document.exitFullscreen?.():shell.requestFullscreen?.();result?.catch(function(){notice.textContent='Fullscreen unavailable';});};
            if(state.book.getText){if(!['single','scroll'].includes(options.mode))options.mode='single';state.book.setReadingMode?.(options.mode);applyTypography(bookHost,options);}
            state.book.setFit?.(options.fit || 'page');
            Promise.resolve(state.book.pdf?.getPageLabels?.()).then(function(labels){if(active===state){state.pageLabels=labels;updatePage(state.current);}}).catch(function(){});
            toolsButton.disabled=false;
            progress.max = String(state.pages);
            progress.disabled = false;
            pageInput.max = String(state.pages);
            total.textContent = ' / ' + state.pages;
            updatePage(state.book.currentPage());
            if (!sidebar.hidden) buildThumbs();
            if (document.activeElement === closeButton) bookHost.focus();
            if(state.book.getText&&!options.startPage){var location=read(key+':location',null);if(location&&location.page===state.book.currentPage())restoreTextPosition(bookHost,location);}
            if(state.resolveMode)state.resolveMode();else if (options.onReady) options.onReady(state);
            if(read(key+':highlights',null))loadTools().catch(function(){});
        });
        bookHost.addEventListener('flipbook:pagechange', function (event) {
            if (active !== state) return;
            updatePage(event.detail.page);
            if (options.onPageChange) options.onPageChange(event.detail.page);
            if (state.sound && options.soundUrl) {
                if (!state.soundFile) state.soundFile = new Audio(options.soundUrl);
                state.soundFile.currentTime = 0;
                var play = state.soundFile.play();
                if (play && play.catch) play.catch(function () {});
            }
        });
        bookHost.addEventListener('flipbook:pageerror', function (event) {
            if (active === state && options.onPageError) options.onPageError(event.detail);
        });
        bookHost.addEventListener('flipbook:error', function (event) {
            if (active === state) fallback(event.detail && event.detail.error);
        });

        (state.inline ? options.container : document.body).appendChild(overlay);
        if (!state.inline) document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', state.onKey);
        active = state;
        state.overlay = overlay;
        var tap;
        bookHost.addEventListener('pointerdown',function(event){if(event.isPrimary)tap={x:event.clientX,y:event.clientY,time:Date.now()};else tap=null;});
        bookHost.addEventListener('pointerup',function(event){if(!tap||Date.now()-tap.time>350||Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>8)return;tap=null;if(event.target.closest('button,input,select,a')||global.getSelection()?.toString())return;var rect=bookHost.getBoundingClientRect();if(event.clientX>rect.left+rect.width*.35&&event.clientX<rect.left+rect.width*.65)overlay.classList.toggle('sela-controls-hidden');});
        bookHost.addEventListener('dblclick',function(event){if(event.target.closest('button,input,select,a')||global.getSelection()?.toString())return;event.preventDefault();state.book?.setZoom(state.book.zoom>1.1?1:2);});
        overlay.addEventListener('focusin',function(){overlay.classList.remove('sela-controls-hidden');});
        bookHost.addEventListener('click',function(event){if(event.composedPath().some(node=>node.tagName==='A'))state.remember();},true);
        var lastLocation;
        if(global.ResizeObserver){state.resizeObserver=new ResizeObserver(function(){if(state.book?.getText){if(lastLocation)restoreTextPosition(bookHost,lastLocation);lastLocation=captureTextPosition(bookHost);}});state.resizeObserver.observe(bookHost);bookHost.addEventListener('scroll',function(){if(state.book?.getText){lastLocation=captureTextPosition(bookHost);save(state.locationKey,lastLocation);}}, {passive:true});}
        if (!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            global.requestAnimationFrame(function () {
                if (active === state) overlay.classList.remove('is-entering');
            });
        } else {
            overlay.classList.remove('is-entering');
        }
        updateSound();
        updateMarks();
        if (!state.inline) closeButton.focus();

        try {
            state.book = engine.create(bookHost, {
                ...options,
                url: options.url,
                data: options.data,
                httpHeaders: options.httpHeaders,
                withCredentials: options.withCredentials,
                password: options.password,
                cMapUrl: options.cMapUrl,
                standardFontDataUrl: options.standardFontDataUrl,
                pdfjsLib: options.pdfjsLib,
                startPage: options.startPage || Number(read(key + ':page', 1)) || 1,
                pdfjsSrc: options.pdfjsSrc,
                pdfWorkerSrc: options.pdfWorkerSrc,
                pdfjsLegacySrc: options.pdfjsLegacySrc,
                pdfjsLegacyWorkerSrc: options.pdfjsLegacyWorkerSrc,
                cornerFold: true,
                readingDirection: options.mode === 'manga' ? 'rtl' : (options.readingDirection || 'ltr'),
                displayMode: options.mode === 'single' ? 'single' : 'auto',
                maxScale: options.maxScale || options.scale || 1.75,
                maxCanvasPixels: options.maxCanvasPixels || 2500000,
                duration: (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : (options.duration === undefined ? 560 : options.duration)
            });
            if (state.inline) state.book.toggleFullscreen=function(){
                var result=document.fullscreenElement===shell?document.exitFullscreen?.():shell.requestFullscreen?.();
                result?.catch(function(){notice.textContent=options.language==='en'?'Fullscreen is unavailable in this browser.':'Layar penuh tidak tersedia di browser ini.';});
            };
        } catch (error) {
            fallback(error);
        }
        return Promise.resolve();
    }

    return { open: open, close: close, getState: function () { return active; } };
}
