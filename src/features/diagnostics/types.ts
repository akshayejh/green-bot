// Types for device diagnostics

export interface SensorInfo {
  name: string;
  vendor: string | null;
  sensor_type: string | null;
  status: string;
}

export interface BatteryDiagnostics {
  level: number | null;
  status: string;
  health: string;
  temperature: number | null;
  voltage: number | null;
  current: number | null;
  technology: string | null;
  plugged: string;
  capacity: number | null;
  charge_counter: number | null;
  full_charge: boolean | null;
  max_charging_current: number | null;
  max_charging_voltage: number | null;
}

export interface DisplayDiagnostics {
  resolution: string | null;
  density: string | null;
  refresh_rate: string | null;
  hdr_capabilities: string | null;
  supported_modes: string[];
  brightness: number | null;
  adaptive_brightness: boolean | null;
}

export interface ConnectivityDiagnostics {
  // WiFi
  wifi_enabled: boolean;
  wifi_connected: boolean;
  wifi_ssid: string | null;
  wifi_signal_strength: number | null;
  wifi_frequency: string | null;
  wifi_link_speed: string | null;
  wifi_ip: string | null;

  // Bluetooth
  bluetooth_enabled: boolean;
  bluetooth_name: string | null;
  bluetooth_address: string | null;
  paired_devices_count: number;

  // Cellular
  mobile_data_enabled: boolean;
  carrier: string | null;
  signal_strength: string | null;
  network_type: string | null;

  // General
  airplane_mode: boolean;
}

export interface TouchTestResult {
  points_detected: number;
  max_touch_points: number | null;
  touch_major: string | null;
  tool_type: string | null;
  raw_events: string[];
}

export interface FullDiagnostics {
  battery: BatteryDiagnostics;
  display: DisplayDiagnostics;
  sensors: SensorInfo[];
  connectivity: ConnectivityDiagnostics;
}
