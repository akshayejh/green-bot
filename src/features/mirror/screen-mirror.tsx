import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle, Maximize2, Terminal, Cpu, Cast, Download, RefreshCw } from "lucide-react";
import { useDeviceStore } from "@/store/device-store";

export function ScreenMirror() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mirroring, setMirroring] = useState(false);

    // Scrcpy Check State
    const [hasScrcpy, setHasScrcpy] = useState<boolean | null>(null);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        checkScrcpy();

        // Listen for scrcpy exit events
        const unlisten = listen<string>("scrcpy-response", (event) => {
            const payload = event.payload;
            setStatus(payload);
            if (payload.includes("Session ended")) {
                setMirroring(false);
                setLoading(false);
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const checkScrcpy = async () => {
        try {
            const installed = await invoke<boolean>("check_scrcpy");
            setHasScrcpy(installed);
        } catch (err) {
            console.error("Failed to check scrcpy:", err);
            // Assume true/ignore error or show generic error
            setHasScrcpy(false);
        }
    };

    const installScrcpy = async () => {
        setInstalling(true);
        setError(null);
        try {
            const res = await invoke<string>("install_scrcpy");
            setStatus(res);
            await checkScrcpy();
        } catch (err) {
            setError(String(err));
        } finally {
            setInstalling(false);
        }
    };

    const startMirror = async () => {
        if (!selectedSerial) return;
        setLoading(true);
        setError(null);
        setStatus("Initializing connection...");

        // Simulate connection steps for better UX
        setTimeout(async () => {
            try {
                setStatus("Launching scrcpy...");
                await invoke<string>("start_screen_mirror", { device: selectedSerial });
                // Note: The immediate return is usually just the success message/PID
                // The actual mirroring happens in the background.
                setMirroring(true);
            } catch (err) {
                setError(String(err));
                setStatus("");
                setMirroring(false);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const stopMirror = async () => {
        // Since we don't have a direct stop command yet, we simulate it or rely on window close.
        // In a real app, we'd invoke("stop_mirror") here.
        // For now, let's reset the UI and explain.
        setStatus("Stopping...");
        setMirroring(false); // Optimistic update
        // Optional: invoke("kill_scrcpy") if implemented
    };

    if (hasScrcpy === false) {
        return (
            <div className="flex bg-background h-full text-foreground overflow-hidden relative items-center justify-center p-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                <div className="max-w-md w-full space-y-8 z-10 text-center">
                    <div className="flex justify-center">
                        <div className="bg-destructive/10 p-6 rounded-full ring-1 ring-destructive/20 shadow-2xl">
                            <AlertCircle className="w-16 h-16 text-destructive" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">Dependency Missing</h1>
                        <p className="text-muted-foreground text-lg">
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">scrcpy</code> is required to mirror your device screen but it was not found on your system.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4 text-left">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                                <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-mono text-xs">Recommended installation:</p>
                                    <p className="font-mono text-foreground font-semibold">brew install scrcpy</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {status && !error && (
                                <div className="p-3 text-sm rounded-md bg-muted text-muted-foreground border flex items-center gap-2 font-mono">
                                    <Terminal className="w-3 h-3" />
                                    <span className="truncate">{status}</span>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={installScrcpy}
                                disabled={installing}
                            >
                                {installing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Installing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Install Automatically
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-background h-full text-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            {/* Radial fade for background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,transparent,var(--background))] pointer-events-none"></div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Controls */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary shadow hover:bg-primary/20">
                                <Cast className="w-3 h-3 mr-1" />
                                V2.0 Renderer
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent pb-1">
                                Zero-Latency <br /> Android Mirroring
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                                Stream and control your device in real-time.
                                High-performance low-latency mirroring powered by <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">scrcpy</code>.
                            </p>
                        </div>

                        {/* Main content */}
                        <div className="p-2 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-2">

                            {error && (
                                <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {status && !error && (
                                <div className="p-3 text-sm rounded-md bg-muted text-muted-foreground border flex items-center gap-2 font-mono">
                                    <Terminal className="w-3 h-3" />
                                    <span className="truncate">{status}</span>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className={`w-full text-base h-12 shadow-md hover:shadow-lg transition-all ${mirroring ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
                                onClick={mirroring ? stopMirror : startMirror}
                                disabled={(!selectedSerial || loading || mirroring)}
                            >
                                {loading ? (
                                    <>
                                        Connecting...
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    </>
                                ) : mirroring ? (
                                    <>
                                        Close Window to Stop
                                        <div className="w-3 h-3 bg-current rounded-sm" />
                                    </>
                                ) : (
                                    <>
                                        Start Stream
                                        <Play className="w-4 h-4 fill-current" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                <span>H.264 / H.265</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Maximize2 className="w-4 h-4" />
                                <span>Up to 60fps</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Illustration */}
                    <div className="relative hidden lg:flex items-center justify-center perspective-1000 group">
                        <div className="relative z-10 bg-zinc-950 rounded-[2.5rem] border-[6px] border-zinc-900 ring-1 ring-white/10 p-1 shadow-2xl w-[300px] h-[600px] transform transition-all duration-700 ease-out rotate-y-12 rotate-x-6 group-hover:rotate-y-0 group-hover:rotate-x-0 group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">

                            {/* Screen */}
                            <div className="h-full w-full bg-zinc-50 dark:bg-zinc-950 rounded-[2.2rem] overflow-hidden relative border border-black/5 dark:border-white/5 shadow-inner">

                                {/* Top Hole Punch Camera (Center) */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-20 flex items-center justify-center ring-1 ring-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a1b1e]"></div>
                                </div>

                                {/* Status Bar Sim */}
                                <div className="absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-6 pt-3 z-20 opacity-70">
                                    <div className="text-[10px] font-mono font-medium text-zinc-900 dark:text-white/50">12:00</div>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-sm border border-zinc-900/30 dark:border-white/30"></div>
                                        <div className="w-3 h-3 rounded-full border border-zinc-900/30 dark:border-white/30"></div>
                                    </div>
                                </div>

                                {/* Simulated UI Content (Android / Material You) */}
                                <div className="absolute inset-0 flex flex-col opacity-100">
                                    {/* Wallpaper */}
                                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950"></div>

                                    {/* At a Glance Widget */}
                                    <div className="mt-20 px-6 z-10 space-y-1">
                                        <div className="text-4xl font-light text-zinc-800 dark:text-white/90 font-sans tracking-tight">12:00</div>
                                        <div className="text-xs font-medium text-zinc-500 dark:text-white/60">Tue, Jan 15</div>
                                    </div>

                                    {/* App Icons Grid */}
                                    <div className="flex-1 px-5 pt-12 z-10">
                                        <div className="grid grid-cols-4 gap-x-2 gap-y-8 place-items-center">
                                            {/* Top Row Apps */}
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="flex flex-col items-center gap-1.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 shadow-sm"></div>
                                                    <div className="w-8 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800/50"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dock (Material Search Bar + Apps) */}
                                    <div className="mt-auto mb-4 px-4 z-10 space-y-4">

                                        {/* Material Search Bar */}
                                        <div className="h-12 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full border border-black/5 dark:border-white/5 flex items-center px-4 justify-between backdrop-blur-sm mx-1">
                                            <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700/50"></div>
                                            <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700/50"></div>
                                        </div>

                                        {/* Dock Apps */}
                                        <div className="flex items-center justify-between px-2 pb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800/90 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-black/20"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gesture Navigation Bar */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-300 dark:bg-white/40 rounded-full z-20"></div>
                                </div>

                                {/* Scan Line Animation (Subtler) */}
                                {(loading || mirroring) && (
                                    <div className="absolute inset-0 z-30 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20%] w-full animate-scan blur-md"></div>
                                )}

                                {/* Glossy Reflection (Subtler) */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none rounded-[1.8rem]"></div>
                            </div>

                            {/* Buttons (Right Side Only - Pixel Style) */}
                            <div className="absolute top-32 -right-[6px] w-[6px] h-10 bg-zinc-800 rounded-r-md border-r border-zinc-700"></div> {/* Power */}
                            <div className="absolute top-48 -right-[6px] w-[6px] h-16 bg-zinc-900 rounded-r-md border-r border-zinc-800 shadow-sm"></div> {/* Vol Rocker */}
                        </div>

                        {/* Background Decor (Dimmed) */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-200/50 dark:bg-zinc-500/5 rounded-full blur-[80px] group-hover:bg-zinc-300/50 dark:group-hover:bg-zinc-500/10 transition-colors duration-700"></div>
                    </div>

                </div>
            </div>

            <style>{`
        .perspective-1000 {
            perspective: 1000px;
        }
        .rotate-y-12 {
            transform: rotateY(-12deg) rotateX(5deg);
        }
        @keyframes scan {
            0% { top: -20%; }
            100% { top: 120%; }
        }
        .animate-scan {
            animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
        </div >
    );
}

