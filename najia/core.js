(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NaJiaCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const BRANCH_WX = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const TRIGS = [
    {name:'乾', symbol:'☰', nature:'天'}, {name:'兌', symbol:'☱', nature:'澤'},
    {name:'離', symbol:'☲', nature:'火'}, {name:'震', symbol:'☳', nature:'雷'},
    {name:'巽', symbol:'☴', nature:'風'}, {name:'坎', symbol:'☵', nature:'水'},
    {name:'艮', symbol:'☶', nature:'山'}, {name:'坤', symbol:'☷', nature:'地'}
  ];
  const TRI = {
    乾:{inner:['子','寅','辰'],outer:['午','申','戌'],innerStem:'甲',outerStem:'壬',lines:'111'},
    兌:{inner:['巳','卯','丑'],outer:['亥','酉','未'],innerStem:'丁',outerStem:'丁',lines:'110'},
    離:{inner:['卯','丑','亥'],outer:['酉','未','巳'],innerStem:'己',outerStem:'己',lines:'101'},
    震:{inner:['子','寅','辰'],outer:['午','申','戌'],innerStem:'庚',outerStem:'庚',lines:'100'},
    巽:{inner:['丑','亥','酉'],outer:['未','巳','卯'],innerStem:'辛',outerStem:'辛',lines:'011'},
    坎:{inner:['寅','辰','午'],outer:['申','戌','子'],innerStem:'戊',outerStem:'戊',lines:'010'},
    艮:{inner:['辰','午','申'],outer:['戌','子','寅'],innerStem:'丙',outerStem:'丙',lines:'001'},
    坤:{inner:['未','巳','卯'],outer:['丑','亥','酉'],innerStem:'乙',outerStem:'癸',lines:'000'}
  };
  const PALACE_WX = {乾:'金',兌:'金',坤:'土',艮:'土',震:'木',巽:'木',坎:'水',離:'火'};
  const PALACES = {
    乾:[['乾','乾','乾為天'],['乾','巽','天風姤'],['乾','艮','天山遯'],['乾','坤','天地否'],['巽','坤','風地觀'],['艮','坤','山地剝'],['離','坤','火地晉'],['離','乾','火天大有']],
    坎:[['坎','坎','坎為水'],['坎','兌','水澤節'],['坎','震','水雷屯'],['坎','離','水火既濟'],['兌','離','澤火革'],['震','離','雷火豐'],['坤','離','地火明夷'],['坤','坎','地水師']],
    艮:[['艮','艮','艮為山'],['艮','離','山火賁'],['艮','乾','山天大畜'],['艮','兌','山澤損'],['離','兌','火澤睽'],['乾','兌','天澤履'],['巽','兌','風澤中孚'],['巽','艮','風山漸']],
    震:[['震','震','震為雷'],['震','坤','雷地豫'],['震','坎','雷水解'],['震','巽','雷風恒'],['坤','巽','地風升'],['坎','巽','水風井'],['兌','巽','澤風大過'],['兌','震','澤雷隨']],
    巽:[['巽','巽','巽為風'],['巽','乾','風天小畜'],['巽','離','風火家人'],['巽','震','風雷益'],['乾','震','天雷無妄'],['離','震','火雷噬嗑'],['艮','震','山雷頤'],['艮','巽','山風蠱']],
    離:[['離','離','離為火'],['離','艮','火山旅'],['離','巽','火風鼎'],['離','坎','火水未濟'],['艮','坎','山水蒙'],['巽','坎','風水渙'],['乾','坎','天水訟'],['乾','離','天火同人']],
    坤:[['坤','坤','坤為地'],['坤','震','地雷復'],['坤','兌','地澤臨'],['坤','乾','地天泰'],['震','乾','雷天大壯'],['兌','乾','澤天夬'],['坎','乾','水天需'],['坎','坤','水地比']],
    兌:[['兌','兌','兌為澤'],['兌','坎','澤水困'],['兌','坤','澤地萃'],['兌','艮','澤山咸'],['坎','艮','水山蹇'],['坤','艮','地山謙'],['震','艮','雷山小過'],['震','兌','雷澤歸妹']]
  };
  const SHI_YING = [[6,3],[1,4],[2,5],[3,6],[4,1],[5,2],[4,1],[3,6]];
  const POSITION_NAMES = ['本宮','一世','二世','三世','四世','五世','游魂','歸魂'];
  const SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  const KE = {木:'土',土:'水',水:'火',火:'金',金:'木'};
  const BEAST_ORDER = ['青龍','朱雀','勾陳','呈蛇','白虎','玄武'];
  const BEAST_START = {甲:0,乙:0,丙:1,丁:1,戊:2,己:3,庚:4,辛:4,壬:5,癸:5};
  const HEX_LOOKUP = {};

  Object.keys(PALACES).forEach(function (palace) {
    PALACES[palace].forEach(function (hex, index) {
      HEX_LOOKUP[hex[0] + hex[1]] = {name:hex[2], palace:palace, position:index};
    });
  });

  function sixKin(palaceElement, lineElement) {
    if (palaceElement === lineElement) return '兄弟';
    if (SHENG[palaceElement] === lineElement) return '子孫';
    if (SHENG[lineElement] === palaceElement) return '父母';
    if (KE[palaceElement] === lineElement) return '妻財';
    if (KE[lineElement] === palaceElement) return '官鬼';
    throw new Error('無法判定六親');
  }

  function findTrigram(lines) {
    return Object.keys(TRI).find(function (name) { return TRI[name].lines === lines; });
  }

  function buildHex(upper, lower, kinElement) {
    const info = HEX_LOOKUP[upper + lower];
    if (!info || !TRI[upper] || !TRI[lower]) throw new Error('無效的上下卦');
    const palaceElement = kinElement || PALACE_WX[info.palace];
    const positions = SHI_YING[info.position];
    const lowerData = TRI[lower];
    const upperData = TRI[upper];
    const lines = [];

    for (let index = 0; index < 6; index += 1) {
      const inner = index < 3;
      const tri = inner ? lowerData : upperData;
      const triIndex = inner ? index : index - 3;
      const branch = (inner ? tri.inner : tri.outer)[triIndex];
      const stem = inner ? tri.innerStem : tri.outerStem;
      const element = BRANCH_WX[branch];
      lines.push({
        position:index + 1,
        yang:tri.lines[triIndex] === '1',
        stem:stem,
        branch:branch,
        element:element,
        sixKin:sixKin(palaceElement, element),
        shi:index + 1 === positions[0],
        ying:index + 1 === positions[1]
      });
    }

    return {
      name:info.name,
      palace:info.palace,
      palaceElement:PALACE_WX[info.palace],
      kinElement:palaceElement,
      positionName:POSITION_NAMES[info.position],
      upper:upper,
      lower:lower,
      lines:lines
    };
  }

  function changedHex(baseHex, movingIndexes) {
    if (!movingIndexes.length) return null;
    const lowerLines = TRI[baseHex.lower].lines.split('');
    const upperLines = TRI[baseHex.upper].lines.split('');
    movingIndexes.forEach(function (index) {
      if (index < 0 || index > 5) throw new Error('動爻索引超出範圍');
      const target = index < 3 ? lowerLines : upperLines;
      const targetIndex = index < 3 ? index : index - 3;
      target[targetIndex] = target[targetIndex] === '1' ? '0' : '1';
    });
    return buildHex(findTrigram(upperLines.join('')), findTrigram(lowerLines.join('')), baseHex.palaceElement);
  }

  function hiddenSpirits(hex) {
    const present = new Set(hex.lines.map(function (line) { return line.sixKin; }));
    const purePalaceHex = buildHex(hex.palace, hex.palace, hex.palaceElement);
    const result = {};
    purePalaceHex.lines.forEach(function (line) {
      if (!present.has(line.sixKin)) result[line.position] = Object.assign({}, line);
    });
    return result;
  }

  function beasts(dayStem) {
    const start = BEAST_START[dayStem];
    if (start === undefined) throw new Error('無效的日干');
    return Array.from({length:6}, function (_, index) { return BEAST_ORDER[(start + index) % 6]; });
  }

  function voidBranches(dayStem, dayBranch) {
    const stemIndex = STEMS.indexOf(dayStem);
    const branchIndex = BRANCHES.indexOf(dayBranch);
    if (stemIndex < 0 || branchIndex < 0) throw new Error('無效的日干支');
    const head = (branchIndex - stemIndex + 12) % 12;
    return [BRANCHES[(head + 10) % 12], BRANCHES[(head + 11) % 12]];
  }

  function julianDayNumber(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function dayGanzhi(year, month, day) {
    const index = ((julianDayNumber(year, month, day) + 49) % 60 + 60) % 60;
    return {stem:STEMS[index % 10], branch:BRANCHES[index % 12], index:index};
  }

  function chinaTimeFields(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new Error('無效的日期時間');
    const chinaDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return {
      year:chinaDate.getUTCFullYear(),
      month:chinaDate.getUTCMonth() + 1,
      day:chinaDate.getUTCDate(),
      hour:chinaDate.getUTCHours(),
      minute:chinaDate.getUTCMinutes()
    };
  }

  function yearGanzhi(fields) {
    let year = fields.year;
    if (fields.month < 2 || (fields.month === 2 && fields.day < 4)) year -= 1;
    const index = ((year - 1984) % 60 + 60) % 60;
    return {stem:STEMS[index % 10], branch:BRANCHES[index % 12], index:index};
  }

  const MONTH_TERMS = [
    [1,6,1],[2,4,2],[3,6,3],[4,5,4],[5,6,5],[6,6,6],
    [7,7,7],[8,8,8],[9,8,9],[10,8,10],[11,7,11],[12,7,0]
  ];
  const TIGER_START = {0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0};

  function monthGanzhi(fields, yearStemIndex) {
    let chosen = MONTH_TERMS[MONTH_TERMS.length - 1];
    for (let index = MONTH_TERMS.length - 1; index >= 0; index -= 1) {
      const term = MONTH_TERMS[index];
      if (fields.month > term[0] || (fields.month === term[0] && fields.day >= term[1])) {
        chosen = term;
        break;
      }
    }
    const branchIndex = chosen[2];
    const yinStem = TIGER_START[yearStemIndex];
    const offset = (branchIndex - 2 + 12) % 12;
    const stemIndex = (yinStem + offset) % 10;
    return {stem:STEMS[stemIndex], branch:BRANCHES[branchIndex]};
  }

  function chinaGanzhi(date) {
    const chinaFields = chinaTimeFields(date);
    let pillarFields = chinaFields;
    if (chinaFields.hour >= 23) {
      const nextDate = new Date(Date.UTC(chinaFields.year, chinaFields.month - 1, chinaFields.day) + 86400000);
      pillarFields = Object.assign({}, chinaFields, {
        year:nextDate.getUTCFullYear(), month:nextDate.getUTCMonth() + 1, day:nextDate.getUTCDate()
      });
    }
    const year = yearGanzhi(pillarFields);
    const month = monthGanzhi(pillarFields, year.index % 10);
    const day = dayGanzhi(pillarFields.year, pillarFields.month, pillarFields.day);
    return {fields:chinaFields, pillarFields:pillarFields, year:year, month:month, day:day};
  }

  function cast(upper, lower, movingIndexes, date) {
    const base = buildHex(upper, lower);
    const changed = changedHex(base, movingIndexes);
    const pillars = chinaGanzhi(date);
    const ganzhi = pillars.day;
    return {
      base:base,
      changed:changed,
      movingIndexes:movingIndexes.slice().sort(function (a, b) { return a - b; }),
      hidden:hiddenSpirits(base),
      ganzhi:ganzhi,
      yearGanzhi:pillars.year,
      monthGanzhi:pillars.month,
      chinaFields:pillars.fields,
      beasts:beasts(ganzhi.stem),
      voidBranches:voidBranches(ganzhi.stem, ganzhi.branch)
    };
  }

  return {
    STEMS:STEMS,
    BRANCHES:BRANCHES,
    BRANCH_WX:BRANCH_WX,
    TRIGS:TRIGS,
    TRI:TRI,
    PALACES:PALACES,
    PALACE_WX:PALACE_WX,
    sixKin:sixKin,
    buildHex:buildHex,
    changedHex:changedHex,
    hiddenSpirits:hiddenSpirits,
    beasts:beasts,
    voidBranches:voidBranches,
    dayGanzhi:dayGanzhi,
    chinaTimeFields:chinaTimeFields,
    yearGanzhi:yearGanzhi,
    monthGanzhi:monthGanzhi,
    chinaGanzhi:chinaGanzhi,
    cast:cast
  };
});
