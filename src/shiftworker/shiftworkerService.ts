import { Repository, ShiftDB, ShifttypeDB } from "./db/db";
import { isAfterYesterday } from "../utils/dateUtil";
import { Dayjs } from "dayjs";
const dayjs = require( "dayjs");
var customParseFormat = require('dayjs/plugin/customParseFormat')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export const shiftworkerService = (repository: Repository): { getShifts: () => Promise<Shift[]> } => {
	return {
		getShifts: async () => {
			const shifts = await repository.getShifts()
			const shifttypes = await repository.getShifttypes()
			return mapShifts(shifts, shifttypes).filter(shift => isAfterYesterday(shift.start.toDate()))
		}
	}
}

const mapShifts = (shifts: ShiftDB[], shifttypes: ShifttypeDB[]) => shifts.map((shift): Shift => {
	const shifttype = shifttypes.find(type => type.primarykey === shift.shifttype)
	if (!shifttype) {
		throw new Error(`Could not find shifttype for ${shift.shifttype}`)
	}
	const {start, end} = parseDates(shift, shifttype);
	return {
		start: start,
		end: end,
		summary: shifttype?.description || 'Ukjent vakt'
	}
});

const parseDates = (shift: ShiftDB, shifttype: ShifttypeDB) => {
	const shiftStart = parseDate(shift.date, shifttype.start)
	const shiftEnd = parseDate(shift.date, shifttype.end)
	if (shiftEnd.isBefore(shiftStart)) {
		return {
			start: shiftStart,
			end: shiftEnd.add(1, 'day')
		}
	}

	return {
		start: shiftStart,
		end: shiftEnd
	}
};

const parseDate = (shiftDateRaw: string, shifttypeStart: string) => {
	const rawString = `${shiftDateRaw.split(" ")[0]} ${shifttypeStart}`;
	return dayjs(rawString, "MM-DD-YYYY HH:mm:ss ").tz("EUROPE/BERLIN")
};

export interface Shift {
	start: Dayjs
	end: Dayjs
	summary: string
}