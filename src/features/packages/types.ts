export interface AppPackage {
    package_id: string;
    path: string;
    is_system: boolean;
    is_enabled: boolean;
}

export interface PackageDetails {
    package_id: string;
    version_name: string;
    version_code: string;
    first_install_time: string;
    last_update_time: string;
    uid: string;
    path: string;
    installer: string;
    min_sdk: string;
    target_sdk: string;
    size: string;
    permissions: string[];
    is_enabled: boolean;
}
