/**
 * 格式化日期
 * @param format 日期格式字符串
 * @param date 要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
export function dateFormatter(format = 'YYYY-MM-DD HH:mm:ss', date = new Date()) {
  let parsedDate;
  if (date instanceof Date) {
    parsedDate = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }
  } else {
    parsedDate = new Date();
  }
  // 获取日期的基本信息
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth(); // 0 表示 1 月
  const day = parsedDate.getDate();
  const weekday = parsedDate.getDay(); // 0 表示星期日
  const hour = parsedDate.getHours();
  const minute = parsedDate.getMinutes();
  const second = parsedDate.getSeconds();
  const millisecond = parsedDate.getMilliseconds();

  // 星期和月份的常量定义
  const FULL_WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const SHORT_WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const MONTHS_CHINESE = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];
  const MONTHS_SHORT_EN = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const MONTHS_LONG_EN = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const QUARTERS = ['一季度', '二季度', '三季度', '四季度'];

  // 获取季度的函数
  const getQuarter = (month: number) => Math.ceil((month + 1) / 3);

  // 映射表：格式化占位符到实际值的映射
  const PLACEHOLDER_MAPPING: Record<string, string> = {
    // 年份
    YYYY: year.toString(),
    YY: year.toString().slice(-2),

    // 月份
    M: (month + 1).toString(),
    MM: (month + 1).toString().padStart(2, '0'),
    MMM: MONTHS_SHORT_EN[month],
    MMMM: MONTHS_LONG_EN[month],
    MMMMM: MONTHS_CHINESE[month],

    // 日期
    D: day.toString(),
    DD: day.toString().padStart(2, '0'),

    // 星期
    W: weekday.toString(),
    WW: SHORT_WEEKDAYS[weekday],
    WWW: FULL_WEEKDAYS[weekday],

    // 季度
    Q: getQuarter(month).toString(),
    QQ: QUARTERS[getQuarter(month) - 1],

    // 时间（24小时制）
    H: hour.toString(),
    HH: hour.toString().padStart(2, '0'),

    // 时间（12小时制）
    h: (hour % 12 || 12).toString(),
    hh: (hour % 12 || 12).toString().padStart(2, '0'),
    A: hour >= 12 ? 'PM' : 'AM',
    a: hour >= 12 ? 'pm' : 'am',

    // 分钟和秒
    m: minute.toString(),
    mm: minute.toString().padStart(2, '0'),
    s: second.toString(),
    ss: second.toString().padStart(2, '0'),

    // 毫秒
    S: millisecond.toString(),
    SS: millisecond.toString().padStart(2, '0'),
    SSS: millisecond.toString().padStart(3, '0'),
  };

  // 替换逻辑：根据格式字符串中的占位符替换为实际值
  return format.replace(/Y+|M+|D+|W+|Q+|H+|h+|A|a|m+|s+|S+/g, (match) => {
    return PLACEHOLDER_MAPPING[match] || '';
  });
}
