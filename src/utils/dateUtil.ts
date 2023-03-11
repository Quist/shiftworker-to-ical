import * as _dayjs from 'dayjs'
import dayjs from "dayjs";
var customParseFormat = require('dayjs/plugin/customParseFormat')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
_dayjs.extend(customParseFormat)
_dayjs.extend(utc)
_dayjs.extend(timezone)

export const isAfterYesterday = (date: Date) => {
	const yesterday = dayjs().subtract(1, 'day');
	return dayjs(date).isAfter(yesterday);
};