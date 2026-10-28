import { groupDigits } from "../../lib/format";

/** Narx maydoni: "12 500" ko'rinishida chiqaradi, qiymatni faqat raqamlar bilan qaytaradi */
const PriceInput = ({
  id,
  value,
  onChange,
  className,
  placeholder = "0",
  ariaLabel,
  unitClassName,
}: {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  className: string;
  placeholder?: string;
  ariaLabel?: string;
  unitClassName: string;
}) => (
  <div className="relative">
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={groupDigits(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}
      className={`${className} pr-14`}
    />
    <span className={unitClassName}>so'm</span>
  </div>
);

export default PriceInput;
