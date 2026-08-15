(function () {
  'use strict';

  const core = window.NaJiaCore;
  const state = {lower:'乾', upper:'乾'};
  const lineNames = ['初爻','二爻','三爻','四爻','五爻','上爻'];
  let lastCast = null;

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
    preview.textContent = '中原標準時間 ' + chinaDateTimeText(pillars.fields) + '（UTC+8）' +
      '｜' + pillars.year.stem + pillars.year.branch + '年 ' + pillars.month.stem + pillars.month.branch + '月 ' + pillars.day.stem + pillars.day.branch + '日';
  }

  function createTrigramGrid(elementId, key) {
    const grid = document.getElementById(elementId);
    core.TRIGS.forEach(function (trigram) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trigram-button';
      button.dataset.name = trigram.name;
      button.setAttribute('aria-pressed', String(state[key] === trigram.name));
      button.setAttribute('aria-label', trigram.nature + '卦，' + trigram.name);
      button.innerHTML = '<span class="trigram-symbol">' + trigram.symbol + '</span>' +
        '<span class="trigram-name">' + trigram.nature + '</span>' +
        '<span class="trigram-nature">' + trigram.name + '</span>';
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
    lineNames.forEach(function (name, index) {
      const label = document.createElement('label');
      label.className = 'moving-option';
      label.innerHTML = '<input type="checkbox" value="' + index + '"><span>' + name + '</span>';
      grid.appendChild(label);
    });
  }

  function lineGraphic(line, moving) {
    const marker = moving ? '<span class="move-mark" aria-label="動爻">' + (line.yang ? '○' : '×') + '</span>' : '<span class="move-mark"></span>';
    return '<div class="line-wrap"><span class="yao ' + (line.yang ? 'yang' : 'yin') + '"></span>' + marker + '</div>';
  }

  function relationLabel(line) {
    if (line.shi) return '<span class="shi">世</span>';
    if (line.ying) return '<span class="ying">應</span>';
    return '';
  }

  function renderTable(result) {
    let rows = '';
    let compactRows = '';
    for (let index = 5; index >= 0; index -= 1) {
      const line = result.base.lines[index];
      const changedLine = result.changed ? result.changed.lines[index] : null;
      const moving = result.movingIndexes.includes(index);
      const hidden = result.hidden[line.position];
      rows += '<tr class="' + (moving ? 'moving-row' : '') + '">' +
        '<td class="beast">' + result.beasts[index] + '</td>' +
        '<td class="hidden">' + (hidden ? '伏 ' + hidden.sixKin + ' <span class="stem">' + hidden.stem + '</span>' + hidden.branch + hidden.element : '—') + '</td>' +
        '<td class="kin">' + line.sixKin + '</td>' +
        '<td><span class="stem">' + line.stem + '</span>' + line.branch + '<span class="element">' + line.element + '</span></td>' +
        '<td class="void">' + (result.voidBranches.includes(line.branch) ? '空' : '') + '</td>' +
        '<td>' + lineGraphic(line, moving) + '</td>' +
        '<td>' + relationLabel(line) + '</td>' +
        '<td class="changed-cell">' + (moving && changedLine ? changedLine.sixKin : '') + '</td>' +
        '<td class="changed-cell">' + (moving && changedLine ? '<span class="stem">' + changedLine.stem + '</span>' + changedLine.branch + '<span class="element">' + changedLine.element + '</span>' : '') + '</td>' +
        '</tr>';
      compactRows += '<div class="compact-line ' + (moving ? 'moving-row' : '') + '">' +
        '<div class="compact-info"><b>' + line.sixKin + '</b><span><span class="stem">' + line.stem + '</span>' + line.branch + '・' + line.element +
        (result.voidBranches.includes(line.branch) ? ' <em>空</em>' : '') + '</span>' +
        (hidden ? '<small>伏 ' + hidden.sixKin + ' ' + hidden.stem + hidden.branch + '</small>' : '') + '</div>' +
        '<div class="compact-yao">' + lineGraphic(line, moving) + '<span>' + relationLabel(line) + '</span></div>' +
        '<div class="compact-side"><b>' + result.beasts[index] + '</b>' +
        (moving && changedLine ? '<span>化 ' + changedLine.sixKin + '<br>' + changedLine.stem + changedLine.branch + '・' + changedLine.element + '</span>' : '') + '</div></div>';
    }
    return '<div class="table-scroll"><table class="hex-table">' +
      '<thead><tr><th>六獸</th><th>伏神</th><th>六親</th><th>納甲</th><th>旬空</th><th>本卦</th><th>世應</th><th>化爻六親</th><th>化爻納甲</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div><div class="compact-lines">' + compactRows + '</div>';
  }

  function renderResult(result, dateValue, matter) {
    const changedTitle = result.changed ? '<span class="to">之</span><h2>' + result.changed.name + '</h2>' : '';
    document.getElementById('result').innerHTML = '<section class="card result-card">' +
      '<div class="result-banner"><strong>' + result.yearGanzhi.stem + result.yearGanzhi.branch + '年</strong>' +
      '<span class="pillar">' + result.monthGanzhi.stem + result.monthGanzhi.branch + '月</span>' +
      '<span class="pillar">' + result.ganzhi.stem + result.ganzhi.branch + '日</span>' +
      '<span>旬空 <b>' + result.voidBranches.join('') + '</b></span>' +
      '<span class="china-date">中原標準時間 ' + chinaDateTimeText(result.chinaFields) + '（UTC+8）</span></div>' +
      (matter ? '<div class="matter-result"><strong>占事</strong>' + escapeHTML(matter) + '</div>' : '') +
      '<div class="hex-title"><h2>' + result.base.name + '</h2>' + changedTitle +
      '<span class="hex-meta">' + result.base.palace + '宮' + result.base.palaceElement + '・' + result.base.positionName + '卦</span></div>' +
      renderTable(result) +
      '<p class="result-note">化爻六親以本卦「' + result.base.palace + '宮' + result.base.palaceElement + '」為判定基準；○為老陽，×為老陰。伏神依本宮純卦對應爻位列出。</p>' +
      '<button class="save-button" id="saveImageButton" type="button">▣ 儲存卦盤到手機</button>' +
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

  function drawYaoOnCanvas(context, line, moving, x, y) {
    context.fillStyle = '#20243a';
    if (line.yang) {
      context.fillRect(x, y, 220, 14);
    } else {
      context.fillRect(x, y, 94, 14);
      context.fillRect(x + 126, y, 94, 14);
    }
    if (!moving) return;
    context.strokeStyle = '#b9413a';
    context.lineWidth = 5;
    if (line.yang) {
      context.beginPath();
      context.arc(x + 110, y + 7, 18, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.beginPath();
      context.moveTo(x + 95, y - 10);
      context.lineTo(x + 125, y + 24);
      context.moveTo(x + 125, y - 10);
      context.lineTo(x + 95, y + 24);
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
    context.fillText('京房納甲裝卦', 58, 116);

    let contentY = 164;
    if (record.matter) {
      context.fillStyle = '#f2eee5';
      context.fillRect(48, contentY, 1104, 150);
      context.fillStyle = '#a64e48';
      context.font = '800 25px "Microsoft JhengHei", sans-serif';
      context.fillText('占事', 70, contentY + 38);
      context.fillStyle = '#383528';
      context.font = '500 25px "Microsoft JhengHei", sans-serif';
      wrapCanvasText(context, record.matter, 142, contentY + 38, 970, 33);
      contentY += 178;
    }

    context.fillStyle = '#20243a';
    context.fillRect(48, contentY, 1104, 72);
    context.fillStyle = '#fff';
    context.font = '800 31px "Microsoft JhengHei", sans-serif';
    context.fillText(result.yearGanzhi.stem + result.yearGanzhi.branch + '年', 70, contentY + 47);
    context.fillText(result.monthGanzhi.stem + result.monthGanzhi.branch + '月', 255, contentY + 47);
    context.fillText(result.ganzhi.stem + result.ganzhi.branch + '日', 440, contentY + 47);
    context.fillStyle = '#ffb2aa';
    context.font = '700 25px "Microsoft JhengHei", sans-serif';
    context.fillText('旬空 ' + result.voidBranches.join(''), 625, contentY + 46);
    context.fillStyle = '#ded7c8';
    context.font = '500 23px "Microsoft JhengHei", sans-serif';
    context.fillText('中原 ' + chinaDateTimeText(result.chinaFields), 850, contentY + 45);
    contentY += 112;

    const changedName = result.changed ? '　之　' + result.changed.name : '';
    context.fillStyle = '#20243a';
    context.font = '800 42px "Microsoft JhengHei", sans-serif';
    context.fillText(result.base.name + changedName, 58, contentY);
    context.fillStyle = '#777061';
    context.font = '600 22px "Microsoft JhengHei", sans-serif';
    context.fillText(result.base.palace + '宮' + result.base.palaceElement + '・' + result.base.positionName + '卦', 820, contentY);
    contentY += 54;

    context.fillStyle = '#f2eee5';
    context.fillRect(48, contentY, 1104, 46);
    context.fillStyle = '#777061';
    context.font = '700 19px "Microsoft JhengHei", sans-serif';
    context.fillText('六親／納甲', 68, contentY + 30);
    context.fillText('本卦', 502, contentY + 30);
    context.fillText('世應', 714, contentY + 30);
    context.fillText('六獸', 820, contentY + 30);
    context.fillText('化爻', 950, contentY + 30);
    contentY += 62;

    for (let index = 5; index >= 0; index -= 1) {
      const line = result.base.lines[index];
      const moving = result.movingIndexes.includes(index);
      const hidden = result.hidden[line.position];
      const changedLine = result.changed && moving ? result.changed.lines[index] : null;
      const rowY = contentY + (5 - index) * 124;

      context.strokeStyle = '#e5dfd2';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(48, rowY + 105);
      context.lineTo(1152, rowY + 105);
      context.stroke();

      context.fillStyle = '#20243a';
      context.font = '800 27px "Microsoft JhengHei", sans-serif';
      context.fillText(line.sixKin, 68, rowY + 36);
      context.font = '500 23px "Microsoft JhengHei", sans-serif';
      context.fillText(line.stem + line.branch + '・' + line.element, 180, rowY + 36);
      if (hidden) {
        context.fillStyle = '#80652f';
        context.font = '500 18px "Microsoft JhengHei", sans-serif';
        context.fillText('伏 ' + hidden.sixKin + ' ' + hidden.stem + hidden.branch, 68, rowY + 74);
      }
      if (result.voidBranches.includes(line.branch)) {
        context.fillStyle = '#b9413a';
        context.font = '800 20px "Microsoft JhengHei", sans-serif';
        context.fillText('空', 330, rowY + 36);
      }

      drawYaoOnCanvas(context, line, moving, 430, rowY + 27);
      if (line.shi || line.ying) {
        context.fillStyle = line.shi ? '#b9413a' : '#315f88';
        context.font = '900 28px "Microsoft JhengHei", sans-serif';
        context.fillText(line.shi ? '世' : '應', 718, rowY + 41);
      }
      context.fillStyle = '#20243a';
      context.font = '700 25px "Microsoft JhengHei", sans-serif';
      context.fillText(result.beasts[index], 810, rowY + 40);
      if (changedLine) {
        context.fillStyle = '#645f54';
        context.font = '700 22px "Microsoft JhengHei", sans-serif';
        context.fillText(changedLine.sixKin, 940, rowY + 30);
        context.font = '500 20px "Microsoft JhengHei", sans-serif';
        context.fillText(changedLine.stem + changedLine.branch + '・' + changedLine.element, 940, rowY + 65);
      }
    }

    context.fillStyle = '#777061';
    context.font = '500 18px "Microsoft JhengHei", sans-serif';
    context.fillText('化爻六親以本卦宮五行為準；○為老陽，×為老陰。', 58, canvas.height - 42);
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
      (canShare ? '按「儲存圖片」後，在手機選單選擇「儲存影像」；也可以長按下方圖片儲存。' : '請長按下方圖片儲存到手機；桌面也可按「下載圖片」。') +
      '</div><img alt="裝卦結果"><div class="save-actions"><button class="download-image">' +
      (canShare ? '儲存圖片' : '下載圖片') + '</button><button class="close-overlay">關閉</button></div>';
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
    button.textContent = '正在產生圖片…';
    try {
      const canvas = buildCastCanvas(lastCast);
      const blob = await canvasBlob(canvas);
      const dataUrl = canvas.toDataURL('image/png');
      const filename = '裝卦_' + lastCast.result.base.name + '_' + lastCast.dateValue.slice(0, 10) + '.png';
      let file = null;
      try { if (blob) file = new File([blob], filename, {type:'image/png'}); } catch (error) {}
      const mobile = window.matchMedia('(max-width: 820px)').matches || navigator.maxTouchPoints > 0;
      if (mobile) showSaveOverlay(dataUrl, file, filename);
      else downloadImage(dataUrl, filename);
    } catch (error) {
      alert('產生圖片失敗：' + error.message);
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  function castFromUI() {
    const dateValue = document.getElementById('castDate').value;
    if (!dateValue) {
      document.getElementById('result').innerHTML = '<div class="card empty-result">請先選擇起卦日期。</div>';
      return;
    }
    const matter = document.getElementById('castMatter').value.trim();
    const moving = Array.from(document.querySelectorAll('#movingGrid input:checked')).map(function (input) { return Number(input.value); });
    const result = core.cast(state.upper, state.lower, moving, new Date(dateValue));
    renderResult(result, dateValue, matter);
  }

  createTrigramGrid('lowerGrid', 'lower');
  createTrigramGrid('upperGrid', 'upper');
  createMovingOptions();
  document.getElementById('castDate').value = localDateTimeValue(new Date());
  document.getElementById('castDate').addEventListener('input', updateChinaTimePreview);
  updateChinaTimePreview();
  document.getElementById('castButton').addEventListener('click', castFromUI);
})();
