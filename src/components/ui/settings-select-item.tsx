import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsItem } from "./settings-item";

interface SelectOption {
    value: string;
    label: string;
}

interface SettingsSelectItemProps {
    label: string;
    description?: string;
    value: string;
    onValueChange: (value: string | null) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    triggerClassName?: string;
}

export function SettingsSelectItem({
    label,
    description,
    value,
    onValueChange,
    options,
    placeholder,
    disabled,
    triggerClassName = "w-32"
}: SettingsSelectItemProps) {
    return (
        <SettingsItem label={label} description={description}>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className={triggerClassName}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </SettingsItem>
    );
}
