import { createDBRepository } from "./shiftworker/db/db";
import { shiftworkerService } from "./shiftworker/shiftworkerService";
import { toIcal } from "./ical/ical";

const start = async () => {
	const service = shiftworkerService(createDBRepository())
	const shifts = await service.getShifts()
	const output = toIcal(shifts);
	console.log(output)
}

start()

