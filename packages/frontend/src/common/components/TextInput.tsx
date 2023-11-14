import { ReactComponentElement } from 'react'
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface TextInputProps<T extends FieldValues> {
  type: string
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

export function TextInput<T extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  register,
  icon,
  error,
  additionalClasses,
  additionalLabelClasses,
  additionalInputClasses,
}: TextInputProps<T>) {
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
        <input
          type={type}
          placeholder={placeholder}
          className={`input w-full text-sm bg-lightHover leading-6 placeholder:font-normal focus-within:placeholder:font-normal focus-within:font-bold ${
            error?.message && 'input-error bg-error bg-opacity-20'
          } ${icon && 'pl-12'} ${additionalInputClasses} `}
          {...register(name)}
        />
      </div>
      {error?.message && (
        <p className="text-error text-left ml-4 text-sm leading-6">
          {error?.message}
        </p>
      )}
    </div>
  )
}
