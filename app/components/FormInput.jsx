export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="
          block
          text-[0.65rem]
          text-[#213131]
          mb-[5px]
          tracking-[1px]
          font-semibold
        "
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        className="
          w-full
          py-2
          bg-transparent
          text-[#213131]
          border-none
          border-b
          border-b-[#213131]
          outline-none
          font-['Poppins']
          text-base
        "
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}