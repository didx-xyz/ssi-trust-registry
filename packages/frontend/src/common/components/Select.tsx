import { ReactComponentElement } from 'react'
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface Option<T extends string | number | readonly string[] | undefined> {
  value: T
  label: string
}

interface SelectProps<
  T extends FieldValues,
  O extends string | number | readonly string[] | undefined,
> {
  options: Option<O>[]
  name: Path<T>
  label: string
  placeholder: string
  register: UseFormRegister<T>
  icon?: ReactComponentElement<any>
  error?: FieldError
  additionalClasses?: string
  additionalLabelClasses?: string
  additionalInputClasses?: string
}

export function Select<
  T extends FieldValues,
  O extends string | number | readonly string[] | undefined,
>({
  options,
  name,
  label,
  placeholder,
  register,
  icon,
  error,
  additionalClasses,
  additionalLabelClasses,
  additionalInputClasses,
}: SelectProps<T, O>) {
  return (
    <div
      className={`form-control w-full text-gray-400 ${
        error?.message && 'text-error'
      } ${additionalClasses}`}
    >
      <label className={`label p-0 ml-4`}>
        <span
          className={`label-text leading-6 ${
            error?.message && 'text-error'
          } ${additionalLabelClasses}`}
        >
          {label}
        </span>
      </label>
      <div className="relative focus-within:text-gray-600">
        {icon}
        <select
          required
          className={`select w-full text-sm bg-lightHover text-gray-600 leading-6 font-bold invalid:font-normal invalid:text-opacity-60 ${
            error?.message && 'input-error bg-error bg-opacity-20'
          } ${icon && 'pl-12'} ${additionalInputClasses} `}
          {...register(name)}
        >
          <option disabled selected value={''}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={JSON.stringify(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error?.message && (
        <p className="text-error text-left ml-4 text-sm leading-6">
          {error?.message}
        </p>
      )}
    </div>
  )
}
