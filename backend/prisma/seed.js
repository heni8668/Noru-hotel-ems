import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateOffset(days) {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function atTime(date, hours, minutes) {
  const value = new Date(date);
  value.setUTCHours(hours, minutes, 0, 0);
  return value;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.employeeShift.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();

  const [frontOffice, housekeeping, fnb, maintenance, hr] = await Promise.all([
    prisma.department.create({
      data: { name: "Front Office", description: "Reception, guest relations, and night audit." },
    }),
    prisma.department.create({
      data: { name: "Housekeeping", description: "Guest rooms, laundry, and public areas." },
    }),
    prisma.department.create({
      data: { name: "Food & Beverage", description: "Kitchen, restaurant, and room service." },
    }),
    prisma.department.create({
      data: { name: "Maintenance", description: "Building systems, repairs, and preventive work." },
    }),
    prisma.department.create({
      data: { name: "Human Resources", description: "Hiring, scheduling support, and staff welfare." },
    }),
  ]);

  const [agent, auditor, supervisor, attendant, chef, waiter, technician, officer] = await Promise.all([
    prisma.role.create({ data: { name: "Front Desk Agent", description: "Check-in, check-out, and guest inquiries." } }),
    prisma.role.create({ data: { name: "Night Auditor", description: "Overnight desk coverage and daily close." } }),
    prisma.role.create({ data: { name: "Supervisor", description: "Team coordination and floor coverage." } }),
    prisma.role.create({ data: { name: "Room Attendant", description: "Guest room cleaning and turn-down." } }),
    prisma.role.create({ data: { name: "Chef", description: "Kitchen production and food quality." } }),
    prisma.role.create({ data: { name: "Waiter", description: "Restaurant and room-service service." } }),
    prisma.role.create({ data: { name: "Maintenance Technician", description: "Repairs and equipment checks." } }),
    prisma.role.create({ data: { name: "HR Officer", description: "Staff records and attendance follow-up." } }),
  ]);

  const [morning, afternoon, night] = await Promise.all([
    prisma.shift.create({
      data: { name: "Morning", startTime: "06:00", endTime: "14:00", description: "Day opening coverage." },
    }),
    prisma.shift.create({
      data: { name: "Afternoon", startTime: "14:00", endTime: "22:00", description: "Peak guest service window." },
    }),
    prisma.shift.create({
      data: { name: "Night", startTime: "22:00", endTime: "06:00", description: "Overnight operations." },
    }),
  ]);

  const employeeRows = [
    { firstName: "Hana", lastName: "Bekele", email: "hana.bekele@noruhotel.com", phone: "+251 911 100 101", hireDate: dateOffset(-420), departmentId: frontOffice.id, roleId: supervisor.id },
    { firstName: "Dawit", lastName: "Tesfaye", email: "dawit.tesfaye@noruhotel.com", phone: "+251 911 100 102", hireDate: dateOffset(-300), departmentId: frontOffice.id, roleId: agent.id },
    { firstName: "Marta", lastName: "Alemu", email: "marta.alemu@noruhotel.com", phone: "+251 911 100 103", hireDate: dateOffset(-180), departmentId: frontOffice.id, roleId: auditor.id },
    { firstName: "Yonas", lastName: "Hailu", email: "yonas.hailu@noruhotel.com", phone: "+251 911 100 104", hireDate: dateOffset(-250), departmentId: housekeeping.id, roleId: supervisor.id },
    { firstName: "Selam", lastName: "Kebede", email: "selam.kebede@noruhotel.com", phone: "+251 911 100 105", hireDate: dateOffset(-90), departmentId: housekeeping.id, roleId: attendant.id },
    { firstName: "Liya", lastName: "Tadesse", email: "liya.tadesse@noruhotel.com", phone: "+251 911 100 106", hireDate: dateOffset(-60), departmentId: housekeeping.id, roleId: attendant.id },
    { firstName: "Abel", lastName: "Getachew", email: "abel.getachew@noruhotel.com", phone: "+251 911 100 107", hireDate: dateOffset(-500), departmentId: fnb.id, roleId: chef.id },
    { firstName: "Nardos", lastName: "Worku", email: "nardos.worku@noruhotel.com", phone: "+251 911 100 108", hireDate: dateOffset(-140), departmentId: fnb.id, roleId: waiter.id },
    { firstName: "Kidus", lastName: "Mengistu", email: "kidus.mengistu@noruhotel.com", phone: "+251 911 100 109", hireDate: dateOffset(-110), departmentId: fnb.id, roleId: waiter.id },
    { firstName: "Samuel", lastName: "Girma", email: "samuel.girma@noruhotel.com", phone: "+251 911 100 110", hireDate: dateOffset(-220), departmentId: maintenance.id, roleId: technician.id },
    { firstName: "Helen", lastName: "Assefa", email: "helen.assefa@noruhotel.com", phone: "+251 911 100 111", hireDate: dateOffset(-75), departmentId: maintenance.id, roleId: technician.id },
    { firstName: "Rediet", lastName: "Fikru", email: "rediet.fikru@noruhotel.com", phone: "+251 911 100 112", hireDate: dateOffset(-400), departmentId: hr.id, roleId: officer.id, status: "ACTIVE" },
  ];

  const employees = [];
  for (const data of employeeRows) {
    employees.push(await prisma.employee.create({ data }));
  }

  const shiftByEmployee = employees.map((employee, index) => {
    if (employee.email.includes("marta")) return [night, night, afternoon];
    if (index % 3 === 0) return [morning, morning, afternoon];
    if (index % 3 === 1) return [afternoon, morning, afternoon];
    return [morning, afternoon, night];
  });

  const attendanceData = [];
  const assignmentData = [];

  for (let day = -13; day <= 0; day += 1) {
    const date = dateOffset(day);
    const weekday = date.getUTCDay();

    for (const [index, employee] of employees.entries()) {
      if (weekday === 0 && index % 5 === 0) continue;

      const pattern = shiftByEmployee[index];
      const shift = pattern[Math.abs(day) % pattern.length];
      assignmentData.push({
        employeeId: employee.id,
        shiftId: shift.id,
        date,
      });

      const roll = (index * 7 + Math.abs(day) * 3) % 10;
      let status = "PRESENT";
      let checkIn = atTime(date, Number(shift.startTime.slice(0, 2)), 0);
      let checkOut =
        shift.name === "Night" ? atTime(dateOffset(day + 1), 6, 5) : atTime(date, Number(shift.endTime.slice(0, 2)), 2);

      if (roll === 0) {
        status = "LATE";
        checkIn = atTime(date, Number(shift.startTime.slice(0, 2)), 18);
      } else if (roll === 1 && weekday === 1) {
        status = "ABSENT";
        checkIn = null;
        checkOut = null;
      } else if (roll === 2 && weekday === 5 && index % 4 === 0) {
        status = "LEAVE";
        checkIn = null;
        checkOut = null;
      }

      attendanceData.push({
        employeeId: employee.id,
        date,
        status,
        checkIn,
        checkOut,
        notes:
          status === "LEAVE"
            ? "Approved leave"
            : status === "ABSENT"
              ? "No show"
              : status === "LATE"
                ? "Arrived after shift start"
                : null,
      });
    }
  }

  await prisma.employeeShift.createMany({ data: assignmentData });
  await prisma.attendance.createMany({ data: attendanceData });

  console.log(`Seeded ${employees.length} employees, ${assignmentData.length} shift assignments, ${attendanceData.length} attendance rows.`);
  console.log(`Today in seed data: ${isoDate(dateOffset(0))}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
