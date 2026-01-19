export interface AdbDevice {
    serial: string;
    state: string;
    model?: string;
    product?: string;
    device?: string;
}

export interface DeviceMetadata {
    label?: string;
    icon?: string;
    color?: string;
}

export interface FileEntry {
    name: string;
    path: string;
    is_dir: boolean;
    size?: number; // Rust's u64 -> JS number
    permissions: string;
}
