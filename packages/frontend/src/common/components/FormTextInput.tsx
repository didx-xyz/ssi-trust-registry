import { ReactComponentElement } from 'react'
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { TextSm } from './Typography'

interface TextInputProps<T extends FieldValues> {
  type: string
  name: Path<T>
  label: string
  placeholder: string
  register: UseFormRegister<T>
  icon?: ReactComponentElement<any>
  error?: FieldError
  onChange?: () => void
}

export function FormTextInput<T extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  register,
  icon,
  error,
  onChange,
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
          {...register(name, {
            onChange: () => onChange && onChange(),
          })}
        />
      </div>
      <div className="ml-4">
        {error?.message && (
          <TextSm className="text-error text-left">{error?.message}</TextSm>
        )}
      </div>
    </div>
  )
}
