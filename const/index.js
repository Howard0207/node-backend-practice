// 统一时间记录格式
const UNIT = {};

UNIT.YEAR = "year";
UNIT.MONTH = "month";
UNIT.DAY = "day";
UNIT.HOUR = "hour";
UNIT.MINUTE = "minute";
UNIT.SECOND = "second";
UNIT.MILLSECOND = "millsecond";

// 命令行参数
const COMMAND_ARGUMENT_BY_YEAR = "YYYY";
const COMMAND_ARGUMENT_BY_MONTH = "YYYY-MM";
const COMMAND_ARGUMENT_BY_DAY = "YYYY-MM-DD";
const COMMAND_ARGUMENT_BY_HOUR = "YYYY-MM-DD HH";
const COMMAND_ARGUMENT_BY_MINUTE = "YYYY-MM-DD HH:mm";
const COMMAND_ARGUMENT_BY_SECOND = "YYYY-MM-DD HH:mm:ss";
const COMMAND_ARGUMENT_BY_MILLSECOND = "YYYY-MM-DD HH:mm:ss.SSS";

// 数据展示
const DISPLAY_BY_YEAR = "YYYY";
const DISPLAY_BY_MONTH = "YYYY-MM";
const DISPLAY_BY_DAY = "YYYY-MM-DD";
const DISPLAY_BY_HOUR = "YYYY-MM-DD HH";
const DISPLAY_BY_MINUTE = "YYYY-MM-DD HH:mm";
const DISPLAY_BY_SECOND = "YYYY-MM-DD HH:mm:ss";
const DISPLAY_BY_MILLSECOND = "YYYY-MM-DD HH:mm:SSS";

const novelState = {
    连载中: 1,
    完本: 2
};

const novelClassify = {
    其他小说: 0,
    玄幻小说: 1,
    都市小说: 2,
    网游小说: 3,
    修真小说: 4,
    科幻小说: 5,
    穿越小说: 6
};

module.exports = {
    DISPLAY_BY_YEAR,
    DISPLAY_BY_MONTH,
    DISPLAY_BY_DAY,
    DISPLAY_BY_HOUR,
    DISPLAY_BY_MINUTE,
    DISPLAY_BY_SECOND,
    DISPLAY_BY_MILLSECOND,
    UNIT,
    COMMAND_ARGUMENT_BY_YEAR,
    COMMAND_ARGUMENT_BY_MONTH,
    COMMAND_ARGUMENT_BY_DAY,
    COMMAND_ARGUMENT_BY_HOUR,
    COMMAND_ARGUMENT_BY_MINUTE,
    COMMAND_ARGUMENT_BY_SECOND,
    COMMAND_ARGUMENT_BY_MILLSECOND,
    novelClassify,
    novelState
};
