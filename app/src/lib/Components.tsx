export type MultiSelectProps = {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
  };