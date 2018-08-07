import moment from 'moment';
import contains from './contains';

var DATE_FORMAT_DEFAULT = 'YYYY-MM-DD';
var SUPORT_DATE_FORMATS = [
  'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYYMMDD',
  'YYYY-MM-DD HH', 'YYYY/MM/DD HH', 'YYYYMMDD HH',
  'YYYY-MM-DD HH:mm', 'YYYY/MM/DD HH:mm', 'YYYYMMDD HH:mm',
  'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss', 'YYYYMMDD HH:mm:ss',
  'HH', 'HH:mm', 'HH:mm:ss',
];

function parse (date) {
  var m = moment(date, SUPORT_DATE_FORMATS, true);
  if (!m.isValid()) {
    throw Error('传入的不是一个有效的日期');
  }
  return m;
}

export function now (f) {
  if (!f) {
    return moment().format(DATE_FORMAT_DEFAULT);
  }
  if (contains(SUPORT_DATE_FORMATS, f)) {
    return moment().format(f);
  } else {
    throw Error('传入的日期格式无效');
  }
}

var UNIT_TYPE_REGX = /^[y|Q|M|w|d|h|m|s|ms]$/;
/**
 * 日期增加数（默认为num天）
 * @param {Number} date 被加日期
 * @param {Number} num 加数
 * @param {Number} unit 增加数单位 [y: years, Q: quarters, M: months, w: weeks, d: days, 
 * h: hours, m: minutes, s: seconds, ms: milliseconds]
 */
export function dateAdd (date, num, unit) {
  if (arguments.length < 2) {
    throw Error('dateAdd 至少需要传递两个参数');
  }
  if (unit) {
    if (!UNIT_TYPE_REGX.test(unit)) {
      throw Error('unit 传入的值无效');
    }
  } else {
    unit = 'd';
  }
  var m = parse(date);
  if (m) {
    m.add(num, unit);
    return m.format(m._f);
  }
}

/**
 * 日期减去数（默认为num天）
 * @param {Number} date 被减日期
 * @param {Number} num 减数
 * @param {Number} unit 减去数单位 [y: years, Q: quarters, M: months, w: weeks, d: days, 
 * h: hours, m: minutes, s: seconds, ms: milliseconds]
 */
export function dateSubtract (date, num, unit) {
  if (arguments.length < 2) {
    throw Error('dateAdd 至少需要传递两个参数');
  }
  if (unit) {
    if (!UNIT_TYPE_REGX.test(unit)) {
      throw Error('unit 传入的值无效');
    }
  } else {
    unit = 'd';
  }
  var m = parse(date);
  if (m) {
    m.subtract(num, unit);
    return m.format(m._f);
  }
}

/**
 * 计算两个日期的时间差
 * @param {String} date1 
 * @param {String} date2 
 * @param {String} unit 计算差值单位 [y: years, Q: quarters, M: months, w: weeks, d: days, 
 * h: hours, m: minutes, s: seconds, ms: milliseconds]
 */
export function datesDiff (date1, date2, unit) {
  if (!date1 || !date2) {
    throw Error('daysBetween 参数date1、date2都不能为空');
  }
  if (unit) {
    if (!UNIT_TYPE_REGX.test(unit)) {
      throw Error('unit 传入的值无效');
    }
  } else {
    unit = 'd';
  }
  var m1 = parse(date1);
  var m2 = parse(date2);
  if (!m1) {
    throw Error('date1 不是有效日期/时间');
  } else if (!m2) {
    throw Error('date2 不是有效日期/时间');
  } else {
    return m1.diff(m2, unit);
  }
}

/**
 * 获取日期中的某个值（年份/月份等）
 * @param {String} date 
 * @param {String} unit year (years, y), month (months, M), date (dates, D), hour (hours, h),
 * minute (minutes, m), second (seconds, s), millisecond (milliseconds, ms)
 */
export function dateGet (date, unit) {
  if (!date) {
    throw Error('date 不能为空');
  }
  if (!unit) {
    throw Error('unit 不能为空');
  }
  var m = parse(date);
  if (!m) {
    throw Error('date 不是有效的日期');
  } else {
    if (unit === 'M') {
      return m.get(unit) + 1;
    } else {
      return m.get(unit);
    }
  }
}