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
}

export function TextInput<T extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  register,
  icon,
  error,
}: TextInputProps<T>) {
  return (
    <div
      className={`form-control w-full text-gray-400 ${
        error?.message && '!text-error'
      }`}
    >
      <label className={`label p-0 ml-4`}>
        <span
          className={`label-text leading-6 ${error?.message && '!text-error'}`}
        >
          {label}
        </span>
      </label>
      <div className="relative focus-within:text-gray-600">
        <div className="pointer-events-none w-6 h-6 absolute top-1/2 transform -translate-y-1/2 left-3">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className={`input w-full text-sm bg-lightHover text-gray-600 leading-6 placeholder:font-normal focus-within:placeholder:font-normal font-bold ${
            error?.message && '!input-error !bg-error !bg-opacity-20'
          } ${icon && 'pl-12'}`}
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
