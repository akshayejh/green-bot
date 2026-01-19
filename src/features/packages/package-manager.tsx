import { useState, useEffect, useMemo, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDeviceStore } from "@/store/device-store";
import { usePackageStore } from "@/store/package-store";
import { Toolbar, ToolbarLeft, ToolbarRight } from "@/components/toolbar";
import { Package, RefreshCw, Smartphone, Search, Plus, AlertTriangle, ArrowUpDown, ArrowDownAZ, ArrowUpAZ, Power, PowerOff, User, Shield } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { AppPackage } from "./types";
import { PackageDetailsPanel } from "./package-details";
import { PackageListItem } from "./package-list-item";
import { InstallApkDialog } from "./install-apk-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/fade-in";
import { toast } from "sonner";
import { parseAdbError } from "@/lib/utils";

export function PackageManager() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);

    // Store
    const {
        packages,
        loading,
        selectedPkg,
        details,
        detailsLoading,
        fetchPackages,
        fetchDetails,
        setSelectedPkg,
        removePackage,
        updatePackage,
        updateDetails
    } = usePackageStore();

    // Local UI state
    const [search, setSearch] = useState("");
    const [showSystem, setShowSystem] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [uninstallError, setUninstallError] = useState<string | null>(null);
    const [isUninstallAlertOpen, setIsUninstallAlertOpen] = useState(false);
    const [isUninstalling, setIsUninstalling] = useState(false);
    const [isClearDataAlertOpen, setIsClearDataAlertOpen] = useState(false);
    const [isClearingData, setIsClearingData] = useState(false);
    const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
    const [sortOption, setSortOption] = useState<string>("name-asc");

    useEffect(() => {
        if (selectedSerial) {
            fetchPackages(selectedSerial, showSystem);
        }
    }, [selectedSerial, showSystem]);

    useEffect(() => {
        if (selectedPkg && selectedSerial) {
            // Only fetch details if they are missing or package ID changed
            if (!details || details.package_id !== selectedPkg.package_id) {
                fetchDetails(selectedSerial, selectedPkg.package_id);
            }
            setUninstallError(null);
        }
    }, [selectedPkg]);

    // Helper to refresh current
    const refreshList = () => {
        if (selectedSerial) fetchPackages(selectedSerial, showSystem);
    };

    const handleUninstallClick = () => {
        setUninstallError(null);
        setIsUninstallAlertOpen(true);
    };

    const confirmUninstall = async () => {
        if (!selectedSerial || !selectedPkg) return;

        setIsUninstalling(true);
        setUninstallError(null);

        try {
            await invoke("uninstall_package", {
                device: selectedSerial,
                package: selectedPkg.package_id
            });
            // Optimistic update
            removePackage(selectedPkg.package_id);
            setIsUninstallAlertOpen(false);
            toast.success("Package uninstalled");
        } catch (err) {
            setUninstallError(parseAdbError(err));
        } finally {
            setIsUninstalling(false);
        }
    };

    const handleInstallClick = () => {
        setIsInstallDialogOpen(true);
    };

    const handleInstallComplete = () => {
        refreshList();
    };

    const confirmClearData = async () => {
        if (!selectedSerial || !selectedPkg) return;

        setIsClearingData(true);
        try {
            await invoke('clear_package_data', { device: selectedSerial, package: selectedPkg.package_id });
            toast.success("Data cleared");
            fetchDetails(selectedSerial, selectedPkg.package_id);
            setIsClearDataAlertOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to clear data: ${parseAdbError(err)}`);
        } finally {
            setIsClearingData(false);
        }
    };

    const handleAction = async (action: 'launch' | 'force-stop' | 'clear-data' | 'toggle-enable') => {
        if (!selectedSerial || !selectedPkg) return;

        if (action === 'clear-data') {
            setIsClearDataAlertOpen(true);
            return;
        }

        setActionLoading(action);
        try {
            if (action === 'launch') {
                await invoke('launch_package', { device: selectedSerial, package: selectedPkg.package_id });
                toast.success("App launched");
            } else if (action === 'force-stop') {
                await invoke('force_stop_package', { device: selectedSerial, package: selectedPkg.package_id });
                toast.success("App stopped");
            } else if (action === 'toggle-enable') {
                const isCurrentlyEnabled = details?.is_enabled ?? selectedPkg.is_enabled;
                if (isCurrentlyEnabled) {
                    await invoke('disable_package', { device: selectedSerial, package: selectedPkg.package_id });
                    toast.success("App disabled");
                    updatePackage(selectedPkg.package_id, { is_enabled: false });
                    updateDetails({ is_enabled: false });
                } else {
                    await invoke('enable_package', { device: selectedSerial, package: selectedPkg.package_id });
                    toast.success("App enabled");
                    updatePackage(selectedPkg.package_id, { is_enabled: true });
                    updateDetails({ is_enabled: true });
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(`Action failed: ${parseAdbError(err)}`);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter & Sort Logic
    // ...existing code...
    const filteredPackages = useMemo(() => {
        let result = packages.filter(p =>
            p.package_id.toLowerCase().includes(search.toLowerCase())
        );

        return result.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.package_id.localeCompare(b.package_id);
                case 'name-desc':
                    return b.package_id.localeCompare(a.package_id);
                case 'enabled':
                    // Enabled first: (a=true, b=false) -> -1
                    if (a.is_enabled !== b.is_enabled) return a.is_enabled ? -1 : 1;
                    return a.package_id.localeCompare(b.package_id);
                case 'disabled':
                    // Disabled first: (a=false, b=true) -> -1
                    if (a.is_enabled !== b.is_enabled) return !a.is_enabled ? -1 : 1;
                    return a.package_id.localeCompare(b.package_id);
                case 'system':
                    // System first
                    if (a.is_system !== b.is_system) return a.is_system ? -1 : 1;
                    return a.package_id.localeCompare(b.package_id);
                case 'user':
                    // User first
                    if (a.is_system !== b.is_system) return !a.is_system ? -1 : 1;
                    return a.package_id.localeCompare(b.package_id);
                default:
                    return 0;
            }
        });
    }, [packages, search, sortOption]);

    const handlePackageClick = useCallback((pkg: AppPackage) => {
        setSelectedPkg(pkg);
    }, [setSelectedPkg]);

    return (
        <div className="flex flex-col h-full bg-background">
            <Toolbar className="border-b px-2 py-2">
                <ToolbarLeft>
                    <div className="flex items-center gap-2 px-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">Installed Packages</span>
                    </div>
                </ToolbarLeft>
                <ToolbarRight>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search packages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-8"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                <DropdownMenuRadioItem value="name-asc">
                                    <ArrowDownAZ className="w-4 h-4 mr-2" /> Name (A-Z)
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="name-desc">
                                    <ArrowUpAZ className="w-4 h-4 mr-2" /> Name (Z-A)
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="enabled">
                                    <Power className="w-4 h-4 mr-2" /> Enabled First
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="disabled">
                                    <PowerOff className="w-4 h-4 mr-2" /> Disabled First
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="system">
                                    <Shield className="w-4 h-4 mr-2" /> System Packages
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="user">
                                    <User className="w-4 h-4 mr-2" /> User Packages
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="flex items-center gap-2" >
                        <Switch id="system-apps" checked={showSystem} onCheckedChange={setShowSystem} />
                        <Label htmlFor="system-apps" className="text-sm font-medium cursor-pointer">System Apps</Label>
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleInstallClick} disabled={!selectedSerial}>
                        <Plus className="w-4 h-4" />
                        Install APK
                    </Button>
                    <Button size="icon-sm" variant="outline" onClick={refreshList} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </ToolbarRight>
            </Toolbar>

            <div className="flex flex-1 overflow-hidden">
                {/* Package List */}
                <div className="flex-1 overflow-y-auto p-2 border-r">
                    {!selectedSerial ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Smartphone className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a device to view packages</p>
                        </div>
                    ) : (loading && packages.length === 0) ? (
                        <FadeIn className="space-y-1 pt-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center px-4 py-2">
                                    <Skeleton className="w-9 h-9 mr-3 rounded-lg opacity-50" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-1/3 opacity-40" />
                                    </div>
                                </div>
                            ))}
                        </FadeIn>
                    ) : filteredPackages.length === 0 ? (
                        <FadeIn className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Package className="w-12 h-12 mb-4 opacity-20" />
                            <p>No packages found</p>
                        </FadeIn>
                    ) : (
                        <FadeIn className={`grid grid-cols-1 gap-1 content-start ${loading ? 'opacity-50 pointer-events-none transition-opacity duration-300' : ''}`}>
                            {filteredPackages.map((pkg) => (
                                <PackageListItem
                                    key={pkg.package_id}
                                    pkg={pkg}
                                    isSelected={selectedPkg?.package_id === pkg.package_id}
                                    onClick={handlePackageClick}
                                />
                            ))}
                        </FadeIn>
                    )}
                </div>

                {/* Details Panel */}
                {selectedPkg && (
                    <PackageDetailsPanel
                        pkg={selectedPkg}
                        details={details}
                        loading={detailsLoading}
                        actionLoading={actionLoading}
                        onClose={() => setSelectedPkg(null)}
                        onUninstall={handleUninstallClick}
                        onAction={handleAction}
                    />
                )}
            </div>

            <ConfirmDialog
                open={isUninstallAlertOpen}
                onOpenChange={setIsUninstallAlertOpen}
                title="Uninstall Package"
                description={
                    <span>
                        Are you sure you want to uninstall <span className="font-mono font-medium text-foreground">{selectedPkg?.package_id}</span>?
                        This action cannot be undone.
                    </span>
                }
                confirmText="Uninstall"
                variant="destructive"
                onConfirm={confirmUninstall}
                isLoading={isUninstalling}
            >
                {uninstallError && (
                    <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mt-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div className="font-medium break-all">{uninstallError}</div>
                    </div>
                )}
            </ConfirmDialog>

            <ConfirmDialog
                open={isClearDataAlertOpen}
                onOpenChange={setIsClearDataAlertOpen}
                title="Clear App Data"
                description={
                    <span>
                        Are you sure you want to clear data for <span className="font-mono font-medium text-foreground">{selectedPkg?.package_id}</span>?
                        This will permanently delete all files, settings, accounts, and databases.
                    </span>
                }
                confirmText="Clear Data"
                variant="destructive"
                onConfirm={confirmClearData}
                isLoading={isClearingData}
            />

            <InstallApkDialog
                open={isInstallDialogOpen}
                onOpenChange={setIsInstallDialogOpen}
                deviceSerial={selectedSerial}
                onInstallComplete={handleInstallComplete}
            />
        </div>
    );
}


