import { Switch } from "@/components/ui/switch";
import { SettingsItem } from "./settings-item";

interface SettingsSwitchItemProps {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function SettingsSwitchItem({
    label,
    description,
    checked,
    onCheckedChange,
    disabled
}: SettingsSwitchItemProps) {
    return (
        <SettingsItem label={label} description={description}>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
        </SettingsItem>
    );
}
