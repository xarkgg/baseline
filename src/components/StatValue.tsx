type StatValueProps = {
  value: number | null | undefined;
};

export default function StatValue({ value }: StatValueProps) {
  if (value === undefined) {
    return "_";
  }

  return value === null ? "_" : value.toLocaleString();
}
