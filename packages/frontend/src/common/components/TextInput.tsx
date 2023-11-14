import { ReactComponentElement } from 'react'
import { FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface TextInputProps<T extends FieldValues> {
  type: string
  name: Path<T>
  label: string
  placeholder: string
  register: UseFormRegister<T>
  icon?: ReactComponentElement<any>
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
  additionalClasses,
  additionalLabelClasses,
  additionalInputClasses,
}: TextInputProps<T>) {
  return (
    <div className={`form-control w-full ${additionalClasses}`}>
      <label className={`label ${additionalLabelClasses}`}>
        <span className="label-text">{label}</span>
      </label>
      <div className="relative text-gray-400 focus-within:text-gray-600">
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          className={`input input-bordered w-full ${additionalInputClasses} ${
            icon && 'pl-12'
          }`}
          {...register(name)}
        />
      </div>
    </div>
  )
}
