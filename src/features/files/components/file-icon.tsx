import {
    Folder,
    File,
    Image,
    Video,
    Music,
    FileCode,
    FileText,
    FileJson,
    Archive,
    Box,
    FileTerminal,
    FileSpreadsheet,
    FileType
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
    name: string;
    isDirectory: boolean;
    className?: string;
}

export function FileIcon({ name, isDirectory, className }: FileIconProps) {
    if (isDirectory) {
        return <Folder className={cn("text-blue-400 fill-blue-400/20", className)} />;
    }

    const extension = name.split('.').pop()?.toLowerCase();

    switch (extension) {
        // Images
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'svg':
        case 'webp':
        case 'ico':
            return <Image className={cn("text-purple-400", className)} />;

        // Video
        case 'mp4':
        case 'mkv':
        case 'avi':
        case 'mov':
        case 'webm':
        case '3gp':
            return <Video className={cn("text-red-400", className)} />;

        // Audio
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'm4a':
        case 'ogg':
        case 'aac':
            return <Music className={cn("text-pink-400", className)} />;

        // Code
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'css':
        case 'html':
        case 'py':
        case 'rs':
        case 'c':
        case 'cpp':
        case 'java':
        case 'php':
        case 'rb':
        case 'go':
        case 'swift':
        case 'kt':
        case 'xml':
            return <FileCode className={cn("text-yellow-400", className)} />;

        case 'json':
        case 'yaml':
        case 'yml':
        case 'toml':
            return <FileJson className={cn("text-yellow-500", className)} />;

        case 'sh':
        case 'bash':
        case 'zsh':
            return <FileTerminal className={cn("text-green-500", className)} />;

        // Documents
        case 'txt':
        case 'md':
        case 'log':
        case 'rtf':
            return <FileText className={cn("text-slate-400", className)} />;

        case 'pdf':
            return <FileText className={cn("text-red-500", className)} />;

        case 'csv':
        case 'xlsx':
        case 'xls':
            return <FileSpreadsheet className={cn("text-green-600", className)} />;

        // Archives
        case 'zip':
        case 'tar':
        case 'gz':
        case 'rar':
        case '7z':
            return <Archive className={cn("text-orange-400", className)} />;

        // Packages
        case 'apk':
        case 'apks':
        case 'xapk':
            return <Box className={cn("text-emerald-500", className)} />;

        case 'ttf':
        case 'otf':
        case 'woff':
        case 'woff2':
            return <FileType className={cn("text-slate-500", className)} />;

        default:
            return <File className={cn("text-muted-foreground", className)} />;
    }
}
