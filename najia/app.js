(function () {
  'use strict';

  const core = window.NaJiaCore;
  const state = {lower:'乾', upper:'乾'};
  let lastCast = null;
  let lang = localStorage.getItem('najia_display_language') || 'zh';
  let showTrigramSymbols = localStorage.getItem('najia_show_trigram_symbols') === 'true';
  let trigramTextSize = localStorage.getItem('najia_trigram_text_size') || 'large';
  if (!['zh','en','bi'].includes(lang)) lang = 'zh';
  if (!['normal','large'].includes(trigramTextSize)) trigramTextSize = 'large';

  const UI = {
    zh:{eyebrow:'I-ChingWay',title:'京房納甲裝卦',subtitle:'排本卦、變卦、納干支、六親、世應、六獸、旬空與伏神',navCast:'裝卦',navStock:'股市應證',navCalendar:'萬年曆',navCompass:'風水羅盤',settings:'設定卦象',lineHint:'由下往上選爻，初爻為第一爻。',showTrigramSymbols:'顯示卦象',matterLabel:'占事（這次要問的事）',matterPlaceholder:'例如：問工作、投資、健康或某件事情的發展',upper:'上卦・外卦',lower:'下卦・內卦',moving:'動爻（可複選，也可不選）',localDate:'日期時間（本地）',castButton:'排出納甲卦盤',footer:'干支與卦盤日期均以中原標準時間（UTC+8）推算；本工具不連線、不抓股價。',chinaTime:'中原標準時間',year:'年',month:'月',day:'日',void:'旬空',matter:'占事',to:'之',palace:'宮',hexagram:'卦',hidden:'伏',change:'化',save:'▣ 儲存卦盤到手機',creating:'正在產生圖片…',selectDate:'請先選擇起卦日期。',headers:['六親','納甲','伏神','旬空','本卦','變卦','變卦六親','變卦納甲','六獸'],lineNames:['初爻','二爻','三爻','四爻','五爻','上爻']},
    en:{eyebrow:'I-ChingWay',title:'Jing Fang Najia Casting',subtitle:'Original and changed hexagrams, Najia, Six Kin, Shi/Ying, Six Beasts, Xunkong and hidden spirits',navCast:'Cast',navStock:'Stock Study',navCalendar:'Calendar',navCompass:'Feng Shui Compass',settings:'Cast Settings',lineHint:'Lines are counted upward; the first line is at the bottom.',showTrigramSymbols:'Show Trigram Symbols',matterLabel:'Question',matterPlaceholder:'For example: career, investment, health, or the outcome of an event',upper:'Upper Trigram・Outer',lower:'Lower Trigram・Inner',moving:'Moving Lines (optional, multi-select)',localDate:'Date & Time (local)',castButton:'CAST HEXAGRAM',footer:'Ganzhi and casting dates use China Standard Time (UTC+8). This tool works offline.',chinaTime:'China Standard Time',year:' Year',month:' Month',day:' Day',void:'Xunkong',matter:'Question',to:'to',palace:' Palace',hexagram:' Hex.',hidden:'Hidden',change:'Changed',save:'▣ Save Cast Image',creating:'Creating image…',selectDate:'Please select a casting date.',headers:['Six Kin','Najia','Hidden Spirit','Xunkong','Original','Changed Hex.','Changed Kin','Changed Najia','Six Beasts'],lineNames:['1st','2nd','3rd','4th','5th','6th']}
  };
  const SIX_KIN_EN = {'父母':'Parents','兄弟':'Brothers','官鬼':'Officer/Ghost','妻財':'Wealth','子孫':'Offspring'};
  const BEAST_EN = {'青龍':'Azure Dragon','朱雀':'Vermilion Bird','勾陳':'Curved Array','呈蛇':'Soaring Serpent','白虎':'White Tiger','玄武':'Black Tortoise'};
  const ELEMENT_EN = {'金':'Metal','木':'Wood','水':'Water','火':'Fire','土':'Earth'};
  const STEM_EN = {'甲':'Jia','乙':'Yi','丙':'Bing','丁':'Ding','戊':'Wu','己':'Ji','庚':'Geng','辛':'Xin','壬':'Ren','癸':'Gui'};
  const BRANCH_EN = {'子':'Zi','丑':'Chou','寅':'Yin','卯':'Mao','辰':'Chen','巳':'Si','午':'Wu','未':'Wei','申':'Shen','酉':'You','戌':'Xu','亥':'Hai'};
  const TRIGRAM_EN = {乾:['Heaven','Qian'],兌:['Lake','Dui'],離:['Fire','Li'],震:['Thunder','Zhen'],巽:['Wind','Xun'],坎:['Water','Kan'],艮:['Mountain','Gen'],坤:['Earth','Kun']};
  const POSITION_EN = {'本宮':'Pure','一世':'1st Generation','二世':'2nd Generation','三世':'3rd Generation','四世':'4th Generation','五世':'5th Generation','游魂':'Wandering Soul','歸魂':'Returning Soul'};
  const HEX_EN = {
    '乾為天':['Qian','The Creative'],'坤為地':['Kun','The Receptive'],'水雷屯':['Zhun','Difficulty at the Beginning'],'山水蒙':['Meng','Youthful Folly'],
    '水天需':['Xu','Waiting'],'天水訟':['Song','Conflict'],'地水師':['Shi','The Army'],'水地比':['Bi','Holding Together'],
    '風天小畜':['Xiaoxu','Taming Power of the Small'],'天澤履':['Lü','Treading'],'地天泰':['Tai','Peace'],'天地否':['Pi','Standstill'],
    '天火同人':['Tongren','Fellowship'],'火天大有':['Dayou','Possession in Great Measure'],'地山謙':['Qian','Modesty'],'雷地豫':['Yu','Enthusiasm'],
    '澤雷隨':['Sui','Following'],'山風蠱':['Gu','Work on the Decayed'],'地澤臨':['Lin','Approach'],'風地觀':['Guan','Contemplation'],
    '火雷噬嗑':['Shihe','Biting Through'],'山火賁':['Bi','Grace'],'山地剝':['Bo','Splitting Apart'],'地雷復':['Fu','Return'],
    '天雷無妄':['Wuwang','Innocence'],'山天大畜':['Daxu','Taming Power of the Great'],'山雷頤':['Yi','Corners of the Mouth'],'澤風大過':['Daguo','Preponderance of the Great'],
    '坎為水':['Kan','The Abysmal'],'離為火':['Li','The Clinging'],'澤山咸':['Xian','Influence'],'雷風恒':['Heng','Duration'],
    '天山遯':['Dun','Retreat'],'雷天大壯':['Dazhuang','Power of the Great'],'火地晉':['Jin','Progress'],'地火明夷':['Mingyi','Darkening of the Light'],
    '風火家人':['Jiaren','The Family'],'火澤睽':['Kui','Opposition'],'水山蹇':['Jian','Obstruction'],'雷水解':['Xie','Deliverance'],
    '山澤損':['Sun','Decrease'],'風雷益':['Yi','Increase'],'澤天夬':['Guai','Break-through'],'天風姤':['Gou','Coming to Meet'],
    '澤地萃':['Cui','Gathering Together'],'地風升':['Sheng','Pushing Upward'],'澤水困':['Kun','Oppression'],'水風井':['Jing','The Well'],
    '澤火革':['Ge','Revolution'],'火風鼎':['Ding','The Cauldron'],'震為雷':['Zhen','The Arousing'],'艮為山':['Gen','Keeping Still'],
    '風山漸':['Jian','Development'],'雷澤歸妹':['Guimei','The Marrying Maiden'],'雷火豐':['Feng','Abundance'],'火山旅':['Lü','The Wanderer'],
    '巽為風':['Xun','The Gentle'],'兌為澤':['Dui','The Joyous'],'風水渙':['Huan','Dispersion'],'水澤節':['Jie','Limitation'],
    '風澤中孚':['Zhongfu','Inner Truth'],'雷山小過':['Xiaoguo','Preponderance of the Small'],'水火既濟':['Jiji','After Completion'],'火水未濟':['Weiji','Before Completion']
  };

  function text(zh, en) { return lang === 'en' ? en : (lang === 'bi' ? zh + ' / ' + en : zh); }
  function ui(key) { return lang === 'bi' ? (UI.zh[key] === UI.en[key] ? UI.zh[key] : UI.zh[key] + ' / ' + UI.en[key]) : UI[lang][key]; }
  function sixKinText(value) { return text(value, SIX_KIN_EN[value] || value); }
  function beastText(value) { return text(value, BEAST_EN[value] || value); }
  function elementText(value) { return text(value, ELEMENT_EN[value] || value); }
  function stemText(value) { return text(value, STEM_EN[value] || value); }
  function branchText(value) { return text(value, BRANCH_EN[value] || value); }
  function najiaText(line) { return text(line.stem + line.branch + '・' + line.element, (STEM_EN[line.stem] || line.stem) + ' ' + (BRANCH_EN[line.branch] || line.branch) + ' · ' + (ELEMENT_EN[line.element] || line.element)); }
  function relationText(line) { return line.shi ? text('世','Shi Yao') : (line.ying ? text('應','Ying Yao') : ''); }
  function hexText(value) { const item=HEX_EN[value] || [value,value]; return text(value,item[0] + ' — ' + item[1]); }
  function pillarText(pillar, suffixKey) { return text(pillar.stem + pillar.branch + UI.zh[suffixKey], (STEM_EN[pillar.stem] || pillar.stem) + ' ' + (BRANCH_EN[pillar.branch] || pillar.branch) + UI.en[suffixKey]); }
  function palaceMetaText(base) { return text(base.palace + '宮' + base.palaceElement + '・' + base.positionName + '卦', TRIGRAM_EN[base.palace][1] + UI.en.palace + ' · ' + ELEMENT_EN[base.palaceElement] + ' · ' + (POSITION_EN[base.positionName] || base.positionName) + UI.en.hexagram); }

  function localDateTimeValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute;
  }

  function escapeHTML(value) {
    return value.replace(/[&<>'"]/g, function (character) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];
    });
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function chinaDateTimeText(fields) {
    return fields.year + '/' + pad2(fields.month) + '/' + pad2(fields.day) + ' ' + pad2(fields.hour) + ':' + pad2(fields.minute);
  }

  function updateChinaTimePreview() {
    const value = document.getElementById('castDate').value;
    const preview = document.getElementById('chinaTimePreview');
    if (!value) { preview.textContent = ''; return; }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) { preview.textContent = ''; return; }
    const pillars = core.chinaGanzhi(date);
    const year = pillarText(pillars.year, 'year');
    const month = pillarText(pillars.month, 'month');
    const day = pillarText(pillars.day, 'day');
    preview.textContent = ui('chinaTime') + ' ' + chinaDateTimeText(pillars.fields) + '（UTC+8）｜' + year + ' ' + month + ' ' + day;
  }

  function createTrigramGrid(elementId, key) {
    const grid = document.getElementById(elementId);
    grid.innerHTML = '';
    core.TRIGS.forEach(function (trigram) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trigram-button' + (showTrigramSymbols ? ' show-symbol' : '');
      button.dataset.name = trigram.name;
      button.setAttribute('aria-pressed', String(state[key] === trigram.name));
      const trigramEnglish = TRIGRAM_EN[trigram.name];
      button.setAttribute('aria-label', text(trigram.nature + '卦，' + trigram.name, trigramEnglish[0] + ', ' + trigramEnglish[1]));
      button.innerHTML = (showTrigramSymbols ? '<span class="trigram-symbol">' + trigram.symbol + '</span>' : '') +
        '<span class="trigram-name">' + text(trigram.nature, trigramEnglish[0]) + '</span>';
      button.addEventListener('click', function () {
        state[key] = trigram.name;
        grid.querySelectorAll('.trigram-button').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item.dataset.name === trigram.name));
        });
      });
      grid.appendChild(button);
    });
  }

  function createMovingOptions() {
    const grid = document.getElementById('movingGrid');
    const checked = new Set(Array.from(grid.querySelectorAll('input:checked')).map(function (input) { return Number(input.value); }));
    grid.innerHTML = '';
    UI[lang === 'bi' ? 'zh' : lang].lineNames.forEach(function (name, index) {
      const label = document.createElement('label');
      label.className = 'moving-option';
      const displayName = lang === 'bi' ? UI.zh.lineNames[index] + ' / ' + UI.en.lineNames[index] : name;
      label.innerHTML = '<input type="checkbox" value="' + index + '"' + (checked.has(index) ? ' checked' : '') + '><span>' + displayName + '</span>';
      grid.appendChild(label);
    });
  }

  function lineGraphic(line, moving) {
    const marker = moving ? '<span class="move-mark ' + (line.yang ? 'move-yang' : 'move-yin') + '" aria-label="' + ui('moving') + '">' + (line.yang ? '' : '×') + '</span>' : '';
    return '<div class="line-wrap"><span class="yao ' + (line.yang ? 'yang' : 'yin') + '">' + marker + '</span></div>';
  }

  function relationLabel(line) {
    if (line.shi) return '<span class="shi">' + relationText(line) + '</span>';
    if (line.ying) return '<span class="ying">' + relationText(line) + '</span>';
    return '';
  }

  function yaoDisplay(line, moving) {
    return '<div class="yao-display">' + lineGraphic(line, moving) + '<div class="sy-under">' + relationLabel(line) + '</div></div>';
  }

  function yaoOnlyDisplay(line) {
    return '<div class="yao-display">' + lineGraphic(line, false) + '<div class="sy-under"></div></div>';
  }

  function renderTable(result) {
    let rows = '';
    let compactRows = '';
    for (let index = 5; index >= 0; index -= 1) {
      const line = result.base.lines[index];
      const changedLine = result.changed ? result.changed.lines[index] : null;
      const moving = result.movingIndexes.includes(index);
      const hidden = result.hidden[line.position];
      const hiddenText = hidden ? ui('hidden') + ' ' + sixKinText(hidden.sixKin) + ' ' + najiaText(hidden) : '—';
      const voidText = result.voidBranches.includes(line.branch) ? (lang === 'en' ? 'XK' : (lang === 'bi' ? '空 / XK' : '空')) : '';
      rows += '<tr class="' + (moving ? 'moving-row' : '') + '">' +
        '<td class="kin">' + sixKinText(line.sixKin) + '</td>' +
        '<td>' + najiaText(line) + '</td>' +
        '<td class="hidden">' + hiddenText + '</td>' +
        '<td class="void">' + voidText + '</td>' +
        '<td>' + yaoDisplay(line, moving) + '</td>' +
        '<td class="changed-cell">' + (changedLine ? yaoOnlyDisplay(changedLine) : '') + '</td>' +
        '<td class="changed-cell">' + (changedLine ? sixKinText(changedLine.sixKin) : '') + '</td>' +
        '<td class="changed-cell">' + (changedLine ? najiaText(changedLine) : '') + '</td>' +
        '<td class="beast">' + beastText(result.beasts[index]) + '</td>' +
        '</tr>';
      if (changedLine) {
        compactRows += '<div class="compact-line has-change ' + (moving ? 'moving-row' : '') + '">' +
          '<div class="compact-hex compact-original"><div class="compact-info"><b>' + sixKinText(line.sixKin) + '</b><span>' + najiaText(line) +
          (voidText ? ' <em>' + voidText + '</em>' : '') + '</span>' +
          (hidden ? '<small>' + hiddenText + '</small>' : '') + '</div>' + yaoDisplay(line, moving) + '</div>' +
          '<div class="compact-hex compact-changed"><div class="compact-info"><b>' + sixKinText(changedLine.sixKin) + '</b><span>' + najiaText(changedLine) +
          '</span></div>' + yaoOnlyDisplay(changedLine) + '</div>' +
          '<div class="compact-side"><b>' + beastText(result.beasts[index]) + '</b></div></div>';
      } else {
        compactRows += '<div class="compact-line ' + (moving ? 'moving-row' : '') + '">' +
          '<div class="compact-info"><b>' + sixKinText(line.sixKin) + '</b><span>' + najiaText(line) +
          (voidText ? ' <em>' + voidText + '</em>' : '') + '</span>' +
          (hidden ? '<small>' + hiddenText + '</small>' : '') + '</div>' +
          '<div class="compact-yao">' + yaoDisplay(line, moving) + '</div>' +
          '<div class="compact-side"><b>' + beastText(result.beasts[index]) + '</b></div></div>';
      }
    }
    const headers = UI.zh.headers.map(function (header, index) { return lang === 'bi' ? header + ' / ' + UI.en.headers[index] : UI[lang].headers[index]; });
    return '<div class="table-scroll"><table class="hex-table">' +
      '<thead><tr>' + headers.map(function (header) { return '<th>' + header + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div><div class="compact-lines">' +
      (result.changed ? '<div class="compact-heading"><span>' + text('本卦','Original') + '</span><span>' + text('變卦','Changed') + '</span><span>' + text('六獸','Beasts') + '</span></div>' : '') +
      compactRows + '</div>';
  }

  function renderResult(result, dateValue, matter) {
    const changedTitle = result.changed ? '<span class="to">' + ui('to') + '</span><h2>' + hexText(result.changed.name) + '</h2>' : '';
    const palaceMeta = palaceMetaText(result.base);
    document.getElementById('result').innerHTML = '<section class="card result-card">' +
      '<div class="result-banner"><strong>' + pillarText(result.yearGanzhi, 'year') + '</strong>' +
      '<span class="pillar">' + pillarText(result.monthGanzhi, 'month') + '</span>' +
      '<span class="pillar">' + pillarText(result.ganzhi, 'day') + '</span>' +
      '<span>' + ui('void') + ' <b>' + result.voidBranches.map(branchText).join(' ') + '</b></span>' +
      '<span class="china-date">' + ui('chinaTime') + ' ' + chinaDateTimeText(result.chinaFields) + '（UTC+8）</span></div>' +
      (matter ? '<div class="matter-result"><strong>' + ui('matter') + '</strong>' + escapeHTML(matter) + '</div>' : '') +
      '<div class="hex-title"><h2>' + hexText(result.base.name) + '</h2>' + changedTitle +
      '<span class="hex-meta">' + palaceMeta + '</span></div>' +
      renderTable(result) +
      '<p class="result-note">' + text('化爻六親以本卦宮五行為準；○為老陽，×為老陰。伏神依本宮純卦對應爻位列出。','Changed-line Six Kin use the original palace element. A circle marks old yang; × marks old yin. Hidden spirits follow the pure palace hexagram.') + '</p>' +
      '<button class="save-button" id="saveImageButton" type="button">' + ui('save') + '</button>' +
      '</section>';
    lastCast = {result:result, dateValue:dateValue, matter:matter};
    document.getElementById('saveImageButton').addEventListener('click', saveCastImage);
    document.getElementById('result').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
    if (!text) return y;
    let line = '';
    for (const character of text) {
      const candidate = line + character;
      if (line && context.measureText(candidate).width > maxWidth) {
        context.fillText(line, x, y);
        line = character;
        y += lineHeight;
      } else {
        line = candidate;
      }
    }
    if (line) context.fillText(line, x, y);
    return y;
  }

  function drawYaoOnCanvas(context, line, moving, x, y, width) {
    width = width || 220;
    const gap = Math.max(28, Math.round(width * 0.15));
    const segment = (width - gap) / 2;
    const center = x + width / 2;
    context.fillStyle = '#20243a';
    if (line.yang) {
      context.fillRect(x, y, width, 14);
    } else {
      context.fillRect(x, y, segment, 14);
      context.fillRect(x + segment + gap, y, segment, 14);
    }
    if (!moving) return;
    context.strokeStyle = '#b9413a';
    context.lineWidth = 5;
    if (line.yang) {
      context.beginPath();
      context.arc(center, y + 7, 18, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.beginPath();
      context.moveTo(center - 15, y - 10);
      context.lineTo(center + 15, y + 24);
      context.moveTo(center + 15, y - 10);
      context.lineTo(center - 15, y + 24);
      context.stroke();
    }
  }

  function buildCastCanvas(record) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = record.matter ? 1450 : 1170;
    const context = canvas.getContext('2d');
    const result = record.result;

    context.fillStyle = '#fffdf8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#20243a';
    context.fillRect(0, 0, 18, canvas.height);

    context.fillStyle = '#a64e48';
    context.font = '700 24px "Microsoft JhengHei", sans-serif';
    context.fillText('I-CHING WAY', 58, 58);
    context.fillStyle = '#20243a';
    context.font = '800 48px "Microsoft JhengHei", sans-serif';
    context.fillText(ui('title'), 58, 116);

    let contentY = 164;
    if (record.matter) {
      context.fillStyle = '#f2eee5';
      context.fillRect(48, contentY, 1104, 150);
      context.fillStyle = '#a64e48';
      context.font = '800 25px "Microsoft JhengHei", sans-serif';
      context.fillText(ui('matter'), 70, contentY + 38);
      context.fillStyle = '#383528';
      context.font = '500 25px "Microsoft JhengHei", sans-serif';
      wrapCanvasText(context, record.matter, lang === 'en' ? 190 : 142, contentY + 38, lang === 'en' ? 920 : 970, 33);
      contentY += 178;
    }

    context.fillStyle = '#20243a';
    context.fillRect(48, contentY, 1104, 72);
    context.fillStyle = '#fff';
    context.font = (lang === 'zh' ? '800 31px' : '800 23px') + ' "Microsoft JhengHei", sans-serif';
    context.fillText(pillarText(result.yearGanzhi, 'year'), 70, contentY + 47);
    context.fillText(pillarText(result.monthGanzhi, 'month'), 280, contentY + 47);
    context.fillText(pillarText(result.ganzhi, 'day'), 500, contentY + 47);
    context.fillStyle = '#ffb2aa';
    context.font = '700 25px "Microsoft JhengHei", sans-serif';
    context.fillText(ui('void') + ' ' + result.voidBranches.map(branchText).join(' '), 710, contentY + 46);
    context.fillStyle = '#ded7c8';
    context.font = '500 23px "Microsoft JhengHei", sans-serif';
    context.fillText('UTC+8 ' + chinaDateTimeText(result.chinaFields), 940, contentY + 45);
    contentY += 112;

    const changedName = result.changed ? '　' + ui('to') + '　' + hexText(result.changed.name) : '';
    context.fillStyle = '#20243a';
    context.font = '800 42px "Microsoft JhengHei", sans-serif';
    context.fillText(hexText(result.base.name) + changedName, 58, contentY);
    context.fillStyle = '#777061';
    context.font = '600 22px "Microsoft JhengHei", sans-serif';
    context.fillText(palaceMetaText(result.base), 720, contentY);
    contentY += 54;

    context.fillStyle = '#f2eee5';
    context.fillRect(48, contentY, 1104, 46);
    context.fillStyle = '#777061';
    context.font = '700 19px "Microsoft JhengHei", sans-serif';
    context.fillText(text('本卦・六親／納甲','Original · Six Kin / Najia'), 68, contentY + 30);
    context.fillText(text('變卦・六親／納甲','Changed · Six Kin / Najia'), 590, contentY + 30);
    context.fillText(text('六獸','Six Beasts'), 1040, contentY + 30);
    contentY += 62;

    for (let index = 5; index >= 0; index -= 1) {
      const line = result.base.lines[index];
      const moving = result.movingIndexes.includes(index);
      const hidden = result.hidden[line.position];
      const changedLine = result.changed ? result.changed.lines[index] : null;
      const rowY = contentY + (5 - index) * 124;

      context.strokeStyle = '#e5dfd2';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(48, rowY + 105);
      context.lineTo(1152, rowY + 105);
      context.stroke();

      context.fillStyle = '#20243a';
      context.font = (lang === 'zh' ? '800 27px' : '800 20px') + ' "Microsoft JhengHei", sans-serif';
      context.fillText(sixKinText(line.sixKin), 68, rowY + 36);
      context.font = (lang === 'zh' ? '500 23px' : '500 18px') + ' "Microsoft JhengHei", sans-serif';
      context.fillText(najiaText(line), lang === 'zh' ? 165 : 185, rowY + 36);
      if (hidden) {
        context.fillStyle = '#80652f';
        context.font = '500 18px "Microsoft JhengHei", sans-serif';
        context.fillText(ui('hidden') + ' ' + sixKinText(hidden.sixKin) + ' ' + najiaText(hidden), 68, rowY + 74);
      }
      if (result.voidBranches.includes(line.branch)) {
        context.fillStyle = '#b9413a';
        context.font = '800 20px "Microsoft JhengHei", sans-serif';
        context.fillText(lang === 'en' ? 'XK' : (lang === 'bi' ? '空/XK' : '空'), 300, rowY + 36);
      }

      drawYaoOnCanvas(context, line, moving, 340, rowY + 27, 190);
      if (line.shi || line.ying) {
        context.fillStyle = line.shi ? '#b9413a' : '#315f88';
        context.font = (lang === 'zh' ? '900 24px' : '800 18px') + ' "Microsoft JhengHei", sans-serif';
        context.textAlign = 'center';
        context.fillText(relationText(line), 435, rowY + 78);
        context.textAlign = 'start';
      }
      context.fillStyle = '#20243a';
      context.font = '700 25px "Microsoft JhengHei", sans-serif';
      if (changedLine) {
        context.fillStyle = '#645f54';
        context.font = (lang === 'zh' ? '700 24px' : '700 17px') + ' "Microsoft JhengHei", sans-serif';
        context.fillText(sixKinText(changedLine.sixKin), 590, rowY + 36);
        context.font = (lang === 'zh' ? '500 21px' : '500 15px') + ' "Microsoft JhengHei", sans-serif';
        context.fillText(najiaText(changedLine), lang === 'zh' ? 685 : 710, rowY + 36);
        drawYaoOnCanvas(context, changedLine, false, 840, rowY + 27, 160);
      }
      context.fillStyle = '#20243a';
      context.font = '700 25px "Microsoft JhengHei", sans-serif';
      context.font = (lang === 'zh' ? '700 25px' : '700 17px') + ' "Microsoft JhengHei", sans-serif';
      context.fillText(beastText(result.beasts[index]), 1030, rowY + 40);
    }

    context.fillStyle = '#777061';
    context.font = '500 18px "Microsoft JhengHei", sans-serif';
    context.fillText(text('化爻六親以本卦宮五行為準；○為老陽，×為老陰。','Changed-line Six Kin use the original palace element; ○ marks old yang and × marks old yin.'), 58, canvas.height - 42);
    return canvas;
  }

  function canvasBlob(canvas) {
    return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
  }

  function downloadImage(dataUrl, filename) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function showSaveOverlay(dataUrl, file, filename) {
    const canShare = Boolean(file && navigator.canShare && navigator.canShare({files:[file]}));
    const overlay = document.createElement('div');
    overlay.className = 'save-overlay';
    overlay.innerHTML = '<div class="save-tip">' +
      (canShare
        ? text('按「儲存圖片」後，在手機選單選擇「儲存影像」；也可以長按下方圖片儲存。','Tap “Save Image,” then choose “Save Image” on your phone; you can also press and hold the image below.')
        : text('請長按下方圖片儲存到手機；桌面也可按「下載圖片」。','Press and hold the image below to save it on a phone; on desktop, select “Download Image.”')) +
      '</div><img alt="' + text('裝卦結果','Casting result') + '"><div class="save-actions"><button class="download-image">' +
      (canShare ? text('儲存圖片','Save Image') : text('下載圖片','Download Image')) + '</button><button class="close-overlay">' + text('關閉','Close') + '</button></div>';
    overlay.querySelector('img').src = dataUrl;
    overlay.querySelector('.download-image').addEventListener('click', function () {
      if (canShare) navigator.share({files:[file], title:filename}).catch(function () {});
      else downloadImage(dataUrl, filename);
    });
    overlay.querySelector('.close-overlay').addEventListener('click', function () { overlay.remove(); });
    overlay.addEventListener('click', function (event) { if (event.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  async function saveCastImage() {
    if (!lastCast) return;
    const button = document.getElementById('saveImageButton');
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = ui('creating');
    try {
      const canvas = buildCastCanvas(lastCast);
      const blob = await canvasBlob(canvas);
      const dataUrl = canvas.toDataURL('image/png');
      const englishHex = HEX_EN[lastCast.result.base.name] || [lastCast.result.base.name];
      const filename = (lang === 'en' ? 'Cast_' + englishHex[0] : '裝卦_' + lastCast.result.base.name) + '_' + lastCast.dateValue.slice(0, 10) + '.png';
      let file = null;
      try { if (blob) file = new File([blob], filename, {type:'image/png'}); } catch (error) {}
      const mobile = window.matchMedia('(max-width: 820px)').matches || navigator.maxTouchPoints > 0;
      if (mobile) showSaveOverlay(dataUrl, file, filename);
      else downloadImage(dataUrl, filename);
    } catch (error) {
      alert(text('產生圖片失敗：','Image creation failed: ') + error.message);
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  function castFromUI() {
    const dateValue = document.getElementById('castDate').value;
    if (!dateValue) {
      document.getElementById('result').innerHTML = '<div class="card empty-result">' + ui('selectDate') + '</div>';
      return;
    }
    const matter = document.getElementById('castMatter').value.trim();
    const moving = Array.from(document.querySelectorAll('#movingGrid input:checked')).map(function (input) { return Number(input.value); });
    const result = core.cast(state.upper, state.lower, moving, new Date(dateValue));
    renderResult(result, dateValue, matter);
  }

  function applyLanguage() {
    document.documentElement.dataset.lang = lang;
    document.documentElement.dataset.trigramSize = trigramTextSize;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
    document.title = ui('title');
    document.querySelectorAll('[data-i18n]').forEach(function (element) { element.textContent = ui(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) { element.placeholder = ui(element.dataset.i18nPlaceholder); });
    document.querySelectorAll('.language-switch button').forEach(function (button) {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.trigram-size-switch button').forEach(function (button) {
      const active = button.dataset.trigramSize === trigramTextSize;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('showTrigramSymbols').checked = showTrigramSymbols;
    createTrigramGrid('lowerGrid', 'lower');
    createTrigramGrid('upperGrid', 'upper');
    createMovingOptions();
    updateChinaTimePreview();
    if (lastCast) renderResult(lastCast.result, lastCast.dateValue, lastCast.matter);
  }

  document.querySelectorAll('.language-switch button').forEach(function (button) {
    button.addEventListener('click', function () {
      lang = button.dataset.lang;
      localStorage.setItem('najia_display_language', lang);
      applyLanguage();
    });
  });
  document.getElementById('castDate').value = localDateTimeValue(new Date());
  document.getElementById('castDate').addEventListener('input', updateChinaTimePreview);
  document.querySelectorAll('.trigram-size-switch button').forEach(function (button) {
    button.addEventListener('click', function () {
      trigramTextSize = button.dataset.trigramSize;
      localStorage.setItem('najia_trigram_text_size', trigramTextSize);
      document.documentElement.dataset.trigramSize = trigramTextSize;
      document.querySelectorAll('.trigram-size-switch button').forEach(function (item) {
        const active = item.dataset.trigramSize === trigramTextSize;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });
  document.getElementById('showTrigramSymbols').addEventListener('change', function (event) {
    showTrigramSymbols = event.target.checked;
    localStorage.setItem('najia_show_trigram_symbols', String(showTrigramSymbols));
    createTrigramGrid('lowerGrid', 'lower');
    createTrigramGrid('upperGrid', 'upper');
  });
  applyLanguage();
  document.getElementById('castButton').addEventListener('click', castFromUI);
})();
