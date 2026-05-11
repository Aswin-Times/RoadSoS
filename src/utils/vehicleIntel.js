// Vehicle Intelligence Hub — Module 14

// OBD-II PIDs
export const OBD_PIDS = {
  SPEED: { pid: '010D', name: 'Vehicle Speed', unit: 'km/h', parse: (b) => b[0] },
  RPM: { pid: '010C', name: 'Engine RPM', unit: 'rpm', parse: (b) => ((b[0] * 256) + b[1]) / 4 },
  COOLANT: { pid: '0105', name: 'Coolant Temp', unit: '°C', parse: (b) => b[0] - 40 },
  FUEL: { pid: '012F', name: 'Fuel Level', unit: '%', parse: (b) => (b[0] * 100) / 255 },
  BARO: { pid: '0133', name: 'Barometric Pressure', unit: 'kPa', parse: (b) => b[0] }
}

export const ALERT_THRESHOLDS = {
  coolantHigh: 105,
  fuelLow: 15,
  speedWarning: 120,
  rpmHigh: 6000
}

// Rolling blackbox buffer (2 min at 500ms = 240 entries)
export class VehicleBlackbox {
  constructor(maxEntries = 240) {
    this.buffer = []
    this.maxEntries = maxEntries
    this.frozen = false
    this.frozenData = null
  }

  addEntry(entry) {
    if (this.frozen) return
    this.buffer.push({ ...entry, timestamp: Date.now() })
    if (this.buffer.length > this.maxEntries) this.buffer.shift()
  }

  freeze() {
    this.frozen = true
    this.frozenData = [...this.buffer]
    return this.frozenData
  }

  exportCSV() {
    const data = this.frozenData || this.buffer
    const headers = 'timestamp,speed_gps,speed_obd,heading,lat,lng,accel_x,accel_y,accel_z'
    const rows = data.map(e =>
      `${e.timestamp},${e.speed_gps||0},${e.speed_obd||0},${e.heading||0},${e.lat||0},${e.lng||0},${e.ax||0},${e.ay||0},${e.az||0}`
    )
    return headers + '\n' + rows.join('\n')
  }

  exportGPX() {
    const data = this.frozenData || this.buffer
    const pts = data.map(e =>
      `    <trkpt lat="${e.lat}" lon="${e.lng}"><time>${new Date(e.timestamp).toISOString()}</time><speed>${e.speed_gps||0}</speed></trkpt>`
    ).join('\n')
    return `<?xml version="1.0"?>\n<gpx version="1.1">\n  <trk>\n    <trkseg>\n${pts}\n    </trkseg>\n  </trk>\n</gpx>`
  }
}

// Driver Fatigue Monitor
export class FatigueMonitor {
  constructor() {
    this.drivingStartTime = null
    this.lastBreakTime = null
    this.totalDrivingMs = 0
    this.isActive = false
  }

  startDriving() {
    if (!this.isActive) {
      this.drivingStartTime = Date.now()
      this.isActive = true
    }
  }

  stopDriving() {
    if (this.isActive) {
      this.totalDrivingMs += Date.now() - this.drivingStartTime
      this.isActive = false
    }
  }

  takeBreak() {
    this.stopDriving()
    this.lastBreakTime = Date.now()
    this.totalDrivingMs = 0
  }

  getContinuousDrivingMinutes() {
    let total = this.totalDrivingMs
    if (this.isActive) total += Date.now() - this.drivingStartTime
    return Math.floor(total / 60000)
  }

  getAlertLevel() {
    const mins = this.getContinuousDrivingMinutes()
    if (mins >= 180) return { level: 'critical', msg: 'Pull over in next 2km — 3h continuous driving', color: '#E8361A' }
    if (mins >= 120) return { level: 'warning', msg: 'You\'ve been driving 2h. Consider a break soon.', color: '#F59E0B' }
    if (mins >= 90) return { level: 'info', msg: '90 min driving. Break recommended in 30 min.', color: '#3B82F6' }
    return { level: 'ok', msg: 'Driving time normal.', color: '#22C55E' }
  }
}

// Vehicle recall checker mock
export const RECALL_EXAMPLES = [
  { make: 'Maruti Suzuki', model: 'Swift', year: 2019, issue: 'Fuel pump defect — risk of engine stall', severity: 'high', dealer: 'Nearest authorised service center' },
  { make: 'Hyundai', model: 'Creta', year: 2020, issue: 'Brake caliper bolt — potential loosening', severity: 'medium', dealer: 'Hyundai authorized dealer' },
  { make: 'Toyota', model: 'Fortuner', year: 2021, issue: 'Airbag inflator — Takata recall', severity: 'critical', dealer: 'Toyota dealership' }
]
