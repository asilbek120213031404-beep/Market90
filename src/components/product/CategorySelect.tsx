import { useCategories } from "../../hooks/useCategories";

/** Bazadagi kategoriyalar ro'yxati */
const CategorySelect = ({
  id,
  value,
  onChange,
  className,
}: {
  id?: string;
  value: string;
  onChange: (name: string) => void;
  className: string;
}) => {
  const { data: categories = [] } = useCategories();

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} cursor-pointer`}
    >
      <option value="">— Kategoriya tanlang —</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
