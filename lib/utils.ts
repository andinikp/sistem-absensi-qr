export function getTanggalHariIni() {
  const bagian = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const dapat = (jenis: string) => bagian.find((item) => item.type === jenis)?.value ?? "";
  return `${dapat("year")}-${dapat("month")}-${dapat("day")}`;
}

export function getJamSekarang() {
  // `id-ID` memakai titik sebagai pemisah waktu (mis. 08.30.15). PostgreSQL
  // membutuhkan format TIME yang tidak ambigu, yaitu HH:mm:ss.
  const bagian = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const dapat = (jenis: Intl.DateTimeFormatPartTypes) =>
    bagian.find((item) => item.type === jenis)?.value ?? "00";

  return `${dapat("hour")}:${dapat("minute")}:${dapat("second")}`;
}

export function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
    .format(new Date(`${tanggal}T00:00:00+07:00`));
}

export function buatKodeMahasiswa(nim: string) {
  return `MHS-${nim.trim()}`;
}
