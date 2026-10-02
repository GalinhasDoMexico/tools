document.addEventListener("DOMContentLoaded", () => {

    const PREVIEW_URL = 'https://tools.cofm.site/discord/link-component-embeds';
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const ok = u => /^https?:\/\//i.test(u);
    const names = { text: 'Texto', gallery: 'Galeria', sep: 'Separador', buttons: 'Botões', secthumb: 'Seção + Thumbnail', secbtn: 'Seção + Botão' };
    const S = {
        blocks: [
            { t: 'text', content: '# Título do site\nUma descrição curta.' },
            { t: 'buttons', items: [{ label: 'Abrir site', url: 'https://tools.cofm.site/discord/link-component-embeds' }] }
        ]
    };

    function inl(t) { return t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>') }
    function md(s) {
        return esc(s).split('\n').map(l => {
            let m;
            if (m = l.match(/^(#{1,3}) (.*)/)) return '<h' + m[1].length + '>' + inl(m[2]) + '</h' + m[1].length + '>';
            if (m = l.match(/^-# (.*)/)) return '<small>' + inl(m[1]) + '</small><br>';
            return inl(l) + '<br>'
        }).join('')
    }

    const colorIn = $('color'), hexIn = $('hex');
    const swatches = document.querySelectorAll('.swatches button');
    const mark = c => swatches.forEach(b => b.classList.toggle('on', b.dataset.c === c));

    function setColor(c) {
        c = c.toLowerCase();
        colorIn.value = c;
        hexIn.value = c.toUpperCase();
        mark(c);
        update();
    }

    colorIn.addEventListener('input', () => setColor(colorIn.value));

    hexIn.addEventListener('input', () => {
        const v = hexIn.value.trim().replace(/^#?/, '#').toLowerCase();
        if (/^#[0-9a-f]{6}$/.test(v)) {
            colorIn.value = v;
            mark(v);
            update();
        }
    });

    swatches.forEach(b => b.addEventListener('click', () => setColor(b.dataset.c)));

    const EXAMPLES = {
        site: () => [
            { t: 'text', content: '# Título do site\nUma descrição incrível.' },
            { t: 'buttons', items: [{ label: 'Abrir site', url: 'https://cofm.site' }] }
        ],
        thumb: () => [
            { t: 'secthumb', content: '# **[Título](https://cofm.site/)**\nSubtitulo ou alguma descrição...', url: 'http://tools.cofm.site/src/img/chickenchibi.webp', desc: '' }
        ],
        btn: () => [
            { t: 'secbtn', content: '**Exemplo em negrito**\nNão sei o que escrever aqui.', label: 'Botão', url: 'https://cofm.site/#/editor' }
        ],
        full: () => [
            { t: 'secthumb', content: '# **[Título](https://cofm.site/#/loritta)**\nSubtitulo ou alguma descrição curta ou longa', url: 'http://tools.cofm.site/src/img/chickenchibi.webp', desc: '' },
            { t: 'sep' },
            { t: 'secbtn', content: '**Exemplo em negrito**\nDescrição, bla bla, não sei o que', label: 'Butão', url: 'https://cofm.site/#/outro-exemplo-de-url' },
            { t: 'buttons', items: [{ label: 'GitHub', url: 'https://github.com/GalinhasDoMexico' }, { label: 'Leia os Docs', url: 'https://cofm.site/#/docs' }] }
        ]
    };

    $('examples').addEventListener('change', e => {
        if (!e.target.value) return;
        S.blocks = EXAMPLES[e.target.value]();
        e.target.value = '';
        editor(); update();
    });

    function editor() {
        $('blocks').innerHTML = S.blocks.map((b, i) => {
            const a = (k, t) => '<button data-a="' + k + '" data-i="' + i + '">' + t + '</button>';
            let h = '<fieldset><legend>' + names[b.t] + ' ' + a('up', '↑') + a('down', '↓') + a('del', 'remover') + '</legend>';
            if (b.t === 'text' || b.t === 'secthumb' || b.t === 'secbtn') h += '<textarea data-i="' + i + '" data-f="content" rows="5" style="width:100%">' + esc(b.content) + '</textarea>';
            if (b.t === 'secthumb') h += '<input data-i="' + i + '" data-f="url" placeholder="URL da thumbnail" value="' + esc(b.url) + '"> <input data-i="' + i + '" data-f="desc" placeholder="descrição" value="' + esc(b.desc) + '">';
            if (b.t === 'secbtn') h += '<input data-i="' + i + '" data-f="label" placeholder="texto do botão" value="' + esc(b.label) + '"> <input data-i="' + i + '" data-f="url" placeholder="https://..." value="' + esc(b.url) + '">';
            if (b.t === 'gallery' || b.t === 'buttons') {
                const g = b.t === 'gallery';
                b.items.forEach((it, j) => {
                    const at = 'data-i="' + i + '" data-j="' + j + '"';
                    h += (g
                        ? '<input ' + at + ' data-f="url" placeholder="URL da imagem" value="' + esc(it.url) + '"> <input ' + at + ' data-f="desc" placeholder="descrição" value="' + esc(it.desc) + '">'
                        : '<input ' + at + ' data-f="label" placeholder="texto do botão" value="' + esc(it.label) + '"> <input ' + at + ' data-f="url" placeholder="https://..." value="' + esc(it.url) + '">')
                        + ' <button data-a="delitem" ' + at + '>x</button><br>';
                });
                h += '<button data-a="additem" data-i="' + i + '">+ ' + (g ? 'imagem (máx. 10)' : 'botão (máx. 5)') + '</button>';
            }
            return h + '</fieldset>';
        }).join('');
    }

    function build(use, color) {
        const comps = S.blocks.map(b => {
            if (b.t === 'text') return { type: 10, content: b.content };
            if (b.t === 'secthumb' || b.t === 'secbtn') {
                if (!b.url) return { type: 10, content: b.content };
                const acc = b.t === 'secthumb'
                    ? { type: 11, media: { url: b.url } }
                    : { type: 2, style: 5, label: b.label || b.url, url: b.url };
                if (b.t === 'secthumb' && b.desc) acc.description = b.desc;
                return { type: 9, components: [{ type: 10, content: b.content }], accessory: acc };
            }
            if (b.t === 'sep') return { type: 14 };
            if (b.t === 'gallery') return { type: 12, items: b.items.filter(i => i.url).map(i => { const o = { media: { url: i.url } }; if (i.desc) o.description = i.desc; return o }) };
            return { type: 1, components: b.items.filter(i => i.url).map(i => ({ type: 2, style: 5, label: i.label || i.url, url: i.url })) };
        }).filter(c => !(c.items && !c.items.length) && !(c.components && !c.components.length));
        const comp = { type: 17, components: comps };
        if (use) comp.accent_color = parseInt(color.slice(1), 16);
        return comp;
    }

    function update() {
        const use = $('usecolor').checked, color = $('color').value;
        // preview
        $('preview').innerHTML = '<p><a href="' + esc(PREVIEW_URL) + '" target="_blank" rel="noopener">' + esc(PREVIEW_URL) + '</a></p>'
            + '<div style="border-left:4px solid ' + (use ? color : 'gray') + ';padding:0 12px">' + S.blocks.map(b => {
                if (b.t === 'text') return '<div>' + md(b.content) + '</div>';
                if (b.t === 'sep') return '<hr>';
                if (b.t === 'secthumb' || b.t === 'secbtn') {
                    const acc = !ok(b.url) ? '' : b.t === 'secthumb'
                        ? '<img src="' + esc(b.url) + '" alt="' + esc(b.desc || '') + '" style="width:80px;height:80px;object-fit:cover">'
                        : '<a href="' + esc(b.url) + '" target="_blank" rel="noopener" style="display:inline-block">' + esc(b.label || b.url) + '</a>';
                    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px"><div style="min-width:0">' + md(b.content) + '</div>' + (acc ? '<div class="acc" style="flex:none">' + acc + '</div>' : '') + '</div>';
                }
                const n = b.items.filter(i => i.url && ok(i.url));
                if (b.t === 'gallery') return '<div style="display:flex;flex-wrap:wrap;gap:4px">' + n.map(i => '<img src="' + esc(i.url) + '" alt="' + esc(i.desc) + '" style="width:' + (n.length > 1 ? '49%' : '100%') + ';object-fit:cover">').join('') + '</div>';
                return '<div>' + n.map(i => '<a href="' + esc(i.url) + '" target="_blank" rel="noopener" style="border:1px solid;padding:2px 8px;margin-right:4px;display:inline-block">' + esc(i.label || i.url) + '</a>').join('') + '</div>';
            }).join('') + '</div>';
        $('preview').querySelectorAll('img').forEach(im => im.onerror = () => {
            const s = document.createElement('small'); s.textContent = '[imagem indisponível: ' + im.getAttribute('src') + '] '; im.replaceWith(s);
        });
        // code
        const json = JSON.stringify({ component: build(use, color) }).replace(/</g, '\\u003c');
        const og = [], t = $('ogt').value, d = $('ogd').value, im = $('ogi').value;
        if (t) og.push('<meta property="og:title" content="' + esc(t) + '">');
        if (d) og.push('<meta property="og:description" content="' + esc(d) + '">');
        if (im) og.push('<meta property="og:image" content="' + esc(im) + '">');
        if (use) og.push('<meta name="theme-color" content="' + color + '">');
        $('out').value = og.join('\n') + (og.length ? '\n' : '') + '<script id="discord:component-embed" type="application/json">\n' + json + '\n<\/script>';
        const bytes = new Blob([json]).size;
        $('size').textContent = '(JSON: ' + bytes + ' bytes' + (bytes > 3000 ? ' — passou do limite de ~3000!' : ' / ~3000') + ')';
    }

    document.addEventListener('click', e => {
        const d = e.target.dataset;
        if (d.add) {
            S.blocks.push({
                text: { t: 'text', content: '' },
                gallery: { t: 'gallery', items: [{ url: '', desc: '' }] },
                sep: { t: 'sep' },
                buttons: { t: 'buttons', items: [{ label: '', url: '' }] },
                secthumb: { t: 'secthumb', content: '', url: '', desc: '' },
                secbtn: { t: 'secbtn', content: '', label: '', url: '' }
            }[d.add]);
            editor(); update(); return;
        }
        if (!d.a) return;
        const i = +d.i, b = S.blocks[i];
        if (d.a === 'del') S.blocks.splice(i, 1);
        if (d.a === 'up' && i > 0) [S.blocks[i - 1], S.blocks[i]] = [S.blocks[i], S.blocks[i - 1]];
        if (d.a === 'down' && i < S.blocks.length - 1) [S.blocks[i + 1], S.blocks[i]] = [S.blocks[i], S.blocks[i + 1]];
        if (d.a === 'additem' && b.items.length < (b.t === 'gallery' ? 10 : 5)) b.items.push(b.t === 'gallery' ? { url: '', desc: '' } : { label: '', url: '' });
        if (d.a === 'delitem') b.items.splice(+d.j, 1);
        editor(); update();
    });

    $('blocks').addEventListener('input', e => {
        const d = e.target.dataset;
        if (d.f === undefined) return;
        const b = S.blocks[d.i];
        if (d.j !== undefined) b.items[d.j][d.f] = e.target.value; else b[d.f] = e.target.value;
        update();
    });

    ['usecolor', 'ogt', 'ogd', 'ogi'].forEach(id => $(id).addEventListener('input', update));

    $('copy').addEventListener('click', () => {
        $('out').select();
        try { navigator.clipboard.writeText($('out').value) } catch (_) { document.execCommand('copy') }
    });

    editor(); setColor('#5865f2');
});