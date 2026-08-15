'use strict';

const assert = require('assert');
const core = require('../najia/core.js');

const trigramNames = core.TRIGS.map(function (trigram) { return trigram.name; });
const allHexes = [];

trigramNames.forEach(function (upper) {
  trigramNames.forEach(function (lower) {
    const hex = core.buildHex(upper, lower);
    allHexes.push(hex);
    assert.strictEqual(hex.lines.length, 6, hex.name + ' 必須有六爻');
    hex.lines.forEach(function (line, index) {
      assert.strictEqual(line.position, index + 1);
      assert.ok(line.stem && line.branch && line.element && line.sixKin, hex.name + ' 爻資料不可缺漏');
    });
    assert.strictEqual(hex.lines.filter(function (line) { return line.shi; }).length, 1, hex.name + ' 必須有一個世爻');
    assert.strictEqual(hex.lines.filter(function (line) { return line.ying; }).length, 1, hex.name + ' 必須有一個應爻');
  });
});

assert.strictEqual(allHexes.length, 64);
assert.strictEqual(new Set(allHexes.map(function (hex) { return hex.name; })).size, 64, '64 卦名稱必須唯一');

let singleMoveCases = 0;
allHexes.forEach(function (base) {
  for (let movingIndex = 0; movingIndex < 6; movingIndex += 1) {
    const changed = core.changedHex(base, [movingIndex]);
    const changedLine = changed.lines[movingIndex];
    singleMoveCases += 1;
    assert.ok(changed && changed.name, base.name + ' 單爻變化必須產生變卦');
    assert.strictEqual(changed.kinElement, base.palaceElement, '化爻六親必須沿用本卦宮五行');
    assert.strictEqual(changedLine.sixKin, core.sixKin(base.palaceElement, changedLine.element));
    assert.notStrictEqual(changedLine.yang, base.lines[movingIndex].yang, '動爻陰陽必須翻轉');
  }
});
assert.strictEqual(singleMoveCases, 384);

assert.deepStrictEqual(core.dayGanzhi(2024, 2, 10), {stem:'甲', branch:'辰', index:40});
assert.deepStrictEqual(core.voidBranches('甲', '辰'), ['寅','卯']);
assert.deepStrictEqual(core.beasts('甲'), ['青龍','朱雀','勾陳','呈蛇','白虎','玄武']);

const chinaPillars = core.chinaGanzhi(new Date('2026-08-15T12:05:00Z'));
assert.deepStrictEqual(chinaPillars.fields, {year:2026, month:8, day:15, hour:20, minute:5});
assert.strictEqual(chinaPillars.year.stem + chinaPillars.year.branch, '丙午');
assert.strictEqual(chinaPillars.month.stem + chinaPillars.month.branch, '丙申');
assert.strictEqual(chinaPillars.day.stem + chinaPillars.day.branch, '辛酉');
const lateRatHour = core.chinaGanzhi(new Date('2026-08-15T15:30:00Z'));
assert.strictEqual(lateRatHour.day.stem + lateRatHour.day.branch, '壬戌', '中原時間 23 時起應換日');

const hiddenCount = allHexes.filter(function (hex) { return Object.keys(core.hiddenSpirits(hex)).length > 0; }).length;
assert.ok(hiddenCount > 0, '應有需要伏神的卦');

console.log('PASS：64 卦、384 種單爻變化、化爻六親、伏神、六獸、旬空與日干支檢查完成。');
